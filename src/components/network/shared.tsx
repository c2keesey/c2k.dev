import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RelativeTime, ROUTES, STATUS_META, type Status } from '@/components/system';
import { useLive } from '@/hooks/use-live';
import type { Activity as ActivityData, SystemStatus } from '@/lib/live';
import { decode } from '@/lib/scramble';
import { cn } from '@/lib/utils';
import { EDGES, EDGES_BY_NODE, PROJECTS, type Project } from '@/data/projects';

/* ───────────── live data ───────────── */

export interface NetworkLive {
  system: SystemStatus | null;
  systemSyncedAt: number | null;
  systemFailed: boolean;
  activity: ActivityData | null;
  /** repo name → ISO time of last push, only when real data has it */
  pushedAt: Record<string, string>;
  statusOf: (p: Project) => Status;
  nominal: { online: number; total: number };
}

/**
 * Everything on the network that comes from somewhere real.
 * The OptiPlex Dashboard node's state is the /api/status reading itself:
 * if the box can't be reached, that node says OFFLINE.
 */
export function useNetworkLive(): NetworkLive {
  const { data: system, syncedAt: systemSyncedAt, failed: systemFailed } = useLive<SystemStatus>('/api/status', 30_000);
  const { data: activity } = useLive<ActivityData>('/api/activity', 5 * 60_000);

  const pushedAt = React.useMemo(() => {
    const m: Record<string, string> = {};
    for (const r of activity?.repos ?? []) m[r.name] = r.pushedAt;
    return m;
  }, [activity]);

  const statusOf = React.useCallback(
    (p: Project): Status => {
      if (p.id !== 'dashboard') return p.status;
      if (systemFailed || system?.status === 'offline') return 'offline';
      // yellow or red: it's up, but something on the box is unhappy
      if (system?.status === 'online') return system.overall === 'green' ? 'online' : 'advisory';
      return p.status;
    },
    [system, systemFailed],
  );

  const online = PROJECTS.filter((p) => statusOf(p) === 'online').length;
  return { system, systemSyncedAt, systemFailed, activity, pushedAt, statusOf, nominal: { online, total: PROJECTS.length } };
}

/* ───────────── showcase mounting ───────────── */

/**
 * The bespoke showcases are server-rendered .astro components (canvas, scripts, their
 * own styles) parked off-screen in [data-showcase-src]. Opening one moves its DOM into
 * `host`; closing puts it back. Same live element, so its state and timers survive.
 */
export function useShowcaseMount(showcaseId: string | undefined, host: HTMLElement | null) {
  React.useEffect(() => {
    if (!showcaseId || !host) return;
    const src = document.querySelector<HTMLElement>(`[data-showcase-src="${showcaseId}"]`);
    const el = src?.firstElementChild as HTMLElement | null;
    if (!src || !el) return;
    host.appendChild(el);

    // legacy showcases listen for this to resize their canvases to the new width
    const t = window.setTimeout(() => {
      el.querySelectorAll('canvas').forEach((c) => c.dispatchEvent(new Event('showcase-resize')));
      window.dispatchEvent(new Event('resize'));
    }, 60);
    // their headings are legacy .text-scramble spans; decode them with the site engine
    const cancels: Array<() => void> = [];
    el.querySelectorAll<HTMLElement>('.text-scramble[data-text]').forEach((s, i) => {
      cancels.push(decode(s, s.dataset.text ?? '', { delay: 80 + i * 40, duration: 700 }));
    });

    return () => {
      window.clearTimeout(t);
      cancels.forEach((c) => c());
      el.querySelectorAll<HTMLElement>('.text-scramble[data-text]').forEach((s) => (s.textContent = s.dataset.text ?? ''));
      src.appendChild(el);
    };
  }, [showcaseId, host]);
}

/* ───────────── detail ───────────── */

export function connectionsOf(id: string) {
  return EDGES_BY_NODE[id].map((i) => {
    const e = EDGES[i];
    const outgoing = e.from === id;
    return { index: i, other: outgoing ? e.to : e.from, label: e.label, outgoing };
  });
}

/** The written part of an expanded node: what it is, what it's made of, where it lives. */
export function ProjectFacts({ project, live, className, onSelect, showStatus = false }: { project: Project; live: NetworkLive; className?: string; onSelect?: (id: string) => void; showStatus?: boolean }) {
  const pushed = project.repo ? live.pushedAt[project.repo] : undefined;
  const status = live.statusOf(project);
  return (
    <div className={cn('flex min-w-0 flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="role">{project.role}</Badge>
        {project.wip && <Badge variant="outline">work in progress</Badge>}
        {showStatus && <span className={cn('chrome ml-auto', STATUS_META[status].text)}>{STATUS_META[status].label}</span>}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
      <div className="flex flex-wrap gap-1">
        {project.tech.map((t) => (
          <Badge key={t} variant="tag">{t}</Badge>
        ))}
      </div>
      {onSelect && (
        <ul className="flex flex-col gap-0.5" aria-label="Connections">
          {connectionsOf(project.id).map((c) => {
            const other = PROJECTS.find((p) => p.id === c.other)!;
            return (
              <li key={c.index}>
                <button
                  type="button"
                  onClick={() => onSelect(other.id)}
                  className="chrome group/conn flex w-full items-center gap-2 rounded-xs py-0.5 text-left hover:text-foreground"
                >
                  <span className="size-1.5 shrink-0 rotate-45" style={{ background: ROUTES[other.route].stroke }} aria-hidden />
                  <span className={cn('font-medium', ROUTES[other.route].text)}>{other.name}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="chrome flex flex-wrap items-center gap-x-4 gap-y-1">
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {project.linkText ?? project.link.replace('https://', '')}
            <ArrowUpRight className="size-3" aria-hidden />
          </a>
        )}
        {project.repo && (
          <span>
            last push{' '}
            <span className="text-muted-foreground">{pushed ? <RelativeTime date={pushed} tick={60_000} /> : '--'}</span>
          </span>
        )}
      </div>
    </div>
  );
}
