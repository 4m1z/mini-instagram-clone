import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Input } from "../../components";
import { Field } from "./Field";
import { UploadStatus } from "./UploadStatus";
import {
  ACCEPTED_MIME_TYPES,
  initialUploadState,
  uploadAction,
  type UploadState,
} from "./uploadAction";

export function UploadForm() {
  const [state, action] = useActionState<UploadState, FormData>(uploadAction, initialUploadState);

  const fields = state.status === "error" ? state.fields : {};
  const values = state.status === "error" ? state.values : { title: "", tag: "" };

  return (
    <form action={action} className="flex max-w-lg flex-col gap-4">
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

      <Field
        id="tag"
        name="tag"
        label="Tag"
        error={fields.tag}
      >
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
      <UploadStatus state={state} />
    </form>
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
