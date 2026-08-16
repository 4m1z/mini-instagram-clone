import { Suspense, useDeferredValue } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LiveIndicator, TabNav, type Tab } from "./components";
import { Feed, FeedError, FeedSkeleton, useLiveFeed } from "./features/feed";
import { UploadForm } from "./features/upload";
import { setUrlParam, useUrlParam } from "./lib/urlState";

export function App() {
  const streamStatus = useLiveFeed();

  const tab: Tab = useUrlParam("tab") === "upload" ? "upload" : "feed";
  const selectedTag = normalizeTag(useUrlParam("tag"));
  const loadedTag = useDeferredValue(selectedTag);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 pb-10 pt-5 sm:px-6 sm:pt-7">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/80 text-2xl shadow-lg shadow-fuchsia-200/60 ring-1 ring-white"
            role="img"
            aria-label="Camera"
          >
            📸
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">Mini Instagram</h1>
        </div>
        <LiveIndicator status={streamStatus} />
      </header>

      <TabNav active={tab} onChange={(next) => setUrlParam("tab", next === "feed" ? null : next)} />

      <main className="flex w-full justify-center">
        {tab === "upload" ? (
          <UploadForm onViewFeed={() => setUrlParam("tab", null)} />
        ) : (
          <ErrorBoundary FallbackComponent={FeedError} resetKeys={[loadedTag]}>
            <Suspense fallback={<FeedSkeleton />}>
              <Feed selectedTag={selectedTag} loadedTag={loadedTag} />
            </Suspense>
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}

function normalizeTag(tag: string | null): string | null {
  const normalized = tag?.trim().replace(/^#/, "").trim().toLowerCase();
  return normalized || null;
}
