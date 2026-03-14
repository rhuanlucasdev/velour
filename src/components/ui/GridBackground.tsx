export default function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
      <div
        className="grid-shift absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="grid-shift-slow absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(139,92,246,0.16) 0px, transparent 4px)",
          backgroundSize: "40px 40px",
          filter: "blur(0.6px)",
        }}
      />
    </div>
  );
}