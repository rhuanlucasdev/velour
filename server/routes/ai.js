import { Router } from "express";
import { supabaseAdmin } from "../supabaseAdmin.js";
import { generateHooks } from "../services/hookGenerator.js";

const router = Router();

router.post("/generate-hooks", async (request, response) => {
  try {
    const { userId, topic, tone, audience } = request.body ?? {};

    if (!userId) {
      response.status(400).json({ error: "Missing userId" });
      return;
    }

    if (!topic || !tone || !audience) {
      response.status(400).json({
        error: "Missing required fields: topic, tone, audience",
      });
      return;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError) {
      throw userError;
    }

    const userPlan = String(
      userData?.user?.app_metadata?.plan ??
        userData?.user?.user_metadata?.plan ??
        ""
    ).toLowerCase();

    if (userPlan !== "creator") {
      response.status(403).json({
        error: "AI hook generator is only available for Creator plan",
      });
      return;
    }

    const result = await generateHooks({ topic, tone, audience });

    response.json(result);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

export { router as aiRouter };
