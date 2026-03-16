import express from "express";
import Stripe from "stripe";
import { getEnv, maybeGetEnv } from "./env.js";
import { supabaseAdmin } from "./supabaseAdmin.js";

const app = express();
const port = Number(getEnv("API_PORT", "4242"));
const stripeSecretKey = maybeGetEnv("STRIPE_SECRET_KEY");
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const stripeProPriceId = maybeGetEnv("STRIPE_PRO_PRICE_ID");
const stripeCreatorPriceId = maybeGetEnv("STRIPE_CREATOR_PRICE_ID");
const stripeWebhookSecret = maybeGetEnv("STRIPE_WEBHOOK_SECRET");
const appUrl = getEnv("APP_URL", "http://localhost:5173");
const openAiApiKey = maybeGetEnv("OPENAI_API_KEY");
const openAiModel = getEnv("OPENAI_MODEL", "gpt-4.1-mini");

function assertStripeClientConfigured(response) {
  if (!stripe || !supabaseAdmin) {
    response.status(500).json({
      error:
        "Stripe backend is not fully configured. Add STRIPE_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY.",
    });
    return false;
  }

  return true;
}

function assertStripeConfigured(response) {
  if (
    !assertStripeClientConfigured(response) ||
    !stripeProPriceId ||
    !stripeWebhookSecret
  ) {
    response.status(500).json({
      error:
        "Stripe backend is not fully configured. Add STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_WEBHOOK_SECRET and SUPABASE_SERVICE_ROLE_KEY.",
    });
    return false;
  }

  return true;
}

function getOrigin(request) {
  return request.headers.origin || appUrl;
}

function extractHooksFromContent(content) {
  if (!content || typeof content !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed?.hooks)) {
      return [];
    }

    return parsed.hooks
      .map((hook) => (typeof hook === "string" ? hook.trim() : ""))
      .filter((hook) => hook.length > 0)
      .slice(0, 10);
  } catch {
    return content
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*(\d+\.|[-*])\s*/, "").trim())
      .filter((line) => line.length > 0)
      .slice(0, 10);
  }
}

async function upsertProfile(payload) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client is not configured");
  }

  const { error } = await supabaseAdmin.from("profiles").upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    throw error;
  }
}

async function updateUserPlanMetadata(userId, plan) {
  if (!supabaseAdmin || !userId || !plan) {
    return;
  }

  const { data: currentUserData, error: currentUserError } =
    await supabaseAdmin.auth.admin.getUserById(userId);

  if (currentUserError) {
    throw currentUserError;
  }

  const existingAppMetadata = currentUserData.user?.app_metadata ?? {};

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...existingAppMetadata,
      plan,
    },
  });

  if (error) {
    throw error;
  }
}

app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    if (!assertStripeConfigured(response)) {
      return;
    }

    const signature = request.headers["stripe-signature"];

    if (!signature) {
      response.status(400).send("Missing Stripe signature");
      return;
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        stripeWebhookSecret,
      );
    } catch (error) {
      response.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId =
            session.metadata?.user_id || session.client_reference_id;
          const requestedPlan =
            session.metadata?.requested_plan === "creator" ? "creator" : "pro";
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id;
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;

          if (userId) {
            await upsertProfile({
              id: userId,
              is_pro: true,
              stripe_customer_id: customerId ?? null,
              stripe_subscription_id: subscriptionId ?? null,
            });

            await updateUserPlanMetadata(userId, requestedPlan);
          }
          break;
        }
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const activeStatuses = new Set(["active", "trialing"]);
          const isPro =
            event.type !== "customer.subscription.deleted" &&
            activeStatuses.has(subscription.status);

          let query = supabaseAdmin
            .from("profiles")
            .update({
              is_pro: isPro,
              stripe_customer_id:
                typeof subscription.customer === "string"
                  ? subscription.customer
                  : null,
              stripe_subscription_id: subscription.id,
            })
            .eq("stripe_subscription_id", subscription.id);

          const { data, error } = await query.select("id");
          if (error) {
            throw error;
          }

          if (!data || data.length === 0) {
            const customerId =
              typeof subscription.customer === "string"
                ? subscription.customer
                : null;

            if (customerId) {
              const { error: fallbackError } = await supabaseAdmin
                .from("profiles")
                .update({
                  is_pro: isPro,
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subscription.id,
                })
                .eq("stripe_customer_id", customerId);

              if (fallbackError) {
                throw fallbackError;
              }
            }
          }
          break;
        }
        default:
          break;
      }

      response.json({ received: true });
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  },
);

