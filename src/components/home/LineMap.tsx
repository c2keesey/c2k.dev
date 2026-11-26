import * as React from 'react';
import { ROUTES, STATUS_META, type Status } from '@/components/system';
import type { NetworkLive } from '@/components/network/shared';
import { PROJECTS, ROUTE_ORDER, type Project } from '@/data/projects';
import { BASE } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * The project network folded into a line diagram: one row per route, stations in the
 * order they sit on the map (left to right). Circles are projects, diamonds are small
 * builds; a filled station is running, a hollow one isn't. Every station links to its
 * node on the map.
 */
export function LineMap({ live }: { live: NetworkLive }) {
  const lines = ROUTE_ORDER.map((route) => ({
    route,
    stations: PROJECTS.filter((p) => p.route === route).sort((a, b) => a.x - b.x),
  })).filter((l) => l.stations.length > 0);
  const cols = Math.max(...lines.map((l) => l.stations.length));

  return (
    <ol className="flex flex-col gap-10 md:gap-9" aria-label="Projects by route">
      {lines.map(({ route, stations }) => {
        const r = ROUTES[route];
        return (
          <li key={route} className="group/line grid gap-4 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-6" style={{ ['--line' as string]: r.stroke }}>
            <h3 className={cn('font-mono text-2xs tracking-wide md:pt-0.5', r.text)}>
              {r.name}
              <span className="ml-2 text-faint-foreground">{stations.length}</span>
            </h3>

            {/* phones: the line runs down the left edge */}
            <ol className="relative flex flex-col gap-4 md:hidden">
              {stations.length > 1 && (
                <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-0.5 rounded-full bg-[var(--line)] opacity-50" />
              )}
              {stations.map((p) => (
                <li key={p.id} className="relative">
                  <Station project={p} status={live.statusOf(p)} />
                </li>
              ))}
            </ol>

            {/* wider: the line runs across, stations on a shared column grid so lines align */}
            <ol className="relative hidden md:grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {stations.length > 1 && (
                <span
                  aria-hidden
                  className="absolute top-[5px] left-[5px] h-0.5 rounded-full bg-[var(--line)] opacity-45 transition-opacity duration-150 group-hover/line:opacity-90"
                  style={{ width: `calc(${((stations.length - 1) / cols) * 100}%)` }}
                />
              )}
              {stations.map((p) => (
                <li key={p.id} className="relative min-w-0 pr-4">
                  <Station project={p} status={live.statusOf(p)} across />
                </li>
              ))}
            </ol>
          </li>
        );
      })}
    </ol>
  );
}

const RUNNING: Status[] = ['online', 'deploying', 'advisory'];

function Station({ project: p, status, across = false }: { project: Project; status: Status; across?: boolean }) {
  const running = RUNNING.includes(status);
  const meta = STATUS_META[status];
  return (
    <a
      href={`${BASE}/projects#${p.id}`}
      className={cn('group/st flex gap-3 rounded-xs outline-offset-4', across ? 'flex-col' : 'items-start')}
      aria-label={`${p.name}, ${p.tagline}. ${meta.label}`}
    >
      <Marker satellite={p.kind === 'satellite'} running={running} pulse={status === 'deploying'} />
      <span className={cn('min-w-0', !across && '-mt-1')}>
        <span className="block truncate text-sm font-medium text-foreground transition-colors duration-150 group-hover/st:text-[var(--line)]">
          {p.name}
        </span>
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {p.tagline}
          {status !== 'online' && <span className={cn('ml-1.5 font-mono text-2xs tracking-wide', meta.text)}>{meta.label}</span>}
        </span>
      </span>
    </a>
  );
}

function Marker({ satellite, running, pulse }: { satellite: boolean; running: boolean; pulse: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative z-10 block size-3 shrink-0 border-2 border-[var(--line)] transition-transform duration-150 ease-snap group-hover/st:scale-125',
        satellite ? 'size-[10px] translate-x-px translate-y-px rotate-45 rounded-[2px]' : 'rounded-full',
        running ? 'bg-[var(--line)]' : 'bg-background',
        pulse && 'animate-pulse-active text-[var(--line)]',
      )}
    />
  );
}
