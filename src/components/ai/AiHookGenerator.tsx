import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUpgradeStore } from "../../store/upgradeStore";
import { useIdeaStore } from "../../store/ideaStore";
import { toast } from "../../utils/toast";
import { analyzeHook } from "../../lib/hookAnalytics";
import { getUserPlan } from "../../lib/plans";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface GeneratedHook {
  text: string;
  score: number;
}

export default function AiHookGenerator() {
  const { user } = useAuth();
  const openUpgradeModal = useUpgradeStore((state) => state.openUpgradeModal);
  const createIdea = useIdeaStore((state) => state.createIdea);
  const updateIdea = useIdeaStore((state) => state.updateIdea);

  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHooks, setGeneratedHooks] = useState<GeneratedHook[]>([]);

  const tones = [
    "professional",
    "casual",
    "bold",
    "curious",
    "urgent",
    "inspirational",
  ];

  const handleGenerate = async () => {
    if (!user?.id) {
      toast("You need to be logged in", { type: "error" });
      return;
    }

    if (!topic || !audience || !tone) {
      toast("Please fill in all fields", { type: "error" });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/generate-hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          topic,
          audience,
          tone,
        }),
      });

      const data = (await response.json()) as
        | { hooks: string[] }
        | { error: string };

      if (!response.ok) {
        throw new Error(
          (data as { error: string }).error || "Failed to generate hooks",
        );
      }

      if ((data as { hooks: string[] }).hooks?.length) {
        const hooks = (data as { hooks: string[] }).hooks.map((hook) => ({
          text: hook,
          score: analyzeHook(hook).hookScore,
        }));
        setGeneratedHooks(hooks);
        toast("Generated 5 viral hooks", { type: "success" });
      } else {
        throw new Error("No hooks generated");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate hooks";
      toast(message, { type: "error" });

      if (message.includes("Creator plan")) {
        openUpgradeModal();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyHook = async (hook: string) => {
    await navigator.clipboard.writeText(hook);
    toast("Hook copied to clipboard", { type: "success" });
  };

  const handleSaveToIdea = async (hook: string) => {
    if (!user?.id) return;

    const ideaId = await createIdea(user.id);
    if (ideaId) {
      await updateIdea(ideaId, {
        title: topic || "AI Generated Hook",
        hook,
        tags: ["ai-generated", tone],
      });
      toast("Hook saved to new idea", { type: "success" });
    }
  };

  return (
    <Card hoverable={false} padding="lg" className="w-full">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white/90">
            AI Hook Generator
          </h3>
          <p className="text-sm text-white/50">
            Generate viral hooks with AI (Creator plan only)
          </p>
        </div>

        <div className="grid gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., productivity tips for developers"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/80 placeholder-white/30 focus:border-[#7C5CFF]/50 focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">
              Audience
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., junior developers, founders, marketers"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/80 placeholder-white/30 focus:border-[#7C5CFF]/50 focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">
              Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`rounded-md border px-3 py-1.5 text-xs transition-all ${
                    tone === t
                      ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-white"
                      : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-white/[0.14] hover:text-white/80"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !topic || !audience}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Hooks"}
        </Button>

        {generatedHooks.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-white/70">
              Generated Hooks
            </h4>
            {generatedHooks.map((hook, index) => (
              <Card
                key={index}
                hoverable
                padding="md"
                className="group relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-white/80">{hook.text}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${
                          hook.score >= 70
                            ? "text-[#7C5CFF]"
                            : hook.score >= 40
                            ? "text-white/60"
                            : "text-white/40"
                        }`}
                      >
                        Score: {hook.score}/100
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyHook(hook.text)}
                      title="Copy hook"
                    >
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveToIdea(hook.text)}
                      title="Save to idea"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
