import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import {
  Readout,
  RelativeTime,
  ROUTES,
  Scramble,
  Sparkline,
  StatusBadge,
  StatusDot,
  STATUS_META,
  type Route,
} from '@/components/system';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/scramble';
import { NetworkOptimizer } from '@/game/optimizer';
import { EDGES, EDGES_BY_NODE, PROJECTS, PROJECT_BY_ID, ROUTE_ORDER, neighbours, type Project } from '@/data/projects';
import { MeshField } from './MeshField';
import { ProjectFacts, useNetworkLive, useShowcaseMount, type NetworkLive } from './shared';

/* ───────────── geometry ───────────── */

/** the map's drawable area inside the surface: room for the header and legend */
const INSET = { top: 84, right: 120, bottom: 72, left: 96 };
const CARD_W = 256;
const CARD_H = 60;
const EXPANDED_W = 340;
const LANE = 5;
const CORNER = 18;

type Pt = { x: number; y: number };
type Size = { w: number; h: number };

function place(p: Project, size: Size): Pt {
  const w = size.w - INSET.left - INSET.right;
  const h = size.h - INSET.top - INSET.bottom;
  return { x: INSET.left + (p.x / 100) * w, y: INSET.top + (p.y / 100) * h };
}

interface RoutedEdge {
  d: string;
  length: number;
  /** label spots: on the leg leaving `from`, and on the leg arriving at `to` */
  nearFrom: Pt;
  nearTo: Pt;
  a: Pt;
  b: Pt;
}

/**
 * Metro routing: every edge is one horizontal and one vertical run joined by a rounded
 * corner. Lines leaving a station on the same side get parallel lanes, so a hub like
 * dotfiles reads as a bundle of tracks instead of one smeared line.
 */
function routeEdges(size: Size): RoutedEdge[] {
  const pos = Object.fromEntries(PROJECTS.map((p) => [p.id, place(p, size)]));
  type Leg = { edge: number; node: string; key: string; sortBy: number };
  const legs: Leg[] = [];
  const horizFirst = EDGES.map((e) => {
    const a = pos[e.from];
    const b = pos[e.to];
    return Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
  });

  EDGES.forEach((e, i) => {
    const a = pos[e.from];
    const b = pos[e.to];
    if (horizFirst[i]) {
      // leaves A horizontally toward B; arrives at B vertically from A's side
      legs.push({ edge: i, node: e.from, key: `${e.from}:h:${Math.sign(b.x - a.x)}`, sortBy: b.y });
      legs.push({ edge: i, node: e.to, key: `${e.to}:v:${Math.sign(a.y - b.y)}`, sortBy: a.x });
    } else {
      legs.push({ edge: i, node: e.from, key: `${e.from}:v:${Math.sign(b.y - a.y)}`, sortBy: b.x });
      legs.push({ edge: i, node: e.to, key: `${e.to}:h:${Math.sign(a.x - b.x)}`, sortBy: a.y });
    }
  });

  const buckets = new Map<string, Leg[]>();
  for (const l of legs) buckets.set(l.key, [...(buckets.get(l.key) ?? []), l]);
  const offset = new Map<string, number>(); // `${edge}:${node}` → px
  for (const group of buckets.values()) {
    group.sort((p, q) => p.sortBy - q.sortBy);
    group.forEach((l, i) => offset.set(`${l.edge}:${l.node}`, (i - (group.length - 1) / 2) * LANE));
  }

  return EDGES.map((e, i) => {
    const a = pos[e.from];
    const b = pos[e.to];
    const oa = offset.get(`${i}:${e.from}`) ?? 0;
    const ob = offset.get(`${i}:${e.to}`) ?? 0;
    if (horizFirst[i]) {
      const y1 = a.y + oa;
      const x2 = b.x + ob;
      const sx = Math.sign(x2 - a.x) || 1;
      const sy = Math.sign(b.y - y1) || 1;
      const r = Math.min(CORNER, Math.abs(x2 - a.x) / 2, Math.abs(b.y - y1) / 2);
      const d = `M${a.x},${y1} H${x2 - sx * r} Q${x2},${y1} ${x2},${y1 + sy * r} V${b.y}`;
      const h = Math.abs(x2 - a.x);
      const v = Math.abs(b.y - y1);
      const legH = { x: (a.x + x2) / 2, y: y1 };
      const legV = { x: x2, y: (y1 + b.y) / 2 };
      return { d, length: h + v, nearFrom: h > 70 ? legH : legV, nearTo: v > 40 ? legV : legH, a, b };
    }
    const x1 = a.x + oa;
    const y2 = b.y + ob;
    const sx = Math.sign(b.x - x1) || 1;
    const sy = Math.sign(y2 - a.y) || 1;
    const r = Math.min(CORNER, Math.abs(b.x - x1) / 2, Math.abs(y2 - a.y) / 2);
    const d = `M${x1},${a.y} V${y2 - sy * r} Q${x1},${y2} ${x1 + sx * r},${y2} H${b.x}`;
    const v = Math.abs(y2 - a.y);
    const h = Math.abs(b.x - x1);
    const legV = { x: x1, y: (a.y + y2) / 2 };
    const legH = { x: (x1 + b.x) / 2, y: y2 };
    return { d, length: h + v, nearFrom: v > 40 ? legV : legH, nearTo: h > 70 ? legH : legV, a, b };
  });
}

