import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useIdeaStore } from "../store/ideaStore";
import Card from "./ui/Card";

export interface IdeaCardProps {
  id: string;
  title: string;
}

export default function IdeaCard({ id, title }: IdeaCardProps) {
  const updateIdea = useIdeaStore((state) => state.updateIdea);
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(title);

  useEffect(() => {
    if (!isEditing) {
      setTitleValue(title);
    }
  }, [title, isEditing]);

  const saveTitle = () => {
    const newTitle = titleValue.trim();
    const safeTitle = newTitle.length > 0 ? newTitle : title;

    if (safeTitle !== title) {
      updateIdea(id, { title: safeTitle });
    }

    setTitleValue(safeTitle);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setTitleValue(title);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      whileHover={{ scale: 1.03 }}
      className="group h-full"
    >
      <Card
        hoverable={false}
        className="relative h-full overflow-hidden border-white/[0.06] transition-all duration-200 group-hover:border-[#7C5CFF]/35 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.5),0_0_22px_rgba(124,92,255,0.2)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#7C5CFF]/0 via-[#7C5CFF]/0 to-[#7C5CFF]/0 opacity-0 transition-opacity duration-200 group-hover:from-[#7C5CFF]/10 group-hover:via-transparent group-hover:to-[#7C5CFF]/5 group-hover:opacity-100" />
        {isEditing ? (
          <input
            autoFocus
            value={titleValue}
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
          <h3
            onClick={() => setIsEditing(true)}
            className="relative z-10 text-[15px] font-semibold tracking-tight text-white/90 transition-colors duration-150 hover:cursor-text hover:text-white"
          >
            {title}
          </h3>
        )}
      </Card>
    </motion.div>
  );
}
