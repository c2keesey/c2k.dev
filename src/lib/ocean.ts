/**
 * The view west from the Outer Sunset: where the sun is, and what the tide is doing.
 * Sun position is computed (no network); tide comes from /api/tide (NOAA predictions).
 */

export const OCEAN_BEACH = { lat: 37.7594, lon: -122.5107 };

const RAD = Math.PI / 180;

/** Solar altitude and azimuth (degrees; azimuth clockwise from north) at a time and place. */
export function sunPosition(t: number, lat = OCEAN_BEACH.lat, lon = OCEAN_BEACH.lon) {
  const d = t / 86_400_000 + 2440587.5 - 2451545.0; // days since J2000
  const g = (357.529 + 0.98560028 * d) * RAD;
  const q = 280.459 + 0.98564736 * d;
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  const e = (23.439 - 0.00000036 * d) * RAD;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const gmst = (18.697374558 + 24.06570982441908 * d) % 24;
  const H = ((gmst * 15 + lon) * RAD - ra);
  const phi = lat * RAD;
  const alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
  return { alt: alt / RAD, az: ((az / RAD + 180) % 360 + 360) % 360 };
}

/** Next time the sun crosses the horizon going down (set) or up (rise), within 26h. */
export function nextSunEvent(from: number, kind: 'set' | 'rise'): number | null {
  const step = 60_000;
  let prev = sunPosition(from).alt + 0.833;
  for (let t = from + step; t < from + 26 * 3_600_000; t += step) {
    const a = sunPosition(t).alt + 0.833;
    if (kind === 'set' && prev > 0 && a <= 0) return t;
    if (kind === 'rise' && prev < 0 && a >= 0) return t;
    prev = a;
  }
  return null;
}

export interface TideExtreme { t: number; ft: number; type: 'H' | 'L' }
export interface TideData { station: string; place: string; extremes: TideExtreme[] }

/** Height now by cosine interpolation between the surrounding high and low. */
export function tideAt(tide: TideData, t: number) {
  const ex = tide.extremes;
  for (let i = 0; i < ex.length - 1; i++) {
    const a = ex[i], b = ex[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = (t - a.t) / (b.t - a.t);
      const ft = a.ft + (b.ft - a.ft) * (1 - Math.cos(Math.PI * p)) / 2;
      return { ft, rising: b.ft > a.ft, next: b };
    }
  }
  return null;
}

/** 0 = lowest, 1 = highest of the extremes we have — where the waterline sits. */
export function tideLevel(tide: TideData, ft: number) {
  const vals = tide.extremes.map((e) => e.ft);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  return hi > lo ? (ft - lo) / (hi - lo) : 0.5;
}