/**
 * Put each lit connection's label out near the *other* station so a hub's labels fan
 * out, then nudge any that would overlap an earlier one. Mono 11px ≈ 6.7px per glyph.
 */
function placeLabels(routed: RoutedEdge[], lit: Set<number>, active: string | null) {
  const placed: { i: number; x: number; y: number; w: number }[] = [];
  const H = 17;
  for (const i of lit) {
    const r = routed[i];
    if (!r) continue;
    const e = EDGES[i];
    const spot = active === e.from ? r.nearTo : active === e.to ? r.nearFrom : r.nearTo;
    const w = e.label.length * 6.7 + 10;
    let y = spot.y;
    for (let k = 1; k < 12; k++) {
      const hit = placed.some((p) => Math.abs(p.x - spot.x) < (p.w + w) / 2 && Math.abs(p.y - y) < H);
      if (!hit) break;
      y = spot.y + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * H;
    }
    placed.push({ i, x: spot.x, y, w });
  }
  return placed;
}

/* ───────────── the island ───────────── */

type Popup = { kind: 'node'; id: string; x: number; y: number } | { kind: 'edge'; index: number; x: number; y: number };

export default function ProjectNetwork() {
  const live = useNetworkLive();
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState<Size | null>(null);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [docked, setDocked] = React.useState(false);
  const [routeFocus, setRouteFocus] = React.useState<Route | null>(null);
  const [motion, setMotion] = React.useState(true);

  React.useEffect(() => setMotion(!prefersReducedMotion()), []);

  React.useLayoutEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const routed = React.useMemo(() => (size ? routeEdges(size) : []), [size]);

  /* hidden idle game: right-click a node or a connection label */
  const game = useOptimizer();

  /* highlight state */
  const active = selected ?? hovered;
  const litEdges = React.useMemo(() => {
    if (active) return new Set(EDGES_BY_NODE[active]);
    if (routeFocus) return new Set(EDGES.flatMap((e, i) => (PROJECT_BY_ID[e.from].route === routeFocus || PROJECT_BY_ID[e.to].route === routeFocus ? [i] : [])));
    return null;
  }, [active, routeFocus]);
  const litNodes = React.useMemo(() => {
    if (active) return new Set([active, ...neighbours(active)]);
    if (routeFocus) return new Set(PROJECTS.filter((p) => p.route === routeFocus).map((p) => p.id));
    return null;
  }, [active, routeFocus]);

  const select = React.useCallback((id: string | null) => {
    setSelected(id);
    setDocked(false);
    setHovered(null);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (game.popup) game.setPopup(null);
      else if (docked) setDocked(false);
      else if (selected) select(null);
      else if (routeFocus) setRouteFocus(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [docked, selected, routeFocus, select, game]);

  // closing the dock hands focus back to the station it came from
  const wasDocked = React.useRef(false);
  React.useEffect(() => {
    if (wasDocked.current && !docked && selected) {
      document.querySelector<HTMLButtonElement>(`[aria-controls="node-${selected}"]`)?.focus({ preventScroll: true });
    }
    wasDocked.current = docked;
  }, [docked, selected]);

  const selectedProject = selected ? PROJECT_BY_ID[selected] : null;
  const dockSide: 'left' | 'right' = selectedProject && selectedProject.x > 50 ? 'left' : 'right';

  return (
    <div
      ref={mapRef}
      className="relative h-full w-full overflow-hidden bg-dot-grid select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.mapBg !== undefined) {
          if (docked) setDocked(false);
          else select(null);
        }
      }}
      onContextMenu={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <MeshField target={mapRef} />
      <div className="pointer-events-none absolute inset-0 bg-vignette" aria-hidden />

      {size && (
        <svg className="absolute inset-0" width={size.w} height={size.h} aria-hidden data-map-bg>
          <defs>
            <filter id="packet-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="line-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            {EDGES.map((e, i) => {
              const r = routed[i];
              const ra = PROJECT_BY_ID[e.from].route;
              const rb = PROJECT_BY_ID[e.to].route;
              if (!r || ra === rb) return null;
              return (
                <linearGradient key={i} id={`edge-grad-${i}`} gradientUnits="userSpaceOnUse" x1={r.a.x} y1={r.a.y} x2={r.b.x} y2={r.b.y}>
                  <stop offset="0.2" stopColor={ROUTES[ra].stroke} />
                  <stop offset="0.8" stopColor={ROUTES[rb].stroke} />
                </linearGradient>
              );
            })}
          </defs>

          {EDGES.map((e, i) => {
            const r = routed[i];
            if (!r) return null;
            const ra = PROJECT_BY_ID[e.from].route;
            const rb = PROJECT_BY_ID[e.to].route;
            const stroke = ra === rb ? ROUTES[ra].stroke : `url(#edge-grad-${i})`;
            const lit = litEdges?.has(i);
            const dim = litEdges && !lit;
            const level = game.levels.edges[i] ?? 0;
            const flow = game.flow(i);
            const density = game.density(i);
            return (
              <g key={i} className="transition-opacity duration-150 ease-snap" style={{ opacity: lit ? 1 : dim ? 0.12 : 0.5 }}>
                {lit && <path d={r.d} fill="none" stroke={stroke} strokeWidth={4} opacity={0.35} filter="url(#line-glow)" />}
                <path
                  d={r.d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={lit ? 1.75 : 1.25 + level * 0.35}
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                  className={lit ? 'animate-flow' : 'animate-flow-slow'}
                  style={{ animationDuration: `${(lit ? 1.2 : 3) / flow}s` }}
                />
                {motion &&
                  Array.from({ length: density }, (_, k) => (
                    <circle key={k} r={lit ? 2.2 : 1.6} fill={ROUTES[ra].stroke} filter="url(#packet-glow)">
                      <animateMotion
                        dur={`${Math.max(2.5, r.length / (55 * flow))}s`}
                        begin={`-${((i * 1.37 + k * 0.5) % 1) * Math.max(2.5, r.length / (55 * flow))}s`}
                        repeatCount="indefinite"
                        path={r.d}
                      />
                    </circle>
                  ))}
              </g>
            );
          })}
        </svg>
      )}

      {/* connection labels: only for lit routes, so the map stays quiet */}
      {size &&
        litEdges &&
        placeLabels(routed, litEdges, active).map(({ i, x, y }) => (
          <span
            key={i}
            className="chrome absolute z-[25] -translate-x-1/2 -translate-y-1/2 rounded-xs bg-background/85 px-1 whitespace-nowrap text-muted-foreground"
            style={{ left: x, top: y }}
            onContextMenu={(ev) => {
              ev.preventDefault();
              game.open({ kind: 'edge', index: i, x: ev.clientX, y: ev.clientY }, mapRef.current);
            }}
          >
            {EDGES[i].label}
          </span>
        ))}

      {/* stations */}
      {size &&
        PROJECTS.map((p, i) => (
          <Station
            key={p.id}
            project={p}
            index={i}
            size={size}
            live={live}
            expanded={selected === p.id && !docked}
            selected={selected === p.id}
            lit={litNodes ? litNodes.has(p.id) : null}
            level={game.levels.nodes[p.id] ?? 0}
            rate={game.activated ? game.rate(p.id) : null}
            onHover={(v) => !selected && setHovered(v ? p.id : null)}
            onToggle={() => (selected === p.id ? select(null) : select(p.id))}
            onOpenShowcase={() => setDocked(true)}
            onSelect={select}
            onContextMenu={(ev) => {
              ev.preventDefault();
              game.open({ kind: 'node', id: p.id, x: ev.clientX, y: ev.clientY }, mapRef.current);
            }}
          />
        ))}

      <Header live={live} />
      <Legend routeFocus={routeFocus} onRouteFocus={(r) => { select(null); setRouteFocus(r); }} />
      <Telemetry live={live} />
      {game.activated && <GameHud tp={game.tp} rate={game.totalRate} />}
      {game.popup && <UpgradePopup game={game} />}

      {selectedProject?.showcase && docked && (
        <ShowcaseDock project={selectedProject} side={dockSide} live={live} onClose={() => setDocked(false)} onSelect={select} />
      )}
    </div>
  );
}

/* ───────────── station (node) ───────────── */

interface StationProps {
  project: Project;
  index: number;
  size: Size;
  live: NetworkLive;
  expanded: boolean;
  selected: boolean;
  /** null = nothing is highlighted; true/false = in or out of the highlight */
  lit: boolean | null;
  level: number;
  rate: number | null;
  onHover: (v: boolean) => void;
  onToggle: () => void;
  onOpenShowcase: () => void;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function Station({ project: p, index, size, live, expanded, selected, lit, level, rate, onHover, onToggle, onOpenShowcase, onSelect, onContextMenu }: StationProps) {
  const c = place(p, size);
  const r = ROUTES[p.route];
  const status = live.statusOf(p);
  const id = `node-${p.id}`;
  const satellite = p.kind === 'satellite';
  const pushed = p.repo ? live.pushedAt[p.repo] : undefined;
  const links = EDGES_BY_NODE[p.id].length;

  // Expanded cards stay inside the map: clamp horizontally, and grow upward from the
  // lower half so a node near the bottom edge opens toward the middle.
  const growUp = c.y > size.h * 0.55;
  const width = expanded ? EXPANDED_W : CARD_W;
  const left = expanded ? Math.min(Math.max(c.x - width / 2, 16), size.w - width - 16) : c.x - CARD_W / 2;
  const top = expanded && growUp ? c.y + CARD_H / 2 : c.y - CARD_H / 2;

  const dim = lit === false;
  // a small build swaps its diamond for a card when opened; keep keyboard focus on it
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (satellite && expanded) toggleRef.current?.focus({ preventScroll: true });
  }, [satellite, expanded]);
  const nameEl = <Scramble text={p.name} trigger="mount" delay={250 + index * 45} duration={700} />;

  if (satellite && !expanded) {
    return (
      <button
        type="button"
        aria-expanded={false}
        aria-controls={id}
        aria-label={`${p.name}: ${p.tagline}. ${STATUS_META[status].label}`}
        onClick={onToggle}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        onContextMenu={onContextMenu}
        className={cn(
          'group/sat absolute z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-sm px-1.5 pt-1 pb-0.5 transition-opacity duration-150 ease-snap',
          dim && 'opacity-25',
        )}
        style={{ left: c.x, top: c.y - 9, ['--node-color' as string]: r.stroke }}
      >
        <span
          className="grid size-[18px] rotate-45 place-items-center rounded-[3px] border bg-background transition-[border-color,background-color] duration-200 group-hover/sat:bg-surface-2"
          style={{ borderColor: `color-mix(in oklch, ${r.stroke} ${45 + level * 15}%, transparent)` }}
        >
          <StatusDot status={status} activity={p.activity} className="-rotate-45" />
        </span>
        <span className={cn('rounded-xs bg-background/85 px-1 font-mono text-2xs font-medium whitespace-nowrap', r.text)}>{nameEl}</span>
        <span className="chrome -mt-1 rounded-xs bg-background/85 px-1 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sat:opacity-100 group-focus-visible/sat:opacity-100">
          {p.tagline}
        </span>
        {rate !== null && <span className="chrome -mt-1 text-ember tabular">{rate.toFixed(2)}/s</span>}
      </button>
    );
  }

  return (
    <article
      data-route={p.route}
      data-expanded={expanded || undefined}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onContextMenu={onContextMenu}
      className={cn(
        'group/node panel absolute flex flex-col transition-[width,left,opacity,border-color] duration-300 ease-snap',
        expanded ? 'z-30 rounded-lg bg-popover/95' : 'z-20',
        growUp && expanded && '-translate-y-full',
        dim && 'opacity-30',
        selected && !expanded && 'border-[color-mix(in_oklch,var(--node-color)_55%,transparent)]',
      )}
      style={{
        left,
        top,
        width,
        ['--node-color' as string]: r.stroke,
        borderColor: expanded || level ? `color-mix(in oklch, ${r.stroke} ${expanded ? 45 : 18 + level * 14}%, transparent)` : undefined,
      }}
    >
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={onToggle}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        className="flex h-[60px] w-full shrink-0 cursor-pointer flex-col justify-center gap-0.5 rounded-[inherit] px-3.5 text-left"
      >
        <span className="flex w-full min-w-0 items-center gap-2">
          <StatusDot status={status} activity={p.activity} />
          <span className={cn('truncate font-mono text-sm font-medium', r.text)}>{nameEl}</span>
          <span className={cn('chrome ml-auto shrink-0', STATUS_META[status].text)}>{STATUS_META[status].label}</span>
        </span>
        <span className="flex min-w-0 items-center gap-2 pl-3.5">
          <span className="truncate text-xs text-muted-foreground">{p.tagline}</span>
          {rate !== null && <span className="chrome ml-auto shrink-0 text-ember tabular">{rate.toFixed(2)}/s</span>}
        </span>
      </button>

      {/* hover preview: one line of real readings */}
      {!expanded && (
        <span className="chrome pointer-events-none absolute top-full left-2.5 mt-1.5 rounded-xs bg-background/85 px-1 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/node:opacity-100 group-focus-within/node:opacity-100">
          {links} connections{p.repo ? <> · last push {pushed ? <RelativeTime date={pushed} tick={60_000} /> : '--'}</> : null}
        </span>
      )}

      <div id={id} className={cn('grid transition-[grid-template-rows] duration-300 ease-snap', expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="min-h-0 overflow-hidden" inert={!expanded}>
          <div className="max-h-[min(460px,56vh)] overflow-y-auto border-t border-border px-3.5 pt-3 pb-3.5">
            <ProjectFacts project={p} live={live} onSelect={onSelect} />
            {p.showcase && (
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={onOpenShowcase}>
                {p.showcase === 'alldifferent' ? 'Play it here' : 'Open the showcase'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ───────────── showcase dock ───────────── */

function ShowcaseDock({ project, side, live, onClose, onSelect }: { project: Project; side: 'left' | 'right'; live: NetworkLive; onClose: () => void; onSelect: (id: string) => void }) {
  const [host, setHost] = React.useState<HTMLDivElement | null>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  useShowcaseMount(project.showcase, host);
  React.useEffect(() => closeRef.current?.focus(), [project.id]);
  const r = ROUTES[project.route];
  const status = live.statusOf(project);

  return (
    <section
      role="region"
      aria-label={`${project.name} showcase`}
      className={cn(
        'absolute top-32 bottom-24 z-40 flex w-[min(700px,54%)] flex-col overflow-hidden rounded-lg border border-border-strong bg-popover/95 shadow-2xl backdrop-blur-md',
        'animate-in fade-in-0 duration-200',
        side === 'right' ? 'right-6' : 'left-6',
      )}
      style={{ borderColor: `color-mix(in oklch, ${r.stroke} 35%, transparent)` }}
    >
      <header className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <StatusDot status={status} activity={project.activity} />
        <h2 className={cn('font-mono text-sm font-medium', r.text)}>
          <Scramble text={project.name} trigger="mount" duration={500} />
        </h2>
        <span className="chrome">{project.tagline}</span>
        <span className={cn('chrome ml-auto', r.text)}>{r.name}</span>
        <Button ref={closeRef} variant="ghost" size="icon" className="size-7" onClick={onClose} aria-label="Close showcase">
          <X className="size-4" />
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div ref={setHost} className="showcase-host p-4" />
        <div className="border-t border-border px-4 py-4">
          <ProjectFacts project={project} live={live} onSelect={onSelect} />
        </div>
      </div>
    </section>
  );
}

/* ───────────── chrome: header, legend, telemetry ───────────── */

function Header({ live }: { live: NetworkLive }) {
  const { online, total } = live.nominal;
  return (
    <div className="pointer-events-none absolute top-5 left-6 z-30 flex flex-col gap-1.5">
      <h1 className="font-display text-2xl text-foreground">
        <Scramble text="Project network" trigger="mount" />
      </h1>
      <div className="chrome pointer-events-auto flex items-center gap-3">
        <StatusBadge status={online === total ? 'online' : 'deploying'}>{`${online}/${total} NOMINAL`}</StatusBadge>
        <span>
          last sync{' '}
          <span className="text-muted-foreground">{live.systemSyncedAt ? <RelativeTime date={live.systemSyncedAt} tick={1000} /> : '--'}</span>
        </span>
      </div>
    </div>
  );
}

function Legend({ routeFocus, onRouteFocus }: { routeFocus: Route | null; onRouteFocus: (r: Route | null) => void }) {
  const projects = PROJECTS.filter((p) => p.kind === 'project').length;
  return (
    <nav aria-label="Routes" className="absolute bottom-4 left-6 z-30 flex flex-col gap-2">
      <ul className="flex flex-wrap items-center gap-1">
        {ROUTE_ORDER.map((route) => {
          const r = ROUTES[route];
          const n = PROJECTS.filter((p) => p.route === route).length;
          const on = routeFocus === route;
          return (
            <li key={route}>
              <Button
                variant="chrome"
                aria-pressed={on}
                data-state={on ? 'on' : 'off'}
                onClick={() => onRouteFocus(on ? null : route)}
                className="gap-1.5"
              >
                <span className="h-0.5 w-3.5 rounded-full" style={{ background: r.stroke }} aria-hidden />
                <span className={on ? r.text : undefined}>{r.name}</span>
                <span className="text-faint-foreground tabular">{n}</span>
              </Button>
            </li>
          );
        })}
      </ul>
      <p className="chrome flex items-center gap-3 pl-2">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3 rounded-[2px] border border-border-strong" aria-hidden /> projects {projects}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rotate-45 rounded-[1px] border border-border-strong" aria-hidden /> small builds {PROJECTS.length - projects}
        </span>
        <span className="text-faint-foreground/80">
          <Kbd>esc</Kbd> clears
        </span>
      </p>
    </nav>
  );
}

function Telemetry({ live }: { live: NetworkLive }) {
  const s = live.system?.status === 'online' ? live.system : null;
  const unreachable = live.systemFailed || live.system?.status === 'offline';
  const days = live.activity?.pushesByDay ?? null;
  const pushes = live.activity ? live.activity.totalPushes : null;
  return (
    <aside aria-label="OptiPlex telemetry" className="absolute top-5 right-6 z-30 flex flex-col items-end gap-2">
      <div className="flex items-start gap-5">
        <Readout label="cpu" value={s?.cpu != null ? Math.round(s.cpu) : null} unit="%" size="sm" />
        <Readout label="mem" value={s?.memory != null ? Math.round(s.memory) : null} unit="%" size="sm" />
        <Readout label="services" value={s ? `${s.services.running}/${s.services.total}` : null} size="sm" />
        <Readout
          label="crons"
          value={s ? <span className={s.crons.error ? 'text-status-advisory' : undefined}>{`${s.crons.ok}/${s.crons.total}`}</span> : null}
          size="sm"
        />
        <div className="flex items-end gap-2">
          <Readout label="pushes / 7d" value={pushes} size="sm" />
          {days && <Sparkline values={days} width={48} height={14} label={`${pushes} pushes in the last 7 days`} className="mb-4" />}
        </div>
      </div>
      <p className="chrome" aria-live="polite">
        {unreachable ? 'optiplex unreachable — no readings to show' : s ? (s.uptime ? `optiplex up ${s.uptime}` : 'optiplex') : 'reaching optiplex…'}
      </p>
    </aside>
  );
}

/* ───────────── network optimizer (the hidden idle game) ───────────── */

function useOptimizer() {
  const ref = React.useRef<NetworkOptimizer | null>(null);
  const [, force] = React.useReducer((n: number) => n + 1, 0);
  const [popup, setPopup] = React.useState<(Popup & { rel: { x: number; y: number } }) | null>(null);

  React.useEffect(() => {
    const opt = new NetworkOptimizer(
      PROJECTS.map((p) => p.id),
      EDGES.map((e) => ({ fromId: e.from, toId: e.to })),
    );
    ref.current = opt;
    force();
    const off = opt.onChange(force);
    let last = performance.now();
    let raf = 0;
    let acc = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.5);
      last = now;
      if (opt.state.activated) {
        opt.tick(dt);
        acc += dt;
        if (acc > 0.25) {
          acc = 0;
          force();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const save = window.setInterval(() => opt.state.activated && opt.save(), 10_000);
    return () => {
      off();
      cancelAnimationFrame(raf);
      clearInterval(save);
    };
  }, []);

  const opt = ref.current;
  return {
    opt,
    popup,
    setPopup,
    activated: !!opt?.state.activated,
    tp: opt?.state.tp ?? 0,
    totalRate: opt?.getTotalRate() ?? 0,
    levels: {
      nodes: Object.fromEntries(Object.entries(opt?.state.nodes ?? {}).map(([k, v]) => [k, v.level])) as Record<string, number>,
      edges: (opt?.state.edges ?? []).map((e) => e.level),
    },
    rate: (id: string) => opt?.getNodeRate(id) ?? 0,
    flow: (i: number) => opt?.getEdgeFlowMultiplier(i) ?? 1,
    density: (i: number) => opt?.getEdgeDensityMultiplier(i) ?? 1,
    open(p: Popup, map: HTMLElement | null) {
      if (!opt || !map) return;
      if (!opt.state.activated) opt.activate();
      const rect = map.getBoundingClientRect();
      setPopup({ ...p, rel: { x: Math.min(p.x - rect.left, rect.width - 236), y: Math.min(p.y - rect.top, rect.height - 140) } });
    },
  };
}

type Game = ReturnType<typeof useOptimizer>;

function GameHud({ tp, rate }: { tp: number; rate: number }) {
  return (
    <div className="panel absolute right-6 bottom-4 z-30 flex items-center gap-4 px-3.5 py-2" aria-live="off">
      <span className="chrome">network optimizer</span>
      <Readout label="throughput" value={tp.toFixed(1)} unit="TP" size="sm" />
      <Readout label="rate" value={`+${rate.toFixed(2)}`} unit="/s" size="sm" />
      <span className="chrome max-w-28 leading-tight">right-click a node or label to upgrade</span>
    </div>
  );
}

function UpgradePopup({ game }: { game: Game }) {
  const { popup, opt } = game;
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) game.setPopup(null);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [game]);
  if (!popup || !opt) return null;

  let title: string;
  let info: string;
  let cost: number | null;
  let upgrade: () => boolean;
  if (popup.kind === 'node') {
    const level = opt.state.nodes[popup.id]?.level ?? 0;
    title = PROJECT_BY_ID[popup.id].name;
    cost = opt.getNodeUpgradeCost(popup.id);
    info = `level ${level}${cost === null ? ' (max)' : ` → ${level + 1}`} · ${opt.getNodeRate(popup.id).toFixed(2)} TP/s`;
    upgrade = () => opt.upgradeNode(popup.id);
  } else {
    const e = EDGES[popup.index];
    const level = opt.state.edges[popup.index]?.level ?? 0;
    title = e.label;
    cost = opt.getEdgeUpgradeCost(popup.index);
    info = `level ${level}${cost === null ? ' (max)' : ` → ${level + 1}`} · ${opt.getEdgeFlowMultiplier(popup.index)}× flow`;
    upgrade = () => opt.upgradeEdge(popup.index);
  }
  const affordable = cost !== null && opt.state.tp >= cost;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Upgrade ${title}`}
      className="absolute z-50 flex w-56 flex-col gap-2 rounded-md border border-border-strong bg-popover p-3 shadow-xl"
      style={{ left: popup.rel.x, top: popup.rel.y }}
    >
      <span className="font-mono text-sm text-foreground">{title}</span>
      <span className="chrome">{info}</span>
      {cost !== null && (
        <Button size="sm" variant={affordable ? 'default' : 'outline'} disabled={!affordable} onClick={() => upgrade()} autoFocus>
          Upgrade for {cost} TP
        </Button>
      )}
    </div>
  );
}
