import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

export function useUrlParam(key: string): string | null {
  return useSyncExternalStore(
    // subscribe
    (listener: () => void): (() => void) => {
      listeners.add(listener);
      window.addEventListener("popstate", listener);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("popstate", listener);
      };
    },
    // read param
    () => new URLSearchParams(window.location.search).get(key),
    () => null,
  );
}


export function setUrlParam(key: string, value: string | null): void {
  const url = new URL(window.location.href);
  if (value === null || value === "") {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, value);
  }
  window.history.pushState(null, "", url);
  for (const listener of listeners) listener();
}
