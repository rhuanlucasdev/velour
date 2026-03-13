import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import IdeaCard from "./IdeaCard";
import IdeaExpansionModal from "./ideas/IdeaExpansionModal";
import { useIdeaStore } from "../store/ideaStore";
import Button from "./ui/Button";
import Container from "./ui/Container";
import SectionHeader from "./ui/SectionHeader";
import { useMemo, useState } from "react";
import Card from "./ui/Card";
import TagPill from "./ideas/TagPill";

const getBentoClasses = (index: number) => {
  if (index === 0) {
    return "col-span-1 row-span-1 sm:col-span-2 xl:col-span-2";
  }

  if (index % 5 === 0) {
    return "col-span-1 row-span-1 xl:col-span-2";
  }

  return "col-span-1 row-span-1";
};

interface SortableIdeaItemProps {
  id: string;
  index: number;
  title: string;
  tags: string[];
  isNew: boolean;
  disableOpen: boolean;
  onOpen: () => void;
}

function SortableIdeaItem({
  id,
  index,
  title,
  tags,
  isNew,
  disableOpen,
  onOpen,
}: SortableIdeaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${getBentoClasses(index)} touch-none cursor-grab active:cursor-grabbing ${
        isDragging ? "z-40 scale-[1.02]" : ""
      }`}
    >
      <IdeaCard
        id={id}
        title={title}
        tags={tags}
        isNew={isNew}
        disableOpen={disableOpen || isDragging}
        onOpen={onOpen}
      />
    </div>
  );
}

export default function Dashboard() {
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const ideas = useIdeaStore((state) => state.ideas);
  const lastCreatedIdeaId = useIdeaStore((state) => state.lastCreatedIdeaId);
  const addIdea = useIdeaStore((state) => state.addIdea);
  const reorderIdeas = useIdeaStore((state) => state.reorderIdeas);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const expandedIdea = useMemo(
    () => ideas.find((idea) => idea.id === expandedIdeaId) ?? null,
    [ideas, expandedIdeaId],
  );

  const activeDragIdea = useMemo(
    () => ideas.find((idea) => idea.id === activeDragId) ?? null,
    [ideas, activeDragId],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) {
      return;
    }

    reorderIdeas(String(active.id), String(over.id));
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={ideas.map((idea) => idea.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {ideas.map((idea, index) => (
                <SortableIdeaItem
                  key={idea.id}
                  id={idea.id}
                  index={index}
                  title={idea.title}
                  tags={idea.tags ?? []}
                  isNew={idea.id === lastCreatedIdeaId}
                  disableOpen={activeDragId !== null}
                  onOpen={() => setExpandedIdeaId(idea.id)}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeDragIdea ? (
              <div className="w-full max-w-[560px] scale-[1.03]">
                <Card className="border-[#7C5CFF]/35 shadow-[0_20px_45px_rgba(0,0,0,0.55),0_0_28px_rgba(124,92,255,0.28)]">
                  <div className="space-y-3">
                    <h3 className="text-[15px] font-semibold tracking-tight text-white/95">
                      {activeDragIdea.title}
                    </h3>

                    {activeDragIdea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {activeDragIdea.tags.slice(0, 3).map((tag) => (
                          <TagPill key={`overlay-${tag}`} label={tag} />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
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
