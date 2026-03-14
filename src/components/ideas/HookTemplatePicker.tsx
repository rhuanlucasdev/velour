import { hookTemplates } from "../../data/hookTemplates";
import { FREE_TEMPLATE_LIMIT } from "../../constants/freemium";
import { useAuth } from "../../context/AuthContext";
import { useIdeaStore } from "../../store/ideaStore";
import { useUpgradeStore } from "../../store/upgradeStore";

interface HookTemplatePickerProps {
  ideaId: string;
}

export default function HookTemplatePicker({
  ideaId,
}: HookTemplatePickerProps) {
  const { isPro } = useAuth();
  const updateIdea = useIdeaStore((state) => state.updateIdea);
  const openUpgradeModal = useUpgradeStore((state) => state.openUpgradeModal);

  return (
    <div>
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">
        Hook Templates
      </p>
      <div className="flex flex-wrap gap-2">
        {hookTemplates.map((template, index) => {
          const isLocked = !isPro && index >= FREE_TEMPLATE_LIMIT;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                if (isLocked) {
                  openUpgradeModal();
                  return;
                }

                void updateIdea(ideaId, { hook: template.content });
              }}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all duration-150 ${
                isLocked
                  ? "cursor-pointer border-purple-400/35 bg-purple-500/10 text-purple-200/90"
                  : "border-white/[0.08] bg-[#1C1C1C] text-white/70 hover:border-[#7C5CFF]/45 hover:text-white hover:shadow-[0_0_0_1px_rgba(124,92,255,0.2),0_0_16px_rgba(124,92,255,0.2)]"
              }`}
            >
              <span>{template.name}</span>
              {isLocked ? <span className="ml-2 text-[11px]">Pro Feature</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
