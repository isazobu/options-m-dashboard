export function money(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function percent(value: string | number | null | undefined, digits = 2): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return "—";
  return `${(num * 100).toFixed(digits)}%`;
}

export function number(value: string | number | null | undefined, digits = 2): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return "—";
  return num.toFixed(digits);
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function dateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
