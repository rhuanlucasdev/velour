import { motion, useSpring } from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useIdeaStore } from "../store/ideaStore";
import { toast } from "../utils/toast";
import TagPill from "./ideas/TagPill";
import Card from "./ui/Card";

export interface IdeaCardProps {
  id: string;
  title: string;
  tags: string[];
  isNew?: boolean;
  disableOpen?: boolean;
  onOpen?: () => void;
}

export default function IdeaCard({
  id,
  title,
  tags,
  isNew = false,
  disableOpen = false,
  onOpen,
}: IdeaCardProps) {
  const updateIdea = useIdeaStore((state) => state.updateIdea);
  const deleteIdea = useIdeaStore((state) => state.deleteIdea);
  const clearLastCreatedIdeaId = useIdeaStore(
    (state) => state.clearLastCreatedIdeaId,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });

  useEffect(() => {
    if (!isEditing) {
      setTitleValue(title);
    }
  }, [title, isEditing]);

  useEffect(() => {
    if (!isNew) {
      return;
    }

    setIsEditing(true);
    setTitleValue(title);
    clearLastCreatedIdeaId();
  }, [isNew, title, clearLastCreatedIdeaId]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing]);

  const saveTitle = () => {
    const newTitle = titleValue.trim();
    const safeTitle = newTitle.length > 0 ? newTitle : title;

    if (safeTitle !== title) {
      void updateIdea(id, { title: safeTitle });
    }

    setTitleValue(safeTitle);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setTitleValue(title);
    setIsEditing(false);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    setMouseX(x);
    setMouseY(y);

    const horizontal = x / bounds.width - 0.5;
    const vertical = y / bounds.height - 0.5;
    const maxTilt = 5;

    rotateY.set(horizontal * (maxTilt * 2));
    rotateX.set(-vertical * (maxTilt * 2));
  };

  const handleMouseLeave = () => {
    setMouseX(null);
    setMouseY(null);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      whileHover={{
        scale: 1.03,
        transition: { type: "spring", stiffness: 200, damping: 20 },
      }}
      onClick={() => {
        if (!isEditing && !disableOpen) {
          onOpen?.();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group h-full will-change-transform"
    >
      <Card
        hoverable={false}
        className="relative h-full min-h-[140px] overflow-hidden border-white/[0.06] transition-all duration-200 group-hover:border-[#7C5CFF]/35 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.5),0_0_22px_rgba(124,92,255,0.2)]"
      >
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: mouseX === null || mouseY === null ? 0 : 1,
            background:
              mouseX !== null && mouseY !== null
                ? `radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgba(124,92,255,0.15), transparent 40%)`
                : "none",
          }}
        />
        <button
          onClick={(event) => {
            event.stopPropagation();
            void deleteIdea(id);
            toast("Idea deleted 🗑️", { type: "info" });
          }}
          aria-label="Delete idea"
          className="absolute right-3 top-3 z-20 flex h-6 w-6 items-center justify-center rounded-md text-white/30 opacity-0 transition-all duration-150 hover:bg-red-500/15 hover:text-red-400 group-hover:opacity-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>

        {isEditing ? (
          <input
            ref={inputRef}
            autoFocus
            value={titleValue}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => setTitleValue(event.target.value)}
            onBlur={saveTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                saveTitle();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                cancelEdit();
              }
            }}
            className="relative z-10 w-full bg-transparent text-[15px] font-semibold tracking-tight text-white outline-none"
            aria-label="Edit idea title"
          />
        ) : (
          <div className="relative z-10 space-y-3">
            <h3
              onClick={(event) => {
                event.stopPropagation();
                setIsEditing(true);
              }}
              className="text-[15px] font-semibold tracking-tight text-white/90 transition-colors duration-150 hover:cursor-text hover:text-white"
            >
              {title}
            </h3>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 3).map((tag) => (
                  <TagPill key={tag} label={tag} />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
