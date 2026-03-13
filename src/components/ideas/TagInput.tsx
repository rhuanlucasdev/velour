import { useRef, useState } from "react";

interface TagInputProps {
  onAddTag: (tag: string) => void;
}

export default function TagInput({ onAddTag }: TagInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const submitTag = () => {
    const tag = value.trim();

    if (tag.length > 0) {
      onAddTag(tag);
    }

    setValue("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsEditing(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        className="inline-flex rounded-full border border-white/[0.08] bg-[#1C1C1C] px-2.5 py-1 text-[11px] font-medium text-white/65 transition-all duration-150 hover:border-[#7C5CFF]/40 hover:text-white hover:shadow-[0_0_12px_rgba(124,92,255,0.2)]"
      >
        + Add Tag
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => {
        setValue("");
        setIsEditing(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          submitTag();
        }

        if (event.key === "Escape") {
          event.preventDefault();
          setValue("");
          setIsEditing(false);
        }
      }}
      className="w-[120px] rounded-full border border-[#7C5CFF]/45 bg-[#121212] px-2.5 py-1 text-[11px] font-medium text-white outline-none shadow-[0_0_12px_rgba(124,92,255,0.2)] placeholder:text-white/30"
      placeholder="Tag"
      aria-label="Add tag"
    />
  );
}