app.use(express.json());

app.post("/api/generate-hooks", async (request, response) => {
  const { topic, audience, tone } = request.body ?? {};

  const normalizedTopic = typeof topic === "string" ? topic.trim() : "";
  const normalizedAudience =
    typeof audience === "string" ? audience.trim() : "";
  const normalizedTone = typeof tone === "string" ? tone.trim() : "";

  if (!normalizedTopic || !normalizedAudience || !normalizedTone) {
    response.status(400).json({
      error: "Missing required fields: topic, audience, tone.",
    });
    return;
  }

  if (!openAiApiKey) {
    response.status(500).json({
      error: "OpenAI is not configured. Add OPENAI_API_KEY.",
    });
    return;
  }

  try {
    const openAiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: openAiModel,
          temperature: 0.9,
          messages: [
            {
              role: "system",
              content:
                "You are a viral social media copywriter. Generate concise, high-performing opening hooks.",
            },
            {
              role: "user",
              content: `Generate exactly 10 hook options in JSON only. Return this exact shape: {\"hooks\":[\"...\"]}. Topic: ${normalizedTopic}. Audience: ${normalizedAudience}. Tone: ${normalizedTone}. Constraints: each hook must be one sentence, max 16 words, no hashtags, no emojis, no numbering.`,
            },
          ],
          response_format: {
            type: "json_object",
          },
        }),
      },
    );

    const openAiData = await openAiResponse.json();

    if (!openAiResponse.ok) {
      response.status(502).json({
        error:
          openAiData?.error?.message ||
          "OpenAI request failed while generating hooks.",
      });
      return;
    }

    const content = openAiData?.choices?.[0]?.message?.content;
    const hooks = extractHooksFromContent(content);

    if (hooks.length < 10) {
      response.status(502).json({
        error:
          "OpenAI did not return enough hooks. Please try again with more context.",
      });
      return;
    }

    response.json({ hooks: hooks.slice(0, 10) });
  } catch (error) {
    response.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to generate hooks.",
    });
  }
});

app.post("/api/create-portal-session", async (request, response) => {
  if (!assertStripeClientConfigured(response)) {
    return;
  }

  try {
    const { userId } = request.body ?? {};

    if (!userId) {
      response.status(400).json({ error: "Missing userId" });
      return;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const customerId = profile?.stripe_customer_id;

    if (!customerId) {
      response.status(400).json({
        error:
          "No billing account found for this user yet. Complete a plan checkout first.",
      });
      return;
    }

    const origin = getOrigin(request);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/profile`,
    });

    response.json({ url: portalSession.url });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.post("/api/create-checkout-session", async (request, response) => {
  if (!assertStripeConfigured(response)) {
    return;
  }

  try {
    const { userId, email, plan } = request.body ?? {};

    if (!userId) {
      response.status(400).json({ error: "Missing userId" });
      return;
    }

    const requestedPlan = plan === "creator" ? "creator" : "pro";
    const priceId =
      requestedPlan === "creator" ? stripeCreatorPriceId : stripeProPriceId;

    if (!priceId) {
      response.status(500).json({
        error:
          requestedPlan === "creator"
            ? "Creator plan is not configured. Add STRIPE_CREATOR_PRICE_ID."
            : "Pro plan is not configured. Add STRIPE_PRO_PRICE_ID.",
      });
      return;
    }

    const origin = getOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      client_reference_id: userId,
      success_url: `${origin}/dashboard?upgrade=success`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        user_id: userId,
        requested_plan: requestedPlan,
      },
    });

    response.json({ url: session.url });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Stripe API server listening on http://localhost:${port}`);
});
