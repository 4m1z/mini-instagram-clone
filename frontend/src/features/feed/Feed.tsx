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
    <section className="flex w-full flex-col gap-5">
      <TagFilter tags={tags} activeTag={selectedTag} onChange={selectTag} />

      {images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
          <p className="font-medium text-slate-700">Nothing here yet</p>
          <p className="mt-1 text-sm text-slate-500">
            {selectedTag ? `No images tagged #${selectedTag}.` : "Upload the first image to start the feed."}
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
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
