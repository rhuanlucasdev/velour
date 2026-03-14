import { useMemo, useState } from "react";
import { calculateHookScore } from "../../utils/calculateHookScore";
import { toast } from "../../utils/toast";

interface HookShareCardProps {
  hook: string;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      lines.push(line);
      line = word;
      return;
    }

    line = testLine;
  });

  if (line) {
    lines.push(line);
  }

  return lines;
};

export default function HookShareCard({ hook }: HookShareCardProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const score = useMemo(() => calculateHookScore(hook), [hook]);

  const shareLink = useMemo(() => {
    const baseUrl = window.location.origin;
    const encodedHook = encodeURIComponent(hook.trim());
    return `${baseUrl}/library?hook=${encodedHook}`;
  }, [hook]);

  const generateCardBlob = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas is not available");
    }

    const gradient = ctx.createLinearGradient(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
    );
    gradient.addColorStop(0, "#111124");
    gradient.addColorStop(0.55, "#17172A");
    gradient.addColorStop(1, "#1F1638");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "rgba(124, 92, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(220, 40, 260, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(124, 92, 255, 0.12)";
    ctx.beginPath();
    ctx.arc(1080, 620, 300, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(72, 72, 1056, 486);

    ctx.strokeStyle = "rgba(167, 139, 250, 0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(72, 72, 1056, 486);

    try {
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.src = `${window.location.origin}/brand/logo-mark.png`;
      await new Promise<void>((resolve, reject) => {
        logo.onload = () => resolve();
        logo.onerror = () => reject();
      });
      ctx.drawImage(logo, 96, 96, 44, 44);
    } catch {
      // Ignore logo drawing failures and continue.
    }

    ctx.fillStyle = "rgba(226, 217, 255, 0.95)";
    ctx.font = "600 30px Inter, sans-serif";
    ctx.fillText("Velour", 154, 128);

    ctx.fillStyle = "rgba(189, 172, 255, 0.9)";
    ctx.font = "600 24px Inter, sans-serif";
    ctx.fillText("Hook Score", 920, 130);

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "700 56px Inter, sans-serif";
    ctx.fillText(String(score), 1035, 132);

    const hookText = hook.trim() || "Your viral hook goes here...";
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.font = "600 52px Inter, sans-serif";

    const lines = wrapText(ctx, hookText, 930).slice(0, 4);

    lines.forEach((line, index) => {
      ctx.fillText(line, 102, 250 + index * 82);
    });

    ctx.fillStyle = "rgba(206, 195, 255, 0.88)";
    ctx.font = "500 24px Inter, sans-serif";
    ctx.fillText("Generated with Velour", 102, 534);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/png", 1);
    });

    if (!blob) {
      throw new Error("Could not generate image");
    }

    return blob;
  };

  const handleDownloadImage = async () => {
    if (!hook.trim()) {
      toast("Write a hook first to generate an image.", { type: "info" });
      return;
    }

    try {
      setIsGeneratingImage(true);
      const blob = await generateCardBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "velour-hook-card.png";
      link.click();
      URL.revokeObjectURL(url);
      toast("Hook image downloaded", { type: "success" });
    } catch {
      toast("Could not generate image", { type: "error" });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!hook.trim()) {
      toast("Write a hook first to share.", { type: "info" });
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      toast("Share link copied", { type: "success" });
    } catch {
      toast("Could not copy share link", { type: "error" });
    }
  };

  const handleShareTwitter = () => {
    if (!hook.trim()) {
      toast("Write a hook first to share.", { type: "info" });
      return;
    }

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      hook,
    )}&url=${encodeURIComponent(shareLink)}`;

    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedIn = () => {
    if (!hook.trim()) {
      toast("Write a hook first to share.", { type: "info" });
      return;
    }

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareLink,
    )}`;

    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#161616]/70 p-4 backdrop-blur-xl">
      <div className="relative overflow-hidden rounded-xl border border-[#7C5CFF]/24 bg-gradient-to-br from-[#171429] via-[#141426] to-[#1A1430] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.45),0_0_24px_rgba(124,92,255,0.22)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 15% 0%, rgba(124,92,255,0.24), transparent 46%)",
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/brand/logo-mark.png"
              alt="Velour"
              className="object-contain w-5 h-5 rounded-sm"
            />
            <p className="text-sm font-semibold tracking-tight text-white/92">
              Velour
            </p>
          </div>

          <span className="rounded-full border border-[#A48DFF]/35 bg-[#7C5CFF]/15 px-2.5 py-1 text-[11px] font-semibold text-[#D9CEFF]">
            Score {score}
          </span>
        </div>

        <p className="relative z-10 mt-4 text-base leading-relaxed text-white/92">
          {hook.trim() || "Type a hook above to generate your shareable card."}
        </p>

        <p className="relative z-10 mt-5 text-[11px] text-white/45">
          Generated with Velour
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          onClick={handleShareTwitter}
          className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 transition-all duration-150 hover:border-[#7C5CFF]/35 hover:bg-[#7C5CFF]/14"
        >
          Share to Twitter
        </button>

        <button
          type="button"
          onClick={handleShareLinkedIn}
          className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 transition-all duration-150 hover:border-[#7C5CFF]/35 hover:bg-[#7C5CFF]/14"
        >
          Share to LinkedIn
        </button>

        <button
          type="button"
          onClick={() => void handleDownloadImage()}
          disabled={isGeneratingImage}
          className="rounded-lg border border-[#7C5CFF]/35 bg-[#7C5CFF]/12 px-3 py-2 text-xs font-medium text-[#E0D6FF] transition-all duration-150 hover:border-[#A48DFF]/45 hover:bg-[#7C5CFF]/2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGeneratingImage ? "Generating..." : "Download Image"}
        </button>

        <button
          type="button"
          onClick={() => void handleCopyShareLink()}
          className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 transition-all duration-150 hover:border-[#7C5CFF]/35 hover:bg-[#7C5CFF]/14"
        >
          Copy Share Link
        </button>
      </div>
    </section>
  );
}
