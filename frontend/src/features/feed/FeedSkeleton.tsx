export function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-xl border border-slate-200">
          <div className="aspect-square w-full bg-slate-200" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
