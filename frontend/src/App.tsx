import { Suspense, useDeferredValue } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { TabNav, type Tab } from "./components";
import { Feed, FeedError, FeedSkeleton } from "./features/feed";
import { UploadForm } from "./features/upload";
import { setUrlParam, useUrlParam } from "./lib/urlState";

export function App() {
  const tab: Tab = useUrlParam("tab") === "upload" ? "upload" : "feed";
  const selectedTag = normalizeTag(useUrlParam("tag"));
  const loadedTag = useDeferredValue(selectedTag);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Mini Instagram</h1>
      </header>

      <TabNav active={tab} onChange={(next) => setUrlParam("tab", next === "feed" ? null : next)} />

      <main className="flex justify-center">
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
