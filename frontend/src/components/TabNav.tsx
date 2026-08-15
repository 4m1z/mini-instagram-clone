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
    <nav className="flex gap-1 rounded-lg bg-slate-100 p-1" aria-label="Views">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
            active === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </nav>
  );
}
