export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}) {
  const toneColor =
    tone === "success"
      ? "var(--color-success)"
      : tone === "danger"
        ? "var(--color-danger)"
        : "var(--text-primary)";

  return (
    <div className="surface px-4 py-3">
      <div className="text-xs text-tertiary">{label}</div>
      <div className="font-mono-numeric mt-1 text-xl font-medium" style={{ color: toneColor }}>
        {value}
      </div>
    </div>
  );
}
