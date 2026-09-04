/**
 * Union several row lists by id. Later lists win on duplicate ids. Order is
 * not meaningful — callers sort by their own timestamp field afterwards,
 * since the shape of that field differs between rows (proposals use `ts`,
 * orders use `submitted_at`).
 */
export function mergeRowsById<T extends { id: number }>(...lists: T[][]): T[] {
  const byId = new Map<number, T>();
  for (const list of lists) {
    for (const row of list) byId.set(row.id, row);
  }
  return [...byId.values()];
}
