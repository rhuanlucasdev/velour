export default function AuroraBackground() {
  return (
    <div className="aurora-container pointer-events-none absolute inset-0 overflow-hidden">
      <div className="aurora-blob aurora-blob-1 absolute left-[-12%] top-[-20%] h-[24rem] w-[24rem] rounded-full bg-purple-600 opacity-30 blur-3xl" />
      <div className="aurora-blob aurora-blob-2 absolute right-[-10%] top-[8%] h-[22rem] w-[22rem] rounded-full bg-indigo-500 opacity-30 blur-3xl" />
      <div className="aurora-blob aurora-blob-3 absolute bottom-[-22%] left-[26%] h-[26rem] w-[26rem] rounded-full bg-blue-500 opacity-30 blur-3xl" />
    </div>
  );
}
