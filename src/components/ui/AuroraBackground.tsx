import { useEffect, useRef } from "react";

const MAX_OFFSET = 20;

export default function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const blobRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    let frameId = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      blobRefs.current.forEach((blob, index) => {
        if (!blob) {
          return;
        }

        const depth = (index + 1) / blobRefs.current.length;
        const offsetX = currentX * depth;
        const offsetY = currentY * depth;

        blob.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      });

      frameId = window.requestAnimationFrame(updateParallax);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

      targetX = relativeX * MAX_OFFSET * 2;
      targetY = relativeY * MAX_OFFSET * 2;
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    frameId = window.requestAnimationFrame(updateParallax);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="aurora-container pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        ref={(element) => {
          blobRefs.current[0] = element;
        }}
        className="absolute left-[-12%] top-[-20%] will-change-transform"
      >
        <div className="aurora-blob aurora-blob-1 h-[24rem] w-[24rem] rounded-full bg-purple-600 opacity-30 blur-3xl" />
      </div>

      <div
        ref={(element) => {
          blobRefs.current[1] = element;
        }}
        className="absolute right-[-10%] top-[8%] will-change-transform"
      >
        <div className="aurora-blob aurora-blob-2 h-[22rem] w-[22rem] rounded-full bg-indigo-500 opacity-30 blur-3xl" />
      </div>

      <div
        ref={(element) => {
          blobRefs.current[2] = element;
        }}
        className="absolute bottom-[-22%] left-[26%] will-change-transform"
      >
        <div className="aurora-blob aurora-blob-3 h-[26rem] w-[26rem] rounded-full bg-blue-500 opacity-30 blur-3xl" />
      </div>
    </div>
  );
}
