import { Button } from "../../components";

type Props = {
  tags: readonly string[];
  activeTag: string | null;
  onChange: (tag: string | null) => void;
};

export function TagFilter({ tags, activeTag, onChange }: Props) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div
      className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      role="group"
      aria-label="Filter by tag"
    >
      <FilterChip active={activeTag === null} onClick={() => onChange(null)}>
        All
      </FilterChip>
      {tags.map((tag) => (
        <FilterChip key={tag} active={activeTag === tag} onClick={() => onChange(tag)}>
          #{tag}
        </FilterChip>
      ))}
    </div>
  );
}

type ChipProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function FilterChip({ active, onClick, children }: ChipProps) {
  return (
    <Button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium shadow-sm ${
        active
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-950"
      }`}
    >
      {children}
    </Button>
  );
}
