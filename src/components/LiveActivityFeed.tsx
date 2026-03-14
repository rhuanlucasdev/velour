import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const activityMessages = [
  "Alex from Berlin just generated hooks",
  "Sarah from NYC captured a new idea",
  "David from London created a hook",
  "Lucas from São Paulo exported a post",
];

const getRandomInterval = () => Math.floor(Math.random() * 4000) + 6000;

export default function LiveActivityFeed() {
  const [activeMessage, setActiveMessage] = useState(activityMessages[0]);
  const [isVisible, setIsVisible] = useState(true);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const clearAllTimeouts = () => {
      timeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
      timeoutsRef.current = [];
    };

    const scheduleNextActivity = (delay: number) => {
      const nextTimeout = window.setTimeout(() => {
        setActiveMessage((current) => {
          const candidates = activityMessages.filter(
            (message) => message !== current,
          );
          const nextIndex = Math.floor(Math.random() * candidates.length);
          return candidates[nextIndex];
        });
        setIsVisible(true);

        const hideTimeout = window.setTimeout(() => {
          setIsVisible(false);
        }, 3600);

        timeoutsRef.current.push(hideTimeout);
        scheduleNextActivity(getRandomInterval());
      }, delay);

      timeoutsRef.current.push(nextTimeout);
    };

    const initialHideTimeout = window.setTimeout(() => {
      setIsVisible(false);
    }, 3600);

    timeoutsRef.current.push(initialHideTimeout);
    scheduleNextActivity(getRandomInterval());

    return () => {
      clearAllTimeouts();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[55]">
      <AnimatePresence mode="wait">
        {isVisible ? (
          <motion.div
            key={activeMessage}
            initial={{ opacity: 0, y: 14, x: -8 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 8, x: -4 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-w-[320px] rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/85 backdrop-blur-xl shadow-[0_10px_28px_rgba(0,0,0,0.3)]"
          >
            {activeMessage}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
