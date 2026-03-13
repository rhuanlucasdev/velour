import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "../../utils/toast";
import Button from "../ui/Button";
import LinkedInPreview from "./LinkedInPreview";
import TwitterPreview from "./TwitterPreview";

interface PostPreviewModalProps {
  hook: string;
  insight: string;
  twist: string;
  cta: string;
  onClose: () => void;
}

type Platform = "twitter" | "linkedin";

const getPostText = (
  hook: string,
  insight: string,
  twist: string,
  cta: string,
) =>
  [hook, insight, twist, cta]
    .filter((value) => value.trim().length > 0)
    .join("\n\n");

export default function PostPreviewModal({
  hook,
  insight,
  twist,
  cta,
  onClose,
}: PostPreviewModalProps) {
  const [platform, setPlatform] = useState<Platform>("twitter");

  const postText = useMemo(
    () => getPostText(hook, insight, twist, cta),
    [hook, insight, twist, cta],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const copyText = async (label: string) => {
    try {
      await navigator.clipboard.writeText(postText);
      toast(`${label} copied to clipboard ✨`, { type: "success" });
    } catch {
      toast("Could not copy to clipboard", { type: "error" });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Post preview"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-[860px] rounded-2xl border border-white/[0.08] bg-[#121212]/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-white/[0.08] bg-[#1C1C1C]/70 p-1">
            <button
              type="button"
              onClick={() => setPlatform("twitter")}
              className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-all ${
                platform === "twitter"
                  ? "bg-[#7C5CFF]/20 text-white border border-[#7C5CFF]/35"
                  : "text-white/55 hover:text-white/85"
              }`}
            >
              Twitter
            </button>
            <button
              type="button"
              onClick={() => setPlatform("linkedin")}
              className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-all ${
                platform === "linkedin"
                  ? "bg-[#7C5CFF]/20 text-white border border-[#7C5CFF]/35"
                  : "text-white/55 hover:text-white/85"
              }`}
            >
              LinkedIn
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyText("Tweet")}
            >
              Copy as Tweet
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyText("LinkedIn post")}
            >
              Copy as LinkedIn Post
            </Button>
          </div>
        </div>

        {platform === "twitter" ? (
          <TwitterPreview
            hook={hook}
            insight={insight}
            twist={twist}
            cta={cta}
          />
        ) : (
          <LinkedInPreview
            hook={hook}
            insight={insight}
            twist={twist}
            cta={cta}
          />
        )}
      </motion.div>
    </div>
  );
}
