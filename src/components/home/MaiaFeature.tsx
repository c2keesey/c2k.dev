import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/system';
import type { NetworkLive } from '@/components/network/shared';
import { PROJECT_BY_ID } from '@/data/projects';
import { prefersReducedMotion } from '@/lib/scramble';
import { cn } from '@/lib/utils';

/**
 * The MAIA showcase from the legacy home, rebuilt and taken further. Copy comes from
 * projects.ts (the sync bot keeps it current). The map is a demo of the product's loop:
 * a question types in, a scan passes over a procedurally generated city, and the
 * answer draws itself as parcels. It's an illustration, so it shows shapes, not numbers.
 */
const QUERIES = [
  { q: 'show solar potential in Denver', mode: 'solar' },
  { q: 'find parcels > 2 acres near I-70', mode: 'acres' },
  { q: 'map building footprints downtown', mode: 'footprints' },
  { q: 'analyze rooftop area for panels', mode: 'rooftops' },
] as const;
type Mode = (typeof QUERIES)[number]['mode'];

export function MaiaFeature({ live }: { live: NetworkLive }) {
  const p = PROJECT_BY_ID.maia;
  const status = live.statusOf(p);
  const [query, setQuery] = React.useState('');
  const [phase, setPhase] = React.useState<'typing' | 'scanning' | 'answer'>('typing');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return runMap(canvas, setQuery, setPhase);
  }, []);

  return (
    <article className="maia relative min-w-0 overflow-hidden rounded-lg border p-5 backdrop-blur-md sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <img src="/MAIA-logo-white.svg" alt="MAIA" className="maia-logo h-[22px] w-auto" />
        <div className="flex items-center gap-3">
          <StatusBadge status={status} activity={p.activity} />
          <Badge variant="role" className="maia-chip">founder</Badge>
        </div>
      </div>
      <h2 className="mt-4 font-display text-xl text-foreground">{p.tagline}</h2>
      <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{p.description}</p>

      <figure className="maia-map mt-5 overflow-hidden rounded-md border">
        <canvas ref={canvasRef} className="block h-[200px] w-full sm:h-[260px]" aria-hidden="true" />
        <figcaption className="maia-query flex items-center gap-2 border-t px-3 py-2 font-mono text-xs">
          <span aria-hidden="true">&gt;</span>
          <span className="min-w-0 truncate">{query}</span>
          <span className={cn('maia-caret inline-block h-3.5 w-[7px]', phase !== 'typing' && 'opacity-0')} aria-hidden="true" />
          <span className="chrome ml-auto shrink-0" aria-live="off">
            {phase === 'scanning' ? 'reading parcels' : phase === 'answer' ? 'mapped' : ''}
          </span>
        </figcaption>
      </figure>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {p.tech.map((t) => (
          <Badge key={t} variant="tag">{t}</Badge>
        ))}
        {p.link && (
          <a href={p.link} target="_blank" rel="noopener" className="maia-link ml-auto font-mono text-xs underline-offset-4 hover:underline">
            {p.linkText ?? p.link}
          </a>
        )}
      </div>
    </article>
  );
}

/* ───────────── the map ───────────── */

interface Parcel { x: number; y: number; w: number; h: number; v: number; downtown: number; fp: { x: number; y: number; w: number; h: number } | null }

