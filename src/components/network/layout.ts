/**
 * Geometry for the desktop project network: where each station sits in pixels, and how
 * each connection is routed between them.
 *
 * Stations keep their x/y percentages from src/data/projects.ts. Those are mapped into a
 * frame that keeps every card whole and clear of the header, telemetry and legend, so a
 * station at x 0 is a card resting on the left margin, not one cut in half.
 *
 * Routes are metro lines: horizontal and vertical runs joined by rounded corners. Each
 * connection tries a few shapes (L either way round, or a Z through the midpoint) and
 * takes the one that crosses the fewest other stations, so lines run in the gutters
 * between cards instead of underneath them.
 */
import type { Edge, Project } from '@/data/projects';

export type Pt = { x: number; y: number };
export type Size = { w: number; h: number };
export type Box = { l: number; t: number; r: number; b: number };

export const CARD_H = 60;
export const EXPANDED_W = 340;
/** parallel lanes for lines leaving a station on the same side */
export const LANE = 5;
const CORNER = 16;

/**
 * The frame station centres live in. Top clears the title and telemetry, bottom clears
 * the legend and game HUD. Very wide screens get a centred frame rather than four
 * columns stranded at the far edges.
 */
const FRAME = { top: 178, bottom: 128, side: 36, maxW: 1640 };

/**
 * Cards are wide enough for the longest name and its state (256px), a little wider on
 * big screens, and narrower only when four columns would otherwise touch (below ~1270px).
 */
export function cardWidth(w: number) {
  const fit = (Math.min(w, FRAME.maxW) - 2 * FRAME.side - 3 * 40) / 4;
  return Math.round(Math.min(272, Math.max(256, w * 0.16), fit));
}

/** mono 11px ≈ 6.7px per glyph, plus the label's padding */
export function satLabelWidth(name: string) {
  return name.length * 6.7 + 12;
}

export function place(p: Pick<Project, 'x' | 'y'>, size: Size): Pt {
  const cw = cardWidth(size.w);
  const frameW = Math.min(size.w, FRAME.maxW);
  const x0 = (size.w - frameW) / 2 + FRAME.side + cw / 2;
  const x1 = (size.w + frameW) / 2 - FRAME.side - cw / 2;
  const y0 = FRAME.top;
  const y1 = Math.max(y0 + 200, size.h - FRAME.bottom);
  return { x: Math.round(x0 + (p.x / 100) * (x1 - x0)), y: Math.round(y0 + (p.y / 100) * (y1 - y0)) };
}

/** what a station occupies when collapsed: a card, or a diamond with its name under it */
export function stationBox(p: Pick<Project, 'kind' | 'name'>, c: Pt, size: Size): Box {
  if (p.kind === 'satellite') {
    const hw = satLabelWidth(p.name) / 2;
    return { l: c.x - hw, t: c.y - 12, r: c.x + hw, b: c.y + 30 };
  }
  const hw = cardWidth(size.w) / 2;
  return { l: c.x - hw, t: c.y - CARD_H / 2, r: c.x + hw, b: c.y + CARD_H / 2 };
}

/* ───────────── routing ───────────── */

export interface RoutedEdge {
  d: string;
  length: number;
  a: Pt;
  b: Pt;
  /** stations this route still has to pass over (0 when it found a clear path) */
  hits: number;
  pts: Pt[];
}

type Axis = 'h' | 'v';
/**
 * A route shape: the axis it leaves A on, the axis it arrives at B on, and for a Z, how
 * far along the way its middle run sits (so it can use the gutter between two rows).
 */
type Shape = { leave: Axis; arrive: Axis; t: number };
const SHAPES: Shape[] = [
  { leave: 'h', arrive: 'v', t: 0 }, // L: across, then down
  { leave: 'v', arrive: 'h', t: 0 }, // L: down, then across
  ...[0.5, 0.3, 0.7, 0.2, 0.8].flatMap((t) => [
    { leave: 'h' as const, arrive: 'h' as const, t }, // Z: across, down a channel, across
    { leave: 'v' as const, arrive: 'v' as const, t }, // Z: down, across a channel, down
  ]),
];

/** where a Z's middle run sits, before channel lanes */
const channelAt = (a: Pt, b: Pt, s: Shape) => (s.leave === 'h' ? Math.round(a.x + (b.x - a.x) * s.t) : Math.round(a.y + (b.y - a.y) * s.t));

/** the corner points of a shape, before lane offsets */
function polyline(a: Pt, b: Pt, s: Shape, oa = 0, ob = 0, oc = 0): Pt[] {
  if (s.leave === 'h' && s.arrive === 'v') {
    const y = a.y + oa;
    const x = b.x + ob;
    return [{ x: a.x, y }, { x, y }, { x, y: b.y }];
  }
  if (s.leave === 'v' && s.arrive === 'h') {
    const x = a.x + oa;
    const y = b.y + ob;
    return [{ x, y: a.y }, { x, y }, { x: b.x, y }];
  }
  if (s.leave === 'h') {
    const ya = a.y + oa;
    const yb = b.y + ob;
    const mx = channelAt(a, b, s) + oc;
    return [{ x: a.x, y: ya }, { x: mx, y: ya }, { x: mx, y: yb }, { x: b.x, y: yb }];
  }
  const xa = a.x + oa;
  const xb = b.x + ob;
  const my = channelAt(a, b, s) + oc;
  return [{ x: xa, y: a.y }, { x: xa, y: my }, { x: xb, y: my }, { x: xb, y: b.y }];
}

