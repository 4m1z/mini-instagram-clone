import { setUrlParam } from "../../lib/urlState";
import { useFeed, useTags } from "./useFeed";
import { ImageCard } from "./ImageCard";
import { TagFilter } from "./TagFilter";

type Props = {
  selectedTag: string | null;
  loadedTag: string | null;
};

export function Feed({ selectedTag, loadedTag }: Props) {
  const tags = useTags();
  const images = useFeed(loadedTag);
  const isStale = selectedTag !== loadedTag;

  const selectTag = (tag: string | null) => setUrlParam("tag", tag);

  return (
    <section className="flex flex-col gap-4">
      <TagFilter tags={tags} activeTag={selectedTag} onChange={selectTag} />

      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          {selectedTag ? `No images tagged #${selectedTag} yet.` : "No images yet. Upload the first one."}
        </p>
      ) : (
        <div
          className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
             isStale ? "opacity-50" : "opacity-100"
          }`}
        >
          {images.map((image) => (
            <ImageCard key={image.id} image={image} onSelectTag={selectTag} />
          ))}
        </div>
      )}
    </section>
  );
}
