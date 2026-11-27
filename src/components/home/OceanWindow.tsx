import * as React from 'react';
import { useLive } from '@/hooks/use-live';
import type { Activity, ActivityPush } from '@/lib/live';
import { PROJECTS } from '@/data/projects';
import { sunPosition, tideAt, tideLevel, type TideData } from '@/lib/ocean';

/**
 * The background: the view west from the Outer Sunset, drawn as line art.
 *
 * Nothing in it is invented. The sun sits where it actually is over Ocean Beach right
 * now (computed, so it never needs the network); its glow is the site's sunset gradient,
 * which only shows up when the real sun is near the horizon. Stars come out when it's
 * actually dark. The shoreline rides the real tide (NOAA predictions); if the tide can't
 * be fetched, the shore sits at mid-tide and stops moving with it. The swell itself is
 * periodic, waves inside sets inside tides. Your cursor leaves ripples on the water.
 */
export default function OceanWindow({ swells = false }: { swells?: boolean }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const { data: tide } = useLive<TideData>('/api/tide', 30 * 60_000);
  const tideRef = React.useRef<TideData | null>(null);
  tideRef.current = tide && 'extremes' in tide ? tide : null;
  const { data: activity } = useLive<Activity>(swells ? '/api/activity' : '', 5 * 60_000);
  const pushRef = React.useRef<ActivityPush[]>([]);
  pushRef.current = swells ? activity?.pushes ?? [] : [];

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let colors = readColors();
    let stars: Star[] = [];
    const ripples: Ripple[] = [];
    let lastPointer = { x: -999, y: -999 };
    let raf = 0;
    let shore = 0.5; // smoothed tide level
    const sunCache = { at: 0, alt: 0, az: 0 };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = makeStars(W, H * horizonFrac(W));
      if (reduced) draw(performance.now());
    };

    const themeObs = new MutationObserver(() => {
      colors = readColors();
      if (reduced) draw(performance.now());
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const onPointer = (e: PointerEvent) => {
      if (reduced) return;
      const hy = H * horizonFrac(W);
      if (e.clientY < hy + 8) return;
      const dx = e.clientX - lastPointer.x, dy = e.clientY - lastPointer.y;
      if (dx * dx + dy * dy < 50 * 50) return;
      lastPointer = { x: e.clientX, y: e.clientY };
      ripples.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
      if (ripples.length > 14) ripples.shift();
    };

    function draw(now: number) {
      const t = now / 1000;
      const wall = Date.now() + devOffset();
      if (wall - sunCache.at > 30_000) {
        const s = sunPosition(wall);
        Object.assign(sunCache, { at: wall, alt: s.alt, az: s.az });
      }
      const { alt, az } = sunCache;
      const hy = H * horizonFrac(W);
      const light = colors;
      ctx!.clearRect(0, 0, W, H);

      // ── sky ──
      const pxPerDeg = W / 110;
      const sx = W * (0.5 + (az - 270) / 110); // looking due west, 110° field of view
      const inView = sx > -W * 0.3 && sx < W * 1.3;
      const glow = inView ? Math.exp(-((alt + 1.5) ** 2) / (2 * 6 ** 2)) : 0; // strongest just after sunset
      const dark = clamp((-alt - 4) / 10, 0, 1);
      const amp = 1;

      if (glow > 0.01) {
        ctx!.save();
        ctx!.beginPath();
        ctx!.rect(0, 0, W, hy);
        ctx!.clip();
        ctx!.translate(sx, hy);
        ctx!.scale(1.9, 1);
        const r = Math.max(W, H) * 0.55;
        const g = ctx!.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, rgba(light.ember, 0.34 * glow * amp));
        g.addColorStop(0.28, rgba(light.pink, 0.16 * glow * amp));
        g.addColorStop(0.62, rgba(light.primary, 0.07 * glow * amp));
        g.addColorStop(1, rgba(light.primary, 0));
        ctx!.fillStyle = g;
        ctx!.fillRect(-r, -r, 2 * r, r);
        ctx!.restore();
      }

      if (dark > 0 && !light.warm) {
        for (const s of stars) {
          const tw = reduced ? 1 : 0.65 + 0.35 * Math.sin(t * s.speed + s.phase);
          ctx!.fillStyle = rgba(light.fg, s.a * dark * tw * amp);
          ctx!.fillRect(s.x, s.y, s.r, s.r);
        }
      }

      // the sun itself, when it's up and in the window
      if (inView && alt > -1 && alt < 40) {
        const sy = hy - alt * pxPerDeg;
        const rad = 5;
        const halo = ctx!.createRadialGradient(sx, sy, 0, sx, sy, rad * 9);
        halo.addColorStop(0, rgba(light.ember, 0.14 * amp));
        halo.addColorStop(1, rgba(light.ember, 0));
        ctx!.fillStyle = halo;
        ctx!.fillRect(sx - rad * 9, sy - rad * 9, rad * 18, rad * 18);
        ctx!.fillStyle = rgba(light.ember, 0.6 * amp);
        ctx!.beginPath();
        ctx!.arc(sx, sy, rad, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      // horizon
      ctx!.fillStyle = rgba(light.fg, 0.1 + 0.25 * glow);
      ctx!.fillRect(0, hy, W, 1);

      // ── water ──
      const tideNow = tideRef.current ? tideAt(tideRef.current, wall) : null;
      const target = tideNow && tideRef.current ? tideLevel(tideRef.current, tideNow.ft) : 0.5;
      shore += (target - shore) * 0.02;
      const shoreY = H * (0.985 - 0.1 * shore);
      const glitter = inView ? clamp(glow * 1.2 + (alt > 0 ? clamp(1 - alt / 30, 0, 1) * 0.5 : 0), 0, 1) : 0;
      const N = 34;
      const step = W < 700 ? 6 : 8;

      for (let k = 1; k <= N; k++) {
        const d = k / N; // 0 at the horizon, 1 at your feet
        const y0 = hy + (H - hy) * d ** 1.9;
        if (y0 > shoreY) break;
        const a = 0.5 + 7 * d ** 1.6;
        const scale = 0.12 + d;
        const base = (0.045 + 0.12 * d) * amp;
        const gw = W * (0.04 + 0.18 * d);
        const grad = ctx!.createLinearGradient(sx - gw, 0, sx + gw, 0);
        grad.addColorStop(0, rgba(light.fg, base));
        grad.addColorStop(0.5, glitter > 0.02 ? rgba(light.ember, base + 0.45 * glitter * (1 - d * 0.5)) : rgba(light.fg, base));
        grad.addColorStop(1, rgba(light.fg, base));
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        for (let x = -step; x <= W + step; x += step) {
          let y =
            y0 +
            a *
              (0.6 * Math.sin((x * 0.011) / scale + t * 0.55 + k * 0.7) +
                0.4 * Math.sin((x * 0.023) / scale - t * 0.32 + k * 1.9));
          for (const rp of ripples) {
            const age = (now - rp.t0) / 1000;
            const rr = age * 140;
            const dx = x - rp.x, dy = (y0 - rp.y) * 3;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const fall = Math.exp(-((dist - rr) ** 2) / 600) * Math.max(0, 1 - age / 2.6);
            y += fall * 6 * (0.4 + d) * Math.sin(dist * 0.08 - age * 6);
          }
          x === -step ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
        }
        ctx!.stroke();
      }

      // ── swells: every push from the last day, travelling in ──
      // A push starts as a swell at the horizon and reaches the shore 24h later,
      // then breaks. Private repos ride in unnamed and uncoloured.
      const DAY = 86_400_000;
      const FOAM = 30 * 60_000;
      let lastLabelY = -99;
      ctx!.font = '11px "JetBrains Mono Variable", ui-monospace, monospace';
      ctx!.textAlign = 'right';
      const seenRepo = new Set<string>();
      for (const p of pushRef.current) {
        const age = wall - Date.parse(p.at);
        if (age < 0 || age > DAY + FOAM) continue;
        const col = p.private ? light.fg : routeRgb(light, p.repo);
        if (age > DAY) {
          // broken: foam along the shore, fading over half an hour
          const f = 1 - (age - DAY) / FOAM;
          ctx!.fillStyle = rgba(col, 0.35 * f * amp);
          for (let x = (Date.parse(p.at) / 7919) % 23; x < W; x += 23) {
            const fy = shoreY + swash0(t) - 4 - 6 * Math.abs(Math.sin(x * 0.07 + age / 4e5));
            ctx!.fillRect(x, fy, 2 + 4 * Math.abs(Math.sin(x * 0.31)), 1);
          }
          continue;
        }
        const prog = age / DAY;
        const y0 = hy + (shoreY - hy) * prog ** 1.6;
        const d = (y0 - hy) / (H - hy);
        const a = (0.5 + 7 * d ** 1.6) * 1.5;
        const scale = 0.12 + d;
        const k = d * N;
        const curl = prog > 0.94 ? (prog - 0.94) / 0.06 : 0; // steepening before it breaks
        ctx!.strokeStyle = rgba(col, (0.2 + 0.35 * prog) * amp);
        ctx!.lineWidth = 1.2 + 1.3 * prog;
        ctx!.beginPath();
        let labelY = y0;
        for (let x = -step; x <= W + step; x += step) {
          const y =
            y0 - curl * 4 +
            a * (0.6 * Math.sin((x * 0.011) / scale + t * 0.55 + k * 0.7) + 0.4 * Math.sin((x * 0.023) / scale - t * 0.32 + k * 1.9));
          if (x <= W - 20) labelY = y;
          x === -step ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
        }
        ctx!.stroke();
        ctx!.lineWidth = 1;
        // the newest swell from each repo carries a label
        const key = p.private ? `private:${p.repo}` : p.repo;
        if (!seenRepo.has(key) && Math.abs(labelY - lastLabelY) > 14) {
          seenRepo.add(key);
          lastLabelY = labelY;
          const hrs = Math.floor(age / 3_600_000);
          ctx!.fillStyle = rgba(col, 0.75 * amp);
          ctx!.fillText(`${p.private ? 'private' : p.repo} ${hrs}h`, W - 20, labelY - 7);
        }
      }

      // shoreline: the swash runs up and back on a ~11s set, riding the tide
      const swash = reduced ? 0 : swash0(t);
      ctx!.strokeStyle = rgba(light.fg, 0.22 * amp);
      ctx!.beginPath();
      for (let x = -step; x <= W + step; x += step) {
        const y = shoreY + swash + 3 * Math.sin(x * 0.006 + t * 0.2) + 2 * Math.sin(x * 0.017 - t * 0.5);
        x === -step ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      }
      ctx!.stroke();

      while (ripples.length && now - ripples[0].t0 > 2600) ripples.shift();
    }

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    if (reduced) draw(performance.now());
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      themeObs.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" />;
}

/* ───────────── helpers ───────────── */

interface Star { x: number; y: number; r: number; a: number; speed: number; phase: number }
interface Ripple { x: number; y: number; t0: number }
type RGB = [number, number, number];

function swash0(t: number) {
  return Math.sin(t * ((2 * Math.PI) / 11)) * 8 + Math.sin(t * 0.9) * 2;
}

const ROUTE_OF_REPO: Record<string, string> = Object.fromEntries(PROJECTS.filter((p) => p.repo).map((p) => [p.repo!, p.route]));

function routeRgb(light: ReturnType<typeof readColors>, repo: string): RGB {
  const r = ROUTE_OF_REPO[repo];
  return (r && light.routes[r]) || light.ember;
}

function horizonFrac(w: number) {
  return w < 700 ? 0.66 : 0.62;
}

function makeStars(w: number, h: number): Star[] {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const n = Math.round((w * h) / 6000);
  return Array.from({ length: n }, () => {
    const y = rnd() * h * 0.96;
    return { x: rnd() * w, y, r: rnd() < 0.08 ? 1.6 : 1, a: (0.12 + rnd() * 0.4) * (0.4 + 0.6 * (1 - y / h)), speed: 0.3 + rnd() * 1.2, phase: rnd() * 6.28 };
  });
}

/** Resolve the theme's CSS colours (oklch) to rgb by painting one pixel. */
function readColors() {
  const cs = getComputedStyle(document.documentElement);
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  const rgb = (v: string): RGB => {
    x.clearRect(0, 0, 1, 1);
    x.fillStyle = '#000';
    x.fillStyle = cs.getPropertyValue(v).trim() || '#888';
    x.fillRect(0, 0, 1, 1);
    const d = x.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  return {
    fg: rgb('--foreground'),
    primary: rgb('--primary'),
    pink: rgb('--dusk-pink'),
    ember: rgb('--ember'),
    warm: document.documentElement.dataset.theme === 'warm',
    routes: Object.fromEntries(['core', 'hardware', 'software', 'claude', 'config', 'automation'].map((r) => [r, rgb(`--route-${r}`)])) as Record<string, RGB>,
  };
}

function rgba([r, g, b]: RGB, a: number) {
  return `rgba(${r},${g},${b},${clamp(a, 0, 1).toFixed(3)})`;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

/** Dev only: ?sky=+2h (or -90m) shifts the sky to preview other hours. Never in production. */
function devOffset(): number {
  if (!import.meta.env.DEV) return 0;
  const m = /sky=([+-]?\d+)(h|m)/.exec(location.search);
  return m ? Number(m[1]) * (m[2] === 'h' ? 3_600_000 : 60_000) : 0;
}
