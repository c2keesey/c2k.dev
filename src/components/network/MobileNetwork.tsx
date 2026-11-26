import * as React from 'react';
import { RelativeTime, ROUTES, Scramble, StatusBadge, StatusDot, STATUS_META } from '@/components/system';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { EDGES_BY_NODE, PROJECTS, PROJECT_BY_ID, ROUTE_ORDER, neighbours, type Project } from '@/data/projects';
import { ProjectFacts, useNetworkLive, useShowcaseMount, type NetworkLive } from './shared';

/**
 * The network on a phone: each route drawn as a transit line strip map, stations top to
 * bottom, with interchange pips for the other lines a station connects to. Tapping a
 * station raises its detail (and its showcase) in a bottom sheet.
 */
export default function MobileNetwork() {
  const live = useNetworkLive();
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [lastId, setLastId] = React.useState<string | null>(null);
  const project = lastId ? PROJECT_BY_ID[lastId] : null;
  const { online, total } = live.nominal;

  const open = (id: string | null) => {
    setOpenId(id);
    if (id) setLastId(id);
  };

  return (
    <div className="px-4 pt-6 pb-10">
      <header className="mb-6 flex flex-col gap-1.5">
        <h1 className="font-display text-3xl">
          <Scramble text="Project network" trigger="mount" />
        </h1>
        <div className="chrome flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusBadge status={online === total ? 'online' : 'deploying'}>{`${online}/${total} NOMINAL`}</StatusBadge>
          <span>
            last sync{' '}
            <span className="text-muted-foreground">{live.systemSyncedAt ? <RelativeTime date={live.systemSyncedAt} tick={1000} /> : '--'}</span>
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        {ROUTE_ORDER.map((route) => (
          <Line key={route} route={route} live={live} activeId={openId} onOpen={open} />
        ))}
      </div>

      <Sheet open={!!openId} onOpenChange={(v) => !v && open(null)}>
        <SheetContent side="bottom" className="max-h-[88dvh] gap-0 rounded-t-lg border-border-strong p-0">
          {project && <StationSheet key={project.id} project={project} live={live} onSelect={open} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Line({ route, live, activeId, onOpen }: { route: (typeof ROUTE_ORDER)[number]; live: NetworkLive; activeId: string | null; onOpen: (id: string) => void }) {
  const r = ROUTES[route];
  const stations = PROJECTS.filter((p) => p.route === route).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'project' ? -1 : 1));
  return (
    <section aria-labelledby={`line-${route}`} style={{ ['--line' as string]: r.stroke }}>
      <h2 id={`line-${route}`} className="mb-2 flex items-center gap-2 pl-0.5">
        <span className="h-1 w-5 rounded-full bg-(--line)" aria-hidden />
        <span className={cn('font-mono text-2xs font-medium tracking-wider', r.text)}>{r.name}</span>
        <span className="chrome tabular">{stations.length}</span>
      </h2>
      <ol className="relative">
        {/* the line itself */}
        <span className="absolute top-3 bottom-3 left-[9px] w-0.5 rounded-full bg-(--line) opacity-45" aria-hidden />
        {stations.map((p) => (
          <li key={p.id}>
            <StationRow project={p} live={live} active={activeId === p.id} onOpen={() => onOpen(p.id)} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function StationRow({ project: p, live, active, onOpen }: { project: Project; live: NetworkLive; active: boolean; onOpen: () => void }) {
  const status = live.statusOf(p);
  const r = ROUTES[p.route];
  // interchanges: the other lines this station connects to
  const transfers = [...new Set(neighbours(p.id).map((id) => PROJECT_BY_ID[id].route).filter((x) => x !== p.route))];
  const satellite = p.kind === 'satellite';
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={cn(
        'group relative flex w-full min-w-0 items-start gap-3 rounded-md py-2.5 pr-2 pl-0 text-left transition-colors duration-200 active:bg-surface-2',
        active && 'bg-surface',
      )}
    >
      <span className="relative z-10 mt-1 grid size-5 shrink-0 place-items-center">
        {satellite ? (
          <span className="grid size-3 rotate-45 place-items-center rounded-[2px] border-2 border-(--line) bg-background" />
        ) : (
          <span className="grid size-4 place-items-center rounded-full border-2 border-(--line) bg-background">
            <StatusDot status={status} activity={p.activity} className="size-1" />
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className={cn('truncate font-mono font-medium', satellite ? 'text-xs' : 'text-sm', r.text)}>{p.name}</span>
          <span className={cn('chrome ml-auto shrink-0', STATUS_META[status].text)}>{STATUS_META[status].label}</span>
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs text-muted-foreground">{p.tagline}</span>
          <span className="ml-auto flex shrink-0 items-center gap-0.5" aria-label={`${EDGES_BY_NODE[p.id].length} connections`}>
            {transfers.map((t) => (
              <span key={t} className="size-1.5 rounded-full" style={{ background: ROUTES[t].stroke }} aria-hidden />
            ))}
            <span className="chrome ml-1 tabular" aria-hidden>
              {EDGES_BY_NODE[p.id].length}
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}

function StationSheet({ project, live, onSelect }: { project: Project; live: NetworkLive; onSelect: (id: string) => void }) {
  const [host, setHost] = React.useState<HTMLDivElement | null>(null);
  useShowcaseMount(project.showcase, host);
  const r = ROUTES[project.route];
  const status = live.statusOf(project);
  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 pt-4 pb-3 pr-12">
        <StatusDot status={status} activity={project.activity} />
        <SheetTitle className={cn('font-mono text-sm font-medium', r.text)}>
          <Scramble text={project.name} trigger="mount" duration={500} />
        </SheetTitle>
        <span className={cn('chrome ml-auto', r.text)}>{r.name}</span>
      </div>
      <SheetDescription className="sr-only">{project.tagline}</SheetDescription>
      <div className="min-h-0 overflow-y-auto overscroll-contain">
        {project.showcase && <div ref={setHost} className="showcase-host border-b border-border p-3" />}
        <div className="px-4 pt-4 pb-8">
          <ProjectFacts project={project} live={live} onSelect={onSelect} showStatus />
        </div>
      </div>
    </div>
  );
}