function segHitsBox(p: Pt, q: Pt, k: Box) {
  const l = Math.min(p.x, q.x);
  const r = Math.max(p.x, q.x);
  const t = Math.min(p.y, q.y);
  const b = Math.max(p.y, q.y);
  return l < k.r && r > k.l && t < k.b && b > k.t;
}

function countHits(pts: Pt[], boxes: Box[]) {
  let n = 0;
  for (const k of boxes) {
    for (let i = 0; i < pts.length - 1; i++) {
      if (segHitsBox(pts[i], pts[i + 1], k)) {
        n++;
        break;
      }
    }
  }
  return n;
}

function pathLength(pts: Pt[]) {
  let n = 0;
  for (let i = 0; i < pts.length - 1; i++) n += Math.abs(pts[i + 1].x - pts[i].x) + Math.abs(pts[i + 1].y - pts[i].y);
  return n;
}

/** SVG path through the points with each corner rounded */
function roundedPath(pts: Pt[]) {
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const n = pts[i + 1];
    const inLen = Math.abs(c.x - p.x) + Math.abs(c.y - p.y);
    const outLen = Math.abs(n.x - c.x) + Math.abs(n.y - c.y);
    const r = Math.min(CORNER, inLen / 2, outLen / 2);
    const ux = Math.sign(c.x - p.x);
    const uy = Math.sign(c.y - p.y);
    const vx = Math.sign(n.x - c.x);
    const vy = Math.sign(n.y - c.y);
    d += ` L${c.x - ux * r},${c.y - uy * r} Q${c.x},${c.y} ${c.x + vx * r},${c.y + vy * r}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${last.x},${last.y}`;
}

const segLen = (p: Pt, q: Pt) => Math.abs(q.x - p.x) + Math.abs(q.y - p.y);

/**
 * Route every edge. Lines leaving a station on the same side get parallel lanes, so a hub
 * like dotfiles reads as a bundle of tracks instead of one smeared line.
 */
export function routeEdges(projects: Project[], edges: Edge[], size: Size): RoutedEdge[] {
  const pos: Record<string, Pt> = {};
  const box: Record<string, Box> = {};
  for (const p of projects) {
    pos[p.id] = place(p, size);
    box[p.id] = stationBox(p, pos[p.id], size);
  }

  // 1. pick each edge's shape: fewest stations crossed, then shortest, then the classic L
  const shapes = edges.map((e) => {
    const a = pos[e.from];
    const b = pos[e.to];
    const others = projects.filter((p) => p.id !== e.from && p.id !== e.to).map((p) => box[p.id]);
    const classic = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y) ? 0 : 1;
    let best = { shape: SHAPES[classic], score: Infinity };
    SHAPES.forEach((s, k) => {
      const pts = polyline(a, b, s);
      // a Z only earns its extra corners by clearing a station; off-centre ones a little more so
      const score = countHits(pts, others) * 1000 + pathLength(pts) + (k >= 2 ? 120 + Math.abs(s.t - 0.5) * 100 : 0) + (k === classic ? 0 : 1);
      if (score < best.score) best = { shape: s, score };
    });
    return best.shape;
  });

  // 2. lanes: group the legs that leave each station on the same side
  type Leg = { edge: number; node: string; key: string; sortBy: number };
  const legs: Leg[] = [];
  edges.forEach((e, i) => {
    const a = pos[e.from];
    const b = pos[e.to];
    const s = shapes[i];
    const sideA = s.leave === 'h' ? Math.sign(b.x - a.x) : Math.sign(b.y - a.y);
    const sideB = s.arrive === 'h' ? Math.sign(a.x - b.x) : Math.sign(a.y - b.y);
    legs.push({ edge: i, node: e.from, key: `${e.from}:${s.leave}:${sideA}`, sortBy: s.leave === 'h' ? b.y : b.x });
    legs.push({ edge: i, node: e.to, key: `${e.to}:${s.arrive}:${sideB}`, sortBy: s.arrive === 'h' ? a.y : a.x });
  });
  const buckets = new Map<string, Leg[]>();
  for (const l of legs) buckets.set(l.key, [...(buckets.get(l.key) ?? []), l]);
  const offset = new Map<string, number>(); // `${edge}:${node}` → px
  for (const group of buckets.values()) {
    group.sort((p, q) => p.sortBy - q.sortBy);
    group.forEach((l, i) => offset.set(`${l.edge}:${l.node}`, (i - (group.length - 1) / 2) * LANE));
  }

  // 3. Z routes whose middle runs share a channel get lanes there too
  const channel = new Map<number, number>(); // edge → px
  const channels = new Map<string, number[]>();
  edges.forEach((e, i) => {
    const s = shapes[i];
    if (s.leave !== s.arrive) return;
    const a = pos[e.from];
    const b = pos[e.to];
    const key = `${s.leave}${channelAt(a, b, s)}`;
    channels.set(key, [...(channels.get(key) ?? []), i]);
  });
  for (const group of channels.values()) {
    const along = (i: number) => (shapes[i].leave === 'h' ? pos[edges[i].from].y + pos[edges[i].to].y : pos[edges[i].from].x + pos[edges[i].to].x);
    group.sort((p, q) => along(p) - along(q));
    group.forEach((i, k) => channel.set(i, (k - (group.length - 1) / 2) * LANE));
  }

  // 4. draw
  return edges.map((e, i) => {
    const a = pos[e.from];
    const b = pos[e.to];
    const s = shapes[i];
    const pts = polyline(a, b, s, offset.get(`${i}:${e.from}`) ?? 0, offset.get(`${i}:${e.to}`) ?? 0, channel.get(i) ?? 0).filter(
      (p, k, all) => k === 0 || p.x !== all[k - 1].x || p.y !== all[k - 1].y,
    );
    const others = projects.filter((p) => p.id !== e.from && p.id !== e.to).map((p) => box[p.id]);
    return { d: roundedPath(pts), length: pathLength(pts), a, b, hits: countHits(pts, others), pts };
  });
}

