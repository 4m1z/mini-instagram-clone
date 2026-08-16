import { useQueryClient } from "@tanstack/react-query";
import type { FallbackProps } from "react-error-boundary";
import { Button } from "../../components";

export function FeedError({ error, resetErrorBoundary }: FallbackProps) {
  const queryClient = useQueryClient();
  const message = error instanceof Error ? error.message : "The feed could not be loaded.";

  const retry = () => {
    void queryClient.resetQueries();
    resetErrorBoundary();
  };

  return (
    <div role="alert" className="flex w-full flex-col items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-6">
      <p className="text-sm text-red-700">{message}</p>
      <Button variant="danger" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
