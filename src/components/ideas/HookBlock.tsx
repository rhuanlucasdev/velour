import { useEffect, useRef } from "react";

interface HookBlockProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function HookBlock({
  title,
  value,
  onChange,
  placeholder,
}: HookBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 96)}px`;
  }, [value]);

  return (
    <section className="rounded-xl border border-white/[0.06] bg-[#1C1C1C]/70 p-4 transition-all duration-150 focus-within:border-[#7C5CFF]/60 focus-within:shadow-[0_0_0_1px_rgba(124,92,255,0.3),0_0_18px_rgba(124,92,255,0.18)]">
      <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">
        {title}
      </h3>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none overflow-hidden bg-transparent text-[14px] leading-relaxed text-white/90 outline-none placeholder:text-white/25"
        placeholder={placeholder}
      />
    </section>
  );
}
