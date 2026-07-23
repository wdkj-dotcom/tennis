export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-4 animate-pulse">
      <div className="flex gap-1 mb-3">
        <div className="h-7 w-16 rounded bg-slate-200" />
        <div className="h-7 w-20 rounded bg-slate-100" />
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 rounded bg-white border border-slate-100" />
        ))}
      </div>
    </div>
  );
}
