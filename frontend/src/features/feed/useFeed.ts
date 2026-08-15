import { useEffect } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { fetchImages, fetchTags } from "../../api/images";
import { subscribeToImages, subscribeToReconnect } from "../../lib/imageStream";
import type { FeedImage } from "../../types/image";
import { addImageToCache } from "./feedCache";
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

export function useLiveFeed(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribeImages = subscribeToImages((image) => addImageToCache(queryClient, image));
    const unsubscribeReconnect = subscribeToReconnect(() => {
      void queryClient.invalidateQueries({ queryKey: imageKeys.lists });
      void queryClient.invalidateQueries({ queryKey: imageKeys.tags });
    });

    return () => {
      unsubscribeReconnect();
      unsubscribeImages();
    };
  }, [queryClient]);
}
