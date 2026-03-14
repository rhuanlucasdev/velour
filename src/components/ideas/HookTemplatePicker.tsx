import { hookTemplates } from "../../data/hookTemplates";
import { useIdeaStore } from "../../store/ideaStore";

interface HookTemplatePickerProps {
  ideaId: string;
}

export default function HookTemplatePicker({
  ideaId,
}: HookTemplatePickerProps) {
  const updateIdea = useIdeaStore((state) => state.updateIdea);

  return (
    <div>
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">
        Hook Templates
      </p>
      <div className="flex flex-wrap gap-2">
        {hookTemplates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => void updateIdea(ideaId, { hook: template.content })}
            className="rounded-full border border-white/[0.08] bg-[#1C1C1C] px-3 py-1.5 text-[12px] font-medium text-white/70 transition-all duration-150 hover:border-[#7C5CFF]/45 hover:text-white hover:shadow-[0_0_0_1px_rgba(124,92,255,0.2),0_0_16px_rgba(124,92,255,0.2)]"
          >
            {template.name}
          </button>
        ))}
      </div>
    </div>
  );
}