function runMap(canvas: HTMLCanvasElement, setQuery: (s: string) => void, setPhase: (p: 'typing' | 'scanning' | 'answer') => void) {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const reduced = prefersReducedMotion();
  let W = 0, H = 0;
  let parcels: Parcel[] = [];
  let highway: Array<[number, number]> = [];
  let raf = 0;
  let hover: { x: number; y: number } | null = null;

  // seeded so the city is the same city every visit
  let seed = 42;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const build = () => {
    seed = 42;
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    parcels = [];
    const street = 6;
    const bw = 58, bh = 40;
    const cx = W * 0.58, cy = H * 0.45;
    for (let by = -bh * 0.4; by < H; by += bh + street) {
      for (let bx = -bw * 0.3; bx < W; bx += bw + street) {
        // split each block into 2–4 lots along its long side
        const n = 2 + Math.floor(rnd() * 3);
        let x = bx;
        for (let i = 0; i < n; i++) {
          const lw = i === n - 1 ? bx + bw - x : (bw / n) * (0.7 + rnd() * 0.6);
          const split = rnd() < 0.5;
          const rows = split ? [[by, bh / 2 - 1], [by + bh / 2 + 1, bh / 2 - 1]] : [[by, bh]];
          for (const [ry, rh] of rows) {
            const dd = Math.hypot(x + lw / 2 - cx, ry + rh / 2 - cy) / Math.hypot(W, H);
            const inset = 3 + rnd() * 3;
            parcels.push({
              x: x + 1, y: ry, w: lw - 2, h: rh, v: rnd(),
              downtown: dd,
              fp: rnd() < 0.8 ? { x: x + inset, y: ry + inset, w: Math.max(4, lw - 2 * inset - rnd() * 6), h: Math.max(4, rh - 2 * inset - rnd() * 6) } : null,
            });
          }
          x += lw;
        }
      }
    }
    // an interstate cutting across on a diagonal
    highway = [];
    for (let x = -10; x <= W + 10; x += 10) highway.push([x, H * 0.82 - x * 0.28 + Math.sin(x / 90) * 8]);
  };

  const css = (v: string) => getComputedStyle(canvas).getPropertyValue(v).trim();
  const distToHighway = (px: number, py: number) => {
    let best = Infinity;
    for (const [hx, hy] of highway) best = Math.min(best, Math.hypot(px - hx, py - hy));
    return best;
  };

  // query cycle
  let qi = 0, t0 = performance.now();
  const TYPE = 45, SCAN = 1100, HOLD = 4200;
  let lastPhase = '';

  const matches = (p: Parcel, mode: Mode) => {
    if (mode === 'solar') return true;
    if (mode === 'acres') return p.w * p.h > 650 && distToHighway(p.x + p.w / 2, p.y + p.h / 2) < 75;
    if (mode === 'footprints') return !!p.fp && p.downtown < 0.28;
    return !!p.fp && p.fp.w * p.fp.h > 260;
  };

  const draw = (now: number) => {
    const { q, mode } = QUERIES[qi];
    const typeEnd = q.length * TYPE;
    const el = now - t0;
    const phase = el < typeEnd ? 'typing' : el < typeEnd + SCAN ? 'scanning' : 'answer';
    if (phase !== lastPhase) {
      setPhase(phase);
      lastPhase = phase;
    }
    setQuery(q.slice(0, Math.min(q.length, Math.ceil(el / TYPE))));
    if (el > typeEnd + SCAN + HOLD) {
      qi = (qi + 1) % QUERIES.length;
      t0 = now;
    }

    const cyan = css('--maia');
    const ember = css('--ember');
    const fg = css('--foreground');
    ctx.clearRect(0, 0, W, H);

    // the city at rest
    ctx.lineWidth = 1;
    for (const p of parcels) {
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = cyan;
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
      if (p.fp) {
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = fg;
        ctx.fillRect(p.fp.x, p.fp.y, p.fp.w, p.fp.h);
      }
    }
    // interstate
    ctx.globalAlpha = mode === 'acres' && phase !== 'typing' ? 0.7 : 0.22;
    ctx.strokeStyle = mode === 'acres' && phase !== 'typing' ? ember : fg;
    ctx.lineWidth = 2;
    ctx.beginPath();
    highway.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.lineWidth = 1;

    // scan sweep
    const scanX = phase === 'scanning' ? ((el - typeEnd) / SCAN) * (W + 80) - 40 : phase === 'answer' ? W + 80 : -80;
    if (phase === 'scanning') {
      const g = ctx.createLinearGradient(scanX - 60, 0, scanX, 0);
      g.addColorStop(0, 'transparent');
      g.addColorStop(1, cyan);
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = g;
      ctx.fillRect(scanX - 60, 0, 60, H);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = cyan;
      ctx.fillRect(scanX, 0, 1, H);
    }

    // the answer, drawn where the scan has passed, each parcel resolving with a short delay
    const sinceAnswer = phase === 'answer' ? el - typeEnd - SCAN : -1;
    const fade = phase === 'answer' ? Math.min(1, (HOLD - sinceAnswer) / 500) : 1;
    for (const p of parcels) {
      if (phase === 'typing' || !matches(p, mode)) continue;
      if (p.x > scanX) continue;
      const born = (p.x / W) * 300 + p.v * 200;
      const a = Math.max(0, Math.min(1, ((phase === 'answer' ? sinceAnswer + SCAN : (scanX - p.x) * 3) - born) / 260)) * fade;
      if (a <= 0) continue;
      if (mode === 'solar') {
        // most roofs are middling; a few stand out
        ctx.globalAlpha = a * (p.v > 0.9 ? 0.45 : 0.04 + 0.2 * p.v);
        ctx.fillStyle = p.v > 0.9 ? ember : cyan;
        ctx.fillRect(p.x, p.y, p.w, p.h);
      } else if (mode === 'acres') {
        ctx.globalAlpha = a * 0.9;
        ctx.strokeStyle = cyan;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
        ctx.globalAlpha = a * 0.2;
        ctx.fillStyle = cyan;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.lineWidth = 1;
      } else if (mode === 'footprints' && p.fp) {
        ctx.globalAlpha = a * 0.75;
        ctx.fillStyle = cyan;
        ctx.fillRect(p.fp.x, p.fp.y, p.fp.w, p.fp.h);
      } else if (mode === 'rooftops' && p.fp) {
        const area = Math.min(1, (p.fp.w * p.fp.h) / 900);
        ctx.globalAlpha = a * (0.25 + 0.6 * area);
        ctx.fillStyle = ember;
        ctx.fillRect(p.fp.x, p.fp.y, p.fp.w, p.fp.h);
      }
    }

    // a parcel lights up under the cursor
    if (hover) {
      const hp = parcels.find((p) => hover!.x >= p.x && hover!.x <= p.x + p.w && hover!.y >= p.y && hover!.y <= p.y + p.h);
      if (hp) {
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = fg;
        ctx.strokeRect(hp.x + 0.5, hp.y + 0.5, hp.w - 1, hp.h - 1);
      }
    }
    ctx.globalAlpha = 1;
    if (!reduced) raf = requestAnimationFrame(draw);
  };

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    hover = { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onLeave = () => (hover = null);
  const ro = new ResizeObserver(() => build());
  ro.observe(canvas);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  build();
  if (reduced) {
    // one finished answer, no motion
    t0 = performance.now() - (QUERIES[0].q.length * TYPE + SCAN + 300);
    draw(performance.now());
  } else raf = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
  };
}
