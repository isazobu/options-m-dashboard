export function NoiseFilterBanner({
  hiddenCount,
  noun,
  showAll,
  onToggle,
  surfacedCount = 0,
}: {
  hiddenCount: number;
  noun: string;
  showAll: boolean;
  onToggle: () => void;
  /**
   * Positive-outcome rows pulled in from outside the recent window because
   * they'd otherwise have been buried under a run of noise. Reported
   * separately from hiddenCount, which counts noise, not signal.
   */
  surfacedCount?: number;
}) {
  if (hiddenCount === 0 && surfacedCount === 0) return null;

  return (
    <div className="surface flex items-center justify-between gap-3 px-4 py-2 text-xs text-secondary">
      <span>
        {showAll
          ? `Showing everything, including ${hiddenCount} noisy ${noun}.`
          : `${hiddenCount} noisy ${noun} (rejected/failed retries) filtered from this view for clarity.`}
        {!showAll && surfacedCount > 0 && (
          <>
            {" "}
            {surfacedCount} older successful {noun} that had scrolled out of the recent window
            {surfacedCount === 1 ? " is" : " are"} pulled back in.
          </>
        )}
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
