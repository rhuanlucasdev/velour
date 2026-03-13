interface TagPillProps {
  label: string;
}

export default function TagPill({ label }: TagPillProps) {
  return (
    <span className="inline-flex rounded-full border border-white/[0.08] bg-[#1C1C1C] px-2.5 py-1 text-[11px] font-medium text-white/70 transition-all duration-150 hover:border-[#7C5CFF]/40 hover:text-white hover:shadow-[0_0_12px_rgba(124,92,255,0.2)]">
      {label}
    </span>
  );
}
