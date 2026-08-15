import type { FeedImage } from "../types/image";
import { apiUrl } from "./client";
import type { ImageDTO } from "./dto";

export function toFeedImage(dto: ImageDTO): FeedImage {
  return {
    id: dto.id,
    title: dto.title,
    tag: dto.tag,
    imageUrl: apiUrl(dto.imageUrl),
    createdAt: new Date(dto.createdAt),
  };
}

export function toFeedImages(dtos: readonly ImageDTO[]): FeedImage[] {
  return dtos.map(toFeedImage);
}
