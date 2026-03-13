import IdeaCard from "./IdeaCard";
import IdeaExpansionModal from "./ideas/IdeaExpansionModal";
import { useIdeaStore } from "../store/ideaStore";
import Button from "./ui/Button";
import Container from "./ui/Container";
import SectionHeader from "./ui/SectionHeader";
import { useMemo, useState } from "react";

const getBentoClasses = (index: number) => {
  if (index === 0) {
    return "col-span-1 row-span-1 sm:col-span-2 xl:col-span-2";
  }

  if (index % 5 === 0) {
    return "col-span-1 row-span-1 xl:col-span-2";
  }

  return "col-span-1 row-span-1";
};

export default function Dashboard() {
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);
  const ideas = useIdeaStore((state) => state.ideas);
  const lastCreatedIdeaId = useIdeaStore((state) => state.lastCreatedIdeaId);
  const addIdea = useIdeaStore((state) => state.addIdea);

  const expandedIdea = useMemo(
    () => ideas.find((idea) => idea.id === expandedIdeaId) ?? null,
    [ideas, expandedIdeaId],
  );

  return (
    <Container className="py-8">
      <SectionHeader
        title="Ideas"
        subtitle={`${ideas.length} ideas — sorted by latest`}
        className="mb-6"
      />

      {/* Primary CTA */}
      <div className="mb-8">
        <Button variant="primary" size="md" onClick={addIdea}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 1v10M1 6h10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          New Idea
        </Button>
      </div>

      {/* Ideas grid */}
      {ideas.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#121212] px-5 py-6 text-[13px] text-white/40">
          No ideas yet. Start by creating one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ideas.map((idea, index) => (
            <div key={idea.id} className={getBentoClasses(index)}>
              <IdeaCard
                id={idea.id}
                title={idea.title}
                tags={idea.tags}
                isNew={idea.id === lastCreatedIdeaId}
                onOpen={() => setExpandedIdeaId(idea.id)}
              />
            </div>
          ))}
        </div>
      )}

      {expandedIdea && (
        <IdeaExpansionModal
          idea={expandedIdea}
          onClose={() => setExpandedIdeaId(null)}
        />
      )}
    </Container>
  );
}
