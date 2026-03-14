import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import IdeaExpansionModal from "../components/ideas/IdeaExpansionModal";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";
import { useAuth } from "../context/AuthContext";
import { canUseFeature, getUserPlan } from "../lib/plans";
import { useIdeaStore } from "../store/ideaStore";
import type { Idea } from "../types/idea";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (date: Date) => {
  const clone = new Date(date);
  const day = clone.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  clone.setDate(clone.getDate() + mondayOffset);
  clone.setHours(0, 0, 0, 0);
  return clone;
};

function CalendarIdeaCard({
  idea,
  onOpen,
}: {
  idea: Idea;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `idea-${idea.id}`,
      data: { ideaId: idea.id },
    });

  return (
    <motion.button
      ref={setNodeRef}
      type="button"
      onClick={onOpen}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      className={`group w-full cursor-grab touch-none rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-left transition-all duration-200 hover:border-[#7C5CFF]/35 hover:bg-white/[0.05] hover:shadow-[0_8px_18px_rgba(124,92,255,0.2)] active:cursor-grabbing ${
        isDragging ? "opacity-35" : "opacity-100"
      }`}
    >
      <p className="truncate text-sm font-medium text-white/88">{idea.title}</p>
    </motion.button>
  );
}

function DayDropZone({
  dayKey,
  label,
  dateLabel,
  children,
}: {
  dayKey: string;
  label: string;
  dateLabel: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayKey}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[210px] rounded-xl border p-3 backdrop-blur-lg transition-all duration-200 ${
        isOver
          ? "border-[#7C5CFF]/55 bg-[#7C5CFF]/14 shadow-[0_0_24px_rgba(124,92,255,0.22)]"
          : "border-white/[0.08] bg-white/[0.03]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
          {label}
        </p>
        <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/45">
          {dateLabel}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default function Calendar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const userPlan = getUserPlan({ user, profile });
  const canUseCalendar = canUseFeature("calendar", userPlan);

  const ideas = useIdeaStore((state) => state.ideas);
  const isLoading = useIdeaStore((state) => state.isLoading);
  const loadIdeas = useIdeaStore((state) => state.loadIdeas);
  const updateIdea = useIdeaStore((state) => state.updateIdea);

  const [activeDragIdeaId, setActiveDragIdeaId] = useState<string | null>(null);
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void loadIdeas(user.id);
  }, [loadIdeas, user?.id]);

  const weekStart = useMemo(() => getStartOfWeek(new Date()), []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return {
        key: formatDateKey(date),
        weekday: WEEKDAY_LABELS[index],
        dateLabel: `${date.getDate()}/${date.getMonth() + 1}`,
      };
    });
  }, [weekStart]);

  const weekDayKeys = useMemo(
    () => new Set(weekDays.map((day) => day.key)),
    [weekDays],
  );

  const ideasByDay = useMemo(() => {
    return weekDays.reduce<Record<string, Idea[]>>((acc, day) => {
      acc[day.key] = ideas.filter((idea) => idea.scheduledDate === day.key);
      return acc;
    }, {});
  }, [ideas, weekDays]);

  const backlogIdeas = useMemo(
    () =>
      ideas.filter(
        (idea) => !idea.scheduledDate || !weekDayKeys.has(idea.scheduledDate),
      ),
    [ideas, weekDayKeys],
  );

  const expandedIdea = useMemo(
    () => ideas.find((idea) => idea.id === expandedIdeaId) ?? null,
    [ideas, expandedIdeaId],
  );

  const activeDragIdea = useMemo(
    () => ideas.find((idea) => idea.id === activeDragIdeaId) ?? null,
    [ideas, activeDragIdeaId],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id).replace("idea-", "");
    setActiveDragIdeaId(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragIdeaId(null);

    const sourceIdeaId = String(event.active.id).replace("idea-", "");
    const targetId = event.over ? String(event.over.id) : null;

    if (!targetId) {
      return;
    }

    const idea = ideas.find((entry) => entry.id === sourceIdeaId);

    if (!idea) {
      return;
    }

    if (targetId === "unscheduled") {
      if (idea.scheduledDate !== null) {
        void updateIdea(idea.id, { scheduledDate: null });
      }
      return;
    }

    if (!targetId.startsWith("day-")) {
      return;
    }

    const nextDate = targetId.replace("day-", "");
    if (idea.scheduledDate === nextDate) {
      return;
    }

    void updateIdea(idea.id, { scheduledDate: nextDate });
  };

  if (!canUseCalendar) {
    return (
      <Container className="py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#7C5CFF]/25 bg-white/[0.03] p-6 text-center backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#c6b9ff]">
            Creator Feature
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white/92">
            Content Calendar is available on Creator plan
          </h2>
          <p className="mt-2 text-sm text-white/55">
            Upgrade to Creator to schedule ideas across your weekly publishing
            workflow.
          </p>
          <button
            type="button"
            onClick={() => navigate("/pricing")}
            className="mt-5 inline-flex items-center justify-center rounded-lg border border-transparent bg-[#7C5CFF] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#6B4EE0] hover:shadow-[0_0_22px_rgba(124,92,255,0.35)]"
          >
            View Creator Plan
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <SectionHeader
        title="Content Calendar"
        subtitle="Drag ideas into your week and click any card to edit."
        className="mb-6"
      />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="mb-6 grid gap-3">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
                Backlog / Outside This Week
              </p>
              <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/45">
                {backlogIdeas.length} ideas
              </span>
            </div>

            <BacklogDropZone>
              {isLoading ? (
                <p className="text-sm text-white/45">Loading ideas...</p>
              ) : backlogIdeas.length === 0 ? (
                <p className="text-sm text-white/40">No backlog ideas.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {backlogIdeas.map((idea) => (
                    <CalendarIdeaCard
                      key={`backlog-${idea.id}`}
                      idea={idea}
                      onOpen={() => setExpandedIdeaId(idea.id)}
                    />
                  ))}
                </div>
              )}
            </BacklogDropZone>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {weekDays.map((day) => (
            <DayDropZone
              key={day.key}
              dayKey={day.key}
              label={day.weekday}
              dateLabel={day.dateLabel}
            >
              {ideasByDay[day.key]?.length ? (
                ideasByDay[day.key].map((idea) => (
                  <CalendarIdeaCard
                    key={`${day.key}-${idea.id}`}
                    idea={idea}
                    onOpen={() => setExpandedIdeaId(idea.id)}
                  />
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-white/[0.1] px-2 py-4 text-center text-xs text-white/35">
                  Drop ideas here
                </p>
              )}
            </DayDropZone>
          ))}
        </div>

        <DragOverlay>
          {activeDragIdea ? (
            <div className="w-[250px]">
              <div className="rounded-lg border border-[#7C5CFF]/40 bg-[#151218]/95 px-3 py-2 text-sm font-medium text-white shadow-[0_18px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(124,92,255,0.25)]">
                {activeDragIdea.title}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {expandedIdea ? (
        <IdeaExpansionModal
          idea={expandedIdea}
          onClose={() => setExpandedIdeaId(null)}
        />
      ) : null}
    </Container>
  );
}

function BacklogDropZone({ children }: { children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "unscheduled" });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border p-2 transition-all duration-200 ${
        isOver
          ? "border-[#7C5CFF]/45 bg-[#7C5CFF]/12"
          : "border-white/[0.08] bg-black/10"
      }`}
    >
      {children}
    </div>
  );
}
