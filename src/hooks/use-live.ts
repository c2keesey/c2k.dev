import * as React from 'react';

/**
 * Poll a JSON endpoint. Returns the last good payload, the time it arrived,
 * and whether the most recent attempt failed. Data never fakes itself:
 * until the first response, `data` is null and UI should show "--".
 */
export function useLive<T>(url: string, intervalMs = 30_000) {
  const [data, setData] = React.useState<T | null>(null);
  const [syncedAt, setSyncedAt] = React.useState<number | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!url) return; // pass '' to switch polling off
    let alive = true;
    const pull = async () => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as T;
        if (!alive) return;
        setData(json);
        setSyncedAt(Date.now());
        setFailed(false);
      } catch {
        if (alive) setFailed(true);
      }
    };
    pull();
    const id = window.setInterval(pull, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [url, intervalMs]);

  return { data, syncedAt, failed };
}

/** Re-render every `ms` so relative times stay true. */
export function useNow(ms = 1000) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
