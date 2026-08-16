import { Button } from "./Button";

type Tab = "feed" | "upload";

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

export type { Tab };

const tabs: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: "feed", label: "Feed" },
  { id: "upload", label: "Upload" },
];

// Two-view navigation stays in the URL without requiring a router.
export function TabNav({ active, onChange }: Props) {
  return (
    <nav
      className="sticky top-3 z-10 flex gap-1 rounded-2xl border border-white/80 bg-white/70 p-1.5 shadow-sm backdrop-blur-xl"
      aria-label="Views"
    >
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold ${
            active === tab.id
              ? "bg-slate-950 text-white shadow-sm"
              : "text-slate-500 hover:bg-white/70 hover:text-slate-900"
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </nav>
  );
}
