import express from "express";
import Stripe from "stripe";
import { getEnv, maybeGetEnv } from "./env.js";
import { supabaseAdmin } from "./supabaseAdmin.js";

const app = express();
const port = Number(getEnv("API_PORT", "4242"));
const stripeSecretKey = maybeGetEnv("STRIPE_SECRET_KEY");
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const stripePriceId = maybeGetEnv("STRIPE_PRO_PRICE_ID");
const stripeWebhookSecret = maybeGetEnv("STRIPE_WEBHOOK_SECRET");
const appUrl = getEnv("APP_URL", "http://localhost:5173");

function assertStripeConfigured(response) {
  if (!stripe || !stripePriceId || !stripeWebhookSecret || !supabaseAdmin) {
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

app.post("/api/create-checkout-session", async (request, response) => {
  if (!assertStripeConfigured(response)) {
    return;
  }

  try {
    const { userId, email } = request.body ?? {};

    if (!userId) {
      response.status(400).json({ error: "Missing userId" });
      return;
    }

    const origin = getOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      client_reference_id: userId,
      success_url: `${origin}/dashboard?upgrade=success`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        user_id: userId,
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
