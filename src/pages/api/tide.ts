export const prerender = false;

/**
 * Tide predictions for NOAA station 9414290 (San Francisco, at the Golden Gate) —
 * the closest primary station to Ocean Beach. Highs and lows from yesterday through
 * two days out; the client interpolates the height between them.
 * Cached in memory for 3h; NOAA's predictions don't change within a day.
 */
const STATION = '9414290';
const TTL = 3 * 60 * 60 * 1000;
let cache: { at: number; body: string } | null = null;

const ymd = (d: Date) => d.toISOString().slice(0, 10).replaceAll('-', '');

export async function GET() {
  if (cache && Date.now() - cache.at < TTL) return respond(cache.body);
  try {
    const day = 86_400_000;
    const url =
      'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=web' +
      `&begin_date=${ymd(new Date(Date.now() - day))}&end_date=${ymd(new Date(Date.now() + 2 * day))}` +
      `&datum=MLLW&station=${STATION}&time_zone=gmt&units=english&interval=hilo&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { predictions?: Array<{ t: string; v: string; type: 'H' | 'L' }> };
    if (!data.predictions?.length) throw new Error('no predictions');
    const body = JSON.stringify({
      station: STATION,
      place: 'Golden Gate',
      extremes: data.predictions.map((p) => ({ t: Date.parse(p.t.replace(' ', 'T') + 'Z'), ft: Number(p.v), type: p.type })),
    });
    cache = { at: Date.now(), body };
    return respond(body);
  } catch {
    // stale beats nothing; nothing beats invented
    if (cache) return respond(cache.body);
    return new Response(JSON.stringify({ status: 'unavailable' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

function respond(body: string) {
  return new Response(body, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=900' } });
}
