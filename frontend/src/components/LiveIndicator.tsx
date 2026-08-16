const labels = {
  live: { text: "Live", color: "bg-emerald-500", pulse: true },
  connecting: { text: "Connecting…", color: "bg-amber-500", pulse: true },
  offline: { text: "Offline", color: "bg-slate-400", pulse: false },
} as const;

export function LiveIndicator({ status }: { status: keyof typeof labels }) {
  const { text, color, pulse } = labels[status];

  return (
    <span
      className="flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur"
      role="status"
    >
      <span className="relative flex size-2" aria-hidden="true">
        {pulse && <span className={`absolute size-full animate-ping rounded-full opacity-40 ${color}`} />}
        <span className={`relative size-2 rounded-full ${color}`} />
      </span>
      <span className="sr-only">Connection status: {text}</span>
      <span className="hidden min-[360px]:inline" aria-hidden="true">{text}</span>
    </span>
  );
}
