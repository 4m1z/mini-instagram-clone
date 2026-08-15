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
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tag">
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
      className={`rounded-full border px-3 py-1.5 text-sm ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      {children}
    </Button>
  );
}
