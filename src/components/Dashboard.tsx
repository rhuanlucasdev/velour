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
import EmptyState from "./ideas/EmptyState";
import { useIdeaStore } from "../store/ideaStore";
import { toast } from "../utils/toast";
import Container from "./ui/Container";
import SectionHeader from "./ui/SectionHeader";
import Button from "./ui/Button";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Card from "./ui/Card";
import TagPill from "./ideas/TagPill";
import { useAuth } from "../context/AuthContext";
import { canCreateIdea, getUserPlan, plans } from "../lib/plans";
import { useUpgradeStore } from "../store/upgradeStore";
import OnboardingModal from "./onboarding/OnboardingModal";
import AiHookGenerator from "./ai/AiHookGenerator";

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
    transition: transition ?? "transform 200ms ease",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${getBentoClasses(index)} touch-none cursor-grab active:cursor-grabbing will-change-transform ${
        isDragging ? "z-50 opacity-0" : ""
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
  const { user, refreshProfile, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get("tab") ?? "ideas";
  const activeTab: "ideas" | "templates" | "drafts" =
    activeTabParam === "templates" || activeTabParam === "drafts"
      ? activeTabParam
      : "ideas";
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const ideas = useIdeaStore((state) => state.ideas);
  const isLoading = useIdeaStore((state) => state.isLoading);
  const lastCreatedIdeaId = useIdeaStore((state) => state.lastCreatedIdeaId);
  const createIdea = useIdeaStore((state) => state.createIdea);
  const loadIdeas = useIdeaStore((state) => state.loadIdeas);
  const reorderIdeas = useIdeaStore((state) => state.reorderIdeas);
  const resetIdeas = useIdeaStore((state) => state.resetIdeas);
  const openUpgradeModal = useUpgradeStore((state) => state.openUpgradeModal);

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
  const userPlan = getUserPlan({ user, profile });
  const maxIdeas = plans[userPlan].maxIdeas;
  const freeIdeasUsed =
    maxIdeas === null ? ideas.length : Math.min(ideas.length, maxIdeas);
  const freeUsageRatio = maxIdeas === null ? 0 : freeIdeasUsed / maxIdeas;

  const freeUsageToneClasses =
    freeUsageRatio < 0.5
      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
      : freeUsageRatio < 0.8
        ? "border-yellow-400/30 bg-yellow-500/10 text-yellow-200"
        : "border-red-400/30 bg-red-500/10 text-red-200";

  const tabTitle =
    activeTab === "templates"
      ? "Templates"
      : activeTab === "drafts"
        ? "Drafts"
        : "Ideas";

  const tabSubtitle =
    activeTab === "templates"
      ? "Template section coming soon"
      : activeTab === "drafts"
        ? "Drafts section coming soon"
        : isLoading
          ? "Loading your ideas..."
          : `${ideas.length} ideas — sorted by latest`;

  const onboardingStorageKey = user?.id
    ? `velour_onboarding_seen_${user.id}`
    : null;

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

  useEffect(() => {
    if (!user?.id) {
      resetIdeas();
      return;
    }

    void loadIdeas(user.id);
  }, [loadIdeas, resetIdeas, user?.id]);

  useEffect(() => {
    if (location.search.includes("upgrade=success") === false) {
      return;
    }

    toast("Velour Pro activated ✨", { type: "success" });
    void refreshProfile();
    navigate("/app?tab=ideas", { replace: true });
  }, [location.search, navigate, refreshProfile]);

  useEffect(() => {
    if (
      activeTabParam === "ideas" ||
      activeTabParam === "templates" ||
      activeTabParam === "drafts"
    ) {
      return;
    }

    setSearchParams({ tab: "ideas" }, { replace: true });
  }, [activeTabParam, setSearchParams]);

  useEffect(() => {
    if (
      activeTab !== "ideas" ||
      !user?.id ||
      isLoading ||
      !onboardingStorageKey
    ) {
      return;
    }

    if (ideas.length > 0) {
      localStorage.setItem(onboardingStorageKey, "true");
      setShowOnboarding(false);
      return;
    }

    const hasSeenOnboarding =
      localStorage.getItem(onboardingStorageKey) === "true";

    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [activeTab, ideas.length, isLoading, onboardingStorageKey, user?.id]);

  const handleCreateIdea = async () => {
    if (!user?.id) {
      toast("You need to be logged in to create ideas", { type: "error" });
      return;
    }

    if (!canCreateIdea(userPlan, ideas.length)) {
      const ideaLimit = plans[userPlan].maxIdeas;

      toast(
        `Idea limit reached (${ideaLimit ?? "unlimited"}) for ${userPlan} plan.`,
        { type: "info" },
      );
      openUpgradeModal();
      return;
    }

    const createdId = await createIdea(user.id);

    if (!createdId) {
      return;
    }

    setExpandedIdeaId(createdId);
    toast("Idea created ✅", { type: "success" });
  };

  const handleSkipOnboarding = () => {
    if (onboardingStorageKey) {
      localStorage.setItem(onboardingStorageKey, "true");
    }

    setShowOnboarding(false);
  };

  const handleStartCreatingFromOnboarding = async () => {
    if (onboardingStorageKey) {
      localStorage.setItem(onboardingStorageKey, "true");
    }

    setShowOnboarding(false);
    await handleCreateIdea();
  };

  return (
    <Container className="py-8">
      <SectionHeader
        title={tabTitle}
        subtitle={tabSubtitle}
        actions={
          <>
            {activeTab === "ideas" && maxIdeas !== null && !isLoading ? (
              <span
                className={`rounded-md border px-2.5 py-1 text-[11px] font-medium ${freeUsageToneClasses}`}
              >
                {userPlan === "free" ? "Free" : "Plan"}: {freeIdeasUsed}/
                {maxIdeas} ideas
              </span>
            ) : null}

            {activeTab === "ideas" ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => void handleCreateIdea()}
                className="group rounded-lg px-3.5 hover:scale-105 hover:shadow-[0_0_22px_rgba(124,92,255,0.4)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90"
                  aria-hidden="true"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                New Idea
              </Button>
            ) : null}
          </>
        }
        className="mb-6"
      />

      {/* AI Hook Generator - Creator plan only */}
      {activeTab === "ideas" && (
        <div className="mb-8">
          <AiHookGenerator />
        </div>
      )}

      {/* Ideas grid */}
      {activeTab !== "ideas" ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#121212] p-6 text-sm text-white/55">
          {activeTab === "templates"
            ? "Templates will be available here soon."
            : "Drafts will be available here soon."}
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#121212] p-6 text-sm text-white/55">
          Loading your ideas...
        </div>
      ) : ideas.length === 0 ? (
        <EmptyState onCreate={() => void handleCreateIdea()} />
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
              <div className="w-full max-w-[560px] scale-105 cursor-grabbing">
                <Card className="border-[#7C5CFF]/35 shadow-[0_24px_52px_rgba(0,0,0,0.6),0_0_30px_rgba(124,92,255,0.3)]">
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

      <OnboardingModal
        isOpen={showOnboarding}
        onSkip={handleSkipOnboarding}
        onStartCreating={() => void handleStartCreatingFromOnboarding()}
      />
    </Container>
  );
}
