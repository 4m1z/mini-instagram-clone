import type { UploadState } from "./uploadAction";

type Props = {
  state: UploadState;
};

export function UploadStatus({ state }: Props) {
  if (state.status === "error") {
    return <Alert> {state.message} </Alert>;
  }

  if (state.status === "success") {
    return <Success>“{state.title}” was uploaded.</Success>;
  }

  return null;
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {children}
    </p>
  );
}

function Success({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
    > {children}
    </div>
  );
}
