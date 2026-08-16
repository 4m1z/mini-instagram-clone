import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "../../components";
import { addImageToCache } from "../feed";
import { Field } from "./Field";
import { UploadStatus } from "./UploadStatus";
import {
  ACCEPTED_MIME_TYPES,
  createUploadAction,
  initialUploadState,
  type UploadState,
} from "./uploadAction";

type Props = {
  onViewFeed: () => void;
};

export function UploadForm({ onViewFeed }: Props) {
  const queryClient = useQueryClient();
  const [state, action] = useActionState<UploadState, FormData>(
    createUploadAction((image) => addImageToCache(queryClient, image)),
    initialUploadState,
  );

  const fields = state.status === "error" ? state.fields : {};
  const values = state.status === "error" ? state.values : { title: "", tag: "" };

  return (
    <section className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/80 bg-white/85 shadow-xl shadow-slate-200/50 backdrop-blur">
      <div className="border-b border-slate-100 bg-gradient-to-br from-violet-50/80 to-orange-50/60 px-6 py-5 sm:px-8 sm:py-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">Share a moment</h2>
        <p className="mt-1 text-sm text-slate-500">Add a photo to the live community feed.</p>
      </div>

      <form action={action} className="flex flex-col gap-5 p-6 sm:p-8">
        <Field id="title" name="title" label="Title" error={fields.title}>
          <Input
            id="title"
            name="title"
            type="text"
            required
            aria-invalid={Boolean(fields.title)}
            aria-describedby={fields.title ? "title-error" : undefined}
            defaultValue={values.title}
            maxLength={120}
            placeholder="Sunset over the harbour"
          />
        </Field>

        <Field id="tag" name="tag" label="Tag" error={fields.tag}>
          <Input
            id="tag"
            name="tag"
            type="text"
            required
            aria-invalid={Boolean(fields.tag)}
            aria-describedby={fields.tag ? "tag-error" : undefined}
            defaultValue={values.tag}
            maxLength={32}
            placeholder="nature"
          />
        </Field>

        <Field
          id="image"
          name="image"
          label="Image"
          hint="JPEG, PNG, GIF or WEBP, up to 10 MB."
          error={fields.image}
        >
          <Input
            id="image"
            name="image"
            type="file"
            variant="file"
            required
            aria-invalid={Boolean(fields.image)}
            aria-describedby={fields.image ? "image-error" : "image-hint"}
            accept={ACCEPTED_MIME_TYPES}
          />
        </Field>

        <SubmitButton />
        <UploadStatus state={state} onViewFeed={onViewFeed} />
      </form>
    </section>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      disabled={pending}
    >
      {pending ? "Uploading…" : "Upload image"}
    </Button>
  );
}
