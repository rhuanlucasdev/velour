import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import IdeaExpansionModal from "../ideas/IdeaExpansionModal";
import TagPill from "../ideas/TagPill";
import { useIdeaStore } from "../../store/ideaStore";
import { toast } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";

type CommandItem =
  | {
      id: string;
      type: "action";
      label: string;
      description: string;
      run: () => void | Promise<void>;
    }
  | {
      id: string;
      type: "idea";
      label: string;
      tags: string[];
      ideaId: string;
    };

export default function CommandPalette() {
  const { user } = useAuth();
  const ideas = useIdeaStore((state) => state.ideas);
  const createIdea = useIdeaStore((state) => state.createIdea);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredIdeas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return ideas;
    }

    return ideas.filter((idea) => idea.title.toLowerCase().includes(q));
  }, [ideas, query]);

  const actionItems: CommandItem[] = useMemo(
    () => [
      {
        id: "action-create",
        type: "action",
        label: "Create New Idea",
        description: "Add a fresh idea card to your board",
        run: () => {
          if (!user?.id) {
            toast("You need to be logged in to create ideas", {
              type: "error",
            });
            return;
          }

          void createIdea(user.id).then((createdId) => {
            if (createdId) {
              toast("Idea created ✅", { type: "success" });
            }
          });
          setIsOpen(false);
        },
      },
      {
        id: "action-focus",
        type: "action",
        label: "Focus Search",
        description: "Focus the command search input",
        run: () => {
          inputRef.current?.focus();
        },
      },
      {
        id: "action-dashboard",
        type: "action",
        label: "Go to Dashboard",
        description: "Return to top of the ideas board",
        run: () => {
          setIsOpen(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
    ],
    [createIdea, user?.id],
  );

  const commandItems = useMemo<CommandItem[]>(() => {
    const ideaItems: CommandItem[] = filteredIdeas.map((idea) => ({
      id: `idea-${idea.id}`,
      type: "idea",
      label: idea.title,
      tags: idea.tags ?? [],
      ideaId: idea.id,
    }));

    return [...actionItems, ...ideaItems];
  }, [actionItems, filteredIdeas]);

  const expandedIdea = useMemo(
    () => ideas.find((idea) => idea.id === expandedIdeaId) ?? null,
    [ideas, expandedIdeaId],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }

      if (event.key === "Escape") {
        if (expandedIdeaId) {
          setExpandedIdeaId(null);
          return;
        }

        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expandedIdeaId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setHighlightedIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (commandItems.length === 0) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % commandItems.length);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev === 0 ? commandItems.length - 1 : prev - 1,
        );
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const selected = commandItems[highlightedIndex];
        if (!selected) {
          return;
        }

        if (selected.type === "action") {
          selected.run();
          return;
        }

        setIsOpen(false);
        setExpandedIdeaId(selected.ideaId);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, commandItems, highlightedIndex]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/55 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-[720px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121212] shadow-[0_20px_70px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/[0.06] p-3">
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-[#1C1C1C] px-4 py-3 text-[14px] text-white outline-none transition-all duration-150 placeholder:text-white/35 focus:border-[#7C5CFF]/60 focus:shadow-[0_0_0_1px_rgba(124,92,255,0.25),0_0_16px_rgba(124,92,255,0.18)]"
                placeholder="Search ideas and commands..."
                aria-label="Command search"
              />
            </div>

            <div className="max-h-[380px] overflow-y-auto p-2">
              {commandItems.length === 0 ? (
                <div className="rounded-lg px-3 py-2 text-[13px] text-white/40">
                  No results found.
                </div>
              ) : (
                commandItems.map((item, index) => {
                  const active = index === highlightedIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => {
                        if (item.type === "action") {
                          item.run();
                          return;
                        }

                        setIsOpen(false);
                        setExpandedIdeaId(item.ideaId);
                      }}
                      className={`mb-1 flex w-full items-start justify-between rounded-lg px-3 py-2 text-left transition-all duration-150 ${
                        active
                          ? "bg-[#7C5CFF]/12 border border-[#7C5CFF]/30"
                          : "border border-transparent hover:bg-white/[0.04]"
                      }`}
                    >
                      <div>
                        <p className="text-[13px] font-medium text-white/90">
                          {item.label}
                        </p>
                        {item.type === "action" ? (
                          <p className="mt-0.5 text-[11px] text-white/45">
                            {item.description}
                          </p>
                        ) : (
                          item.tags.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {item.tags.slice(0, 3).map((tag) => (
                                <TagPill
                                  key={`${item.id}-${tag}`}
                                  label={tag}
                                />
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}

      {expandedIdea && (
        <IdeaExpansionModal
          idea={expandedIdea}
          onClose={() => setExpandedIdeaId(null)}
        />
      )}
    </>
  );
}
