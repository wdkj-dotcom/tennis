export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-4 animate-pulse space-y-1.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 rounded bg-white border border-slate-100" />
      ))}
    </div>
  );
}
