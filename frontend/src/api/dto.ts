/**
 * Wire format of the backend. These types exist only inside src/api and are
 * translated into domain models by the mappers.
 */
export type ImageDTO = {
  id: string;
  title: string;
  tag: string;
  imageUrl: string;
  createdAt: string;
};

export type ImageListDTO = {
  images: ImageDTO[];
};

export type TagListDTO = {
  tags: string[];
};

export type ApiErrorDTO = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

export type ImageCreatedEventDTO = {
  type: "image.created";
  payload: ImageDTO;
};
