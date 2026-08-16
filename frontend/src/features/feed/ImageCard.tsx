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

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

export function ImageCard({ image, onSelectTag }: Props) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="overflow-hidden">
        <Image title={image.title} url={image.imageUrl} />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h3 className="truncate text-sm font-semibold text-slate-950" title={image.title}>
          {image.title}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={() => onSelectTag(image.tag)}
            className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100"
          >
            #{image.tag}
          </Button>
          <time
            dateTime={image.createdAt.toISOString()}
            title={formatter.format(image.createdAt)}
            className="shrink-0 text-xs text-slate-500"
          >
            {dateFormatter.format(image.createdAt)}
          </time>
        </div>
      </div>
    </article>
  );
}
