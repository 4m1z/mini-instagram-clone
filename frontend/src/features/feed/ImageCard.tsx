import { Button, Image } from "../../components";
import type { FeedImage } from "../../types/image";

type Props = {
  image: FeedImage;
  onSelectTag: (tag: string) => void;
};

const formatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function ImageCard({ image, onSelectTag }: Props) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Image title={image.title} url={image.imageUrl} />
      <div className="flex flex-col gap-2 p-3">
        <h3 className="truncate font-medium text-slate-900" title={image.title}>
          {image.title}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={() => onSelectTag(image.tag)}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >
            #{image.tag}
          </Button>
          <time
            dateTime={image.createdAt.toISOString()}
            className="shrink-0 text-xs text-slate-500"
          >
            {formatter.format(image.createdAt)}
          </time>
        </div>
      </div>
    </article>
  );
}
