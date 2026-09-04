const TONE_COLORS: Record<string, string> = {
  approved: "var(--color-success)",
  filled: "var(--color-success)",
  partially_filled: "var(--color-success)",
  close_submitted: "var(--color-brand)",
  submitted: "var(--color-brand)",
  pending: "var(--color-warning)",
  rejected: "var(--color-danger)",
  broker_rejected: "var(--color-danger)",
  failed: "var(--color-danger)",
  llm_failed: "var(--color-danger)",
  canceled: "var(--color-warning)",
};

export function Badge({ status }: { status: string }) {
  const color = TONE_COLORS[status] ?? "var(--text-secondary)";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {status}
    </span>
  );
}
