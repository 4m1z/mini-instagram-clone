import { useEffect, useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { websocketUrl } from "../../api/client";
import type { ImageCreatedEventDTO } from "../../api/dto";
import { fetchImages, fetchTags } from "../../api/images";
import { toFeedImage } from "../../api/mappers";
import type { FeedImage } from "../../types/image";
import { addImageToCache } from "./feedCache";
import { imageKeys } from "./queryKeys";

type StreamStatus = "connecting" | "live" | "offline";

const RECONNECT_BASE_MS = 500;
const RECONNECT_MAX_MS = 10_000;

// The feed for the currently selected tag (`null` means "all tags"). 
export function useFeed(tag: string | null): FeedImage[] {
  const { data } = useSuspenseQuery({
    queryKey: imageKeys.list(tag),
    queryFn: ({ signal }) => fetchImages(tag, signal),
  });
  return data;
}

// All tags currently in use, for the filter bar. 
export function useTags(): string[] {
  const { data } = useSuspenseQuery({
    queryKey: imageKeys.tags,
    queryFn: ({ signal }) => fetchTags(signal),
  });
  return data;
}

export function useLiveFeed(): StreamStatus {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StreamStatus>("offline");

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;
    let stopped = false;

    function connect() {
      if (stopped) return;
      setStatus("connecting");

      const ws = new WebSocket(websocketUrl("/api/ws"));
      socket = ws;

      ws.onopen = () => {
        if (stopped || socket !== ws) return;
        const reconnected = attempt > 0;
        attempt = 0;
        setStatus("live");
        if (reconnected) {
          void queryClient.invalidateQueries({ queryKey: imageKeys.lists });
          void queryClient.invalidateQueries({ queryKey: imageKeys.tags });
        }
      };
      ws.onmessage = ({ data }) => {
        if (socket !== ws || typeof data !== "string") return;

        let event: ImageCreatedEventDTO;
        try {
          // data is any, had to cast it, didn't have enough time to 
          // figure out a way to type safe data. 
          event = JSON.parse(data) as ImageCreatedEventDTO;
        } catch {
          return;
        }
        if (event?.type === "image.created" && event.payload) {
          addImageToCache(queryClient, toFeedImage(event.payload));
        }
      };
      ws.onclose = () => {
        if (stopped || socket !== ws) return;
        socket = null;
        setStatus("offline");

        const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
        attempt += 1;
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          connect();
        }, delay);
      };
      ws.onerror = () => ws.close();
    }

    queueMicrotask(connect);

    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      const ws = socket;
      socket = null;
      ws?.close();
    };
  }, [queryClient]);

  return status;
}
