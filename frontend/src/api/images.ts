import type { FeedImage } from "../types/image";
import { request } from "./client";
import type { ImageDTO, ImageListDTO, TagListDTO } from "./dto";
import { toFeedImage, toFeedImages } from "./mappers";

export type UploadImageCommand = {
  title: string;
  tag: string;
  file: File;
};

export async function fetchImages(tag: string | null, signal?: AbortSignal): Promise<FeedImage[]> {
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : "";
  const dto = await request<ImageListDTO>(`/api/images${query}`, signal ? { signal } : undefined);
  return toFeedImages(dto.images);
}

export async function fetchTags(signal?: AbortSignal): Promise<string[]> {
  const dto = await request<TagListDTO>("/api/tags", signal ? { signal } : undefined);
  return dto.tags;
}

export async function uploadImage(command: UploadImageCommand): Promise<FeedImage> {
  const body = new FormData();
  body.set("title", command.title);
  body.set("tag", command.tag);
  body.set("image", command.file);

  const dto = await request<ImageDTO>("/api/uploads", { method: "POST", body });
  return toFeedImage(dto);
}
