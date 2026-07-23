export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 w-24 rounded bg-slate-200 mb-4" />
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
        <div className="h-8 w-full rounded bg-slate-100" />
      </div>
    </div>
  );
}
