import { ApiError } from "../../api/client";
import { uploadImage } from "../../api/images";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_MIME_TYPES = "image/jpeg,image/png,image/gif,image/webp";

export type UploadValues = {
  title: string;
  tag: string;
};

export type UploadState =
  | { status: "idle" }
  | { status: "success"; title: string }
  | { status: "error"; message: string; fields: Record<string, string>; values: UploadValues };

export const initialUploadState: UploadState = { status: "idle" };

type Action = (previous: UploadState, formData: FormData) => Promise<UploadState>;

export const uploadAction: Action = async (_, formData) => {
  const title = String(formData.get("title") ?? "").trim();
  const tag = String(formData.get("tag") ?? "").trim();
  const file = formData.get("image");

  const values: UploadValues = { title, tag };

  if (!(file instanceof File) || file.size === 0) {
    return invalid("image", "Please choose an image.", values);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return invalid("image", "The image is too large (maximum 10 MB).", values);
  }

  try {
    const image = await uploadImage({ title, tag, file });
    return { status: "success", title: image.title };
  } catch (error) {
    return toUploadError(error, values);
  }
};

function invalid(field: string, message: string, values: UploadValues): UploadState {
  return { status: "error", message, fields: { [field]: message }, values };
}

function toUploadError(error: unknown, values: UploadValues): UploadState {
  if (error instanceof ApiError) {
    const message = Object.values(error.fields)[0] ?? error.message;
    return { status: "error", message, fields: error.fields, values };
  }
  return {
    status: "error",
    message: "The upload failed unexpectedly. Please try again.",
    fields: {},
    values,
  };
}
