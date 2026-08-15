import type { QueryClient } from "@tanstack/react-query";
import type { FeedImage } from "../../types/image";
import { imageKeys } from "./queryKeys";

// Update frontend query caches after an upload.
export function addImageToCache(queryClient: QueryClient, image: FeedImage): void {
  const cached = queryClient.getQueryCache().findAll({ queryKey: imageKeys.lists });

  for (const query of cached) {
    const tag = query.queryKey[1];
    if (tag !== null && tag !== image.tag) continue;

    // Refetch if the initial request is still in flight.
    if (query.state.data === undefined) {
      queryClient.invalidateQueries({ queryKey: query.queryKey, exact: true });
      continue;
    }
    queryClient.setQueryData<FeedImage[]>(query.queryKey, (images) =>
      images ? prependUnique(images, image) : [image],
    );
  }

  const tags = queryClient.getQueryData<string[]>(imageKeys.tags);
  if (tags === undefined) {
    queryClient.invalidateQueries({ queryKey: imageKeys.tags, exact: true });
  } else if (!tags.includes(image.tag)) {
    queryClient.setQueryData<string[]>(imageKeys.tags, [...tags, image.tag].sort());
  }
}

function prependUnique(images: readonly FeedImage[], image: FeedImage): FeedImage[] {
  if (images.some((existing) => existing.id === image.id)) {
    return images as FeedImage[];
  }
  return [image, ...images];
}
