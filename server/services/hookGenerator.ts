import Groq from "groq-sdk";
import { getEnv } from "../env.js";

const groqApiKey = getEnv("GROQ_API_KEY");
const groq = new Groq({ apiKey: groqApiKey });

export interface HookGenerationRequest {
  topic: string;
  tone: string;
  audience: string;
}

export interface HookGenerationResponse {
  hooks: string[];
}

export async function generateHooks(
  request: HookGenerationRequest
): Promise<HookGenerationResponse> {
  const { topic, tone, audience } = request;

  const prompt = `You are a viral content strategist.

Generate 5 viral hooks for social media.

Topic: ${topic}
Audience: ${audience}
Tone: ${tone}

Hooks should:
- be short
- trigger curiosity
- stop scrolling
- be optimized for Twitter and LinkedIn

Return ONLY the hooks, one per line, without numbering or bullet points.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama3-8b-8192",
    temperature: 0.7,
    max_tokens: 500,
  });

  const content = completion.choices[0]?.message?.content ?? "";
  const hooks = content
    .split("\n")
    .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, 5);

  return { hooks };
}
