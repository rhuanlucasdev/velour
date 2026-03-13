interface LinkedInPreviewProps {
  hook: string;
  insight: string;
  twist: string;
  cta: string;
}

const joinContent = (...parts: string[]) =>
  parts.filter((part) => part.trim().length > 0).join("\n\n");

export default function LinkedInPreview({
  hook,
  insight,
  twist,
  cta,
}: LinkedInPreviewProps) {
  const content =
    joinContent(hook, insight, twist, cta) ||
    "Your LinkedIn preview will appear here as you write.";

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#1C1C1C]/80 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[#7C5CFF]/20" />
        <div>
          <p className="text-[14px] font-semibold text-white/90">
            Velour Creator
          </p>
          <p className="text-[12px] text-white/45">Content Strategist</p>
        </div>
      </div>

      <p className="whitespace-pre-line text-[14px] leading-relaxed text-white/85">
        {content}
      </p>
    </div>
  );
}
