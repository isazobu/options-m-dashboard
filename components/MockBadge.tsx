export function MockBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase"
      style={{
        color: "var(--color-warning)",
        borderColor: "var(--color-warning-soft)",
        backgroundColor: "color-mix(in srgb, var(--color-warning) 10%, transparent)",
      }}
      title="Seeded demo data, not a real agent decision"
    >
      Mock
    </span>
  );
}
