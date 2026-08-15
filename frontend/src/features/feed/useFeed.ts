import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchImages, fetchTags } from "../../api/images";
import type { FeedImage } from "../../types/image";
import { imageKeys } from "./queryKeys";

/** The feed for the currently selected tag (`null` means "all tags"). */
export function useFeed(tag: string | null): FeedImage[] {
  const { data } = useSuspenseQuery({
    queryKey: imageKeys.list(tag),
    queryFn: ({ signal }) => fetchImages(tag, signal),
  });
  return data;
}

/** All tags currently in use, for the filter bar. */
export function useTags(): string[] {
  const { data } = useSuspenseQuery({
    queryKey: imageKeys.tags,
    queryFn: ({ signal }) => fetchTags(signal),
  });
  return data;
}