/* ───────────── connection labels ───────────── */

/** the point `dist` px along a polyline */
function pointAt(pts: Pt[], dist: number): Pt {
  let left = dist;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = segLen(pts[i], pts[i + 1]);
    if (left <= l) {
      const f = l ? left / l : 0;
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f };
    }
    left -= l;
  }
  return pts[pts.length - 1];
}

const overlaps = (a: Box, b: Box) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

/** fractions of a route, measured from the far station, where a label may sit (best first) */
const LABEL_SPOTS = [0.3, 0.4, 0.22, 0.5, 0.6, 0.15, 0.7, 0.8, 0.1, 0.9];
const LABEL_H = 16;

/**
 * Put each lit connection's label on its line, out toward the *other* station so a hub's
 * labels fan out, at the first spot that covers no station and no earlier label.
 * Mono 11px ≈ 6.7px per glyph.
 */
export function placeLabels(projects: Project[], edges: Edge[], routed: RoutedEdge[], lit: Iterable<number>, active: string | null, size: Size) {
  const stations = projects.map((p) => {
    const k = stationBox(p, place(p, size), size);
    return { l: k.l - 4, t: k.t - 3, r: k.r + 4, b: k.b + 3 };
  });
  const placed: { i: number; x: number; y: number; w: number; box: Box }[] = [];
  const boxAt = (c: Pt, w: number): Box => ({ l: c.x - w / 2 - 3, t: c.y - LABEL_H / 2, r: c.x + w / 2 + 3, b: c.y + LABEL_H / 2 });
  for (const i of lit) {
    const r = routed[i];
    if (!r) continue;
    const e = edges[i];
    const w = e.label.length * 6.7 + 10;
    // walk from the far end: when the active station is `from`, that is the `to` end
    const pts = active === e.to ? r.pts : [...r.pts].reverse();
    const inside = (k: Box) => k.l > 8 && k.r < size.w - 8 && k.t > 8 && k.b < size.h - 8;
    const free = (k: Box) => inside(k) && !stations.some((s) => overlaps(s, k)) && !placed.some((p) => overlaps(p.box, k));
    // on the line first; failing that, just beside it (a short hop between two cards)
    let spot: Pt | null = null;
    search: for (const off of [0, -18, 18, -42, 42]) {
      for (const f of LABEL_SPOTS) {
        const c = pointAt(pts, f * r.length);
        const horizontal = pts.some((p, k) => k > 0 && p.y === pts[k - 1].y && p.y === c.y);
        const o = horizontal ? { x: c.x, y: c.y + off } : { x: c.x + Math.sign(off) * (Math.abs(off) + w / 2), y: c.y };
        if (free(boxAt(off ? o : c, w))) {
          spot = off ? o : c;
          break search;
        }
      }
    }
    if (!spot) {
      // nowhere clear on the line: stack it clear of the other labels near the preferred spot
      const c = pointAt(pts, LABEL_SPOTS[0] * r.length);
      let y = c.y;
      for (let k = 1; k < 12 && placed.some((p) => overlaps(p.box, boxAt({ x: c.x, y }, w))); k++) {
        y = c.y + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * LABEL_H;
      }
      spot = { x: c.x, y };
    }
    placed.push({ i, x: spot.x, y: spot.y, w, box: boxAt(spot, w) });
  }
  return placed;
}
