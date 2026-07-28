export default function HeaderSkeleton() {
  return (
    <header className="border-b bg-white relative z-40">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between animate-pulse">
        <div className="h-5 w-24 rounded bg-slate-200" />
        <div className="h-5 w-32 rounded bg-slate-100" />
      </div>
    </header>
  );
}
