/** "now", "42s ago", "7m ago", "3h ago", "4d ago", "2w ago", "5mo ago" — operational, terse. */
export function ago(input: Date | string | number, now = Date.now()): string {
  const t = typeof input === 'object' ? input.getTime() : new Date(input).getTime();
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 5) return 'now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 14) return `${d}d ago`;
  if (d < 60) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}
