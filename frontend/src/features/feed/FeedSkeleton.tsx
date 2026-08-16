export function FeedSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-5" aria-hidden="true">
      <div className="flex gap-2">
        <div className="h-8 w-14 rounded-full bg-slate-200" />
        <div className="h-8 w-24 rounded-full bg-slate-200" />
        <div className="h-8 w-20 rounded-full bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="aspect-square w-full bg-slate-200" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="h-5 w-1/3 rounded-full bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
