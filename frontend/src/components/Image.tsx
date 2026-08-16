type Props = {
  url: string;
  title: string;
};

export function Image({ url, title }: Props) {
  return (
    <img
      src={url}
      alt={title}
      loading="lazy"
      className="aspect-square w-full bg-slate-100 object-cover transition duration-500 group-hover:scale-[1.025]"
    />
  );
}
