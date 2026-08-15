import { UploadForm } from "./features/upload/UploadForm";

export function App() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Mini Instagram</h1>
        <p className="mt-1 text-sm text-slate-500">Share an image with a title and tag.</p>
      </header>

      <main className="flex justify-center">
        <UploadForm />
      </main>
    </div>
  );
}
