export function NoiseFilterBanner({
  hiddenCount,
  noun,
  showAll,
  onToggle,
}: {
  hiddenCount: number;
  noun: string;
  showAll: boolean;
  onToggle: () => void;
}) {
  if (hiddenCount === 0) return null;

  return (
    <div className="surface flex items-center justify-between gap-3 px-4 py-2 text-xs text-secondary">
      <span>
        {showAll
          ? `Showing everything, including ${hiddenCount} noisy ${noun}.`
          : `${hiddenCount} noisy ${noun} (rejected/failed retries) filtered from this view for clarity.`}
      </span>
      <button
        onClick={onToggle}
        className="shrink-0 rounded-full border border-subtle px-3 py-1 font-medium text-secondary hover:text-[var(--text-primary)]"
      >
        {showAll ? "Hide noisy" : "Show all"}
      </button>
    </div>
  );
}
