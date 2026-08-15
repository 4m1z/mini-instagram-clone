import { useSyncExternalStore } from "react";
import { getStatus, subscribeToStatus } from "../lib/imageStream";

const labels = {
  live: { text: "Live", color: "bg-emerald-500" },
  connecting: { text: "Connecting…", color: "bg-amber-500" },
  offline: { text: "Offline", color: "bg-slate-400" },
} as const;

/** Shows the WebSocket connection state; re-renders only when it changes. */
export function LiveIndicator() {
  const status = useSyncExternalStore(subscribeToStatus, getStatus, () => "offline" as const);
  const { text, color } = labels[status];

  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-500">
      <span className={`size-2 rounded-full ${color}`} aria-hidden="true" />
      {text}
    </span>
  );
}
