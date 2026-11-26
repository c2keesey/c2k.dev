import * as React from 'react';
import { RelativeTime, Scramble, Sparkline, StatusBadge } from '@/components/system';
import { useNetworkLive, type NetworkLive } from '@/components/network/shared';
import { useLive, useNow } from '@/hooks/use-live';
import type { ActivityRepo } from '@/lib/live';
import { nextSunEvent, sunPosition, tideAt, type TideData } from '@/lib/ocean';
import { BASE } from '@/lib/site';
import { cn } from '@/lib/utils';
import { LineMap } from './LineMap';

/**
 * Everything on the home page under the name: a paragraph whose numbers are live
 * readings, the week's pushes, and the network drawn as transit lines.
 * One island so /api/status and /api/activity are each polled once.
 */
export default function HomeLive() {
  const live = useNetworkLive();
  const { online, total } = live.nominal;

  return (
    <>
      <div className="grid gap-x-20 gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <LivingBio live={live} />
        <Pushes live={live} />
      </div>

      <section aria-labelledby="network-heading" className="mt-20 lg:mt-28">
        <div className="mb-8 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <h2 id="network-heading" className="font-display text-2xl">
            <a href={`${BASE}/projects`} className="hover:text-primary focus-visible:text-primary">The network</a>
          </h2>
          <StatusBadge status={online === total ? 'online' : 'deploying'}>{`${online}/${total} NOMINAL`}</StatusBadge>
          <a href={`${BASE}/projects`} className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Open the map
          </a>
        </div>
        <LineMap live={live} />
      </section>
    </>
  );
}

/* ───────────── the paragraph ───────────── */

/** A reading set into prose. Shows "--" until real data arrives, then decodes into place. */
function Reading({ value, className }: { value: string | null; className?: string }) {
  return (
    <Scramble
      text={value ?? '--'}
      trigger="manual"
      replayKey={value ?? undefined}
      duration={600}
      className={cn('font-mono text-[0.8em] tracking-tight text-foreground tabular', value === null && 'text-faint-foreground', className)}
    />
  );
}

function LivingBio({ live }: { live: NetworkLive }) {
  const { online, total } = live.nominal;
  const act = live.activity;
  const pushes = act ? act.totalPushes : null;
  const repos = act ? act.repos.length : null;
  const latest = act ? latestPublic(act.repos) : null;
  const sys = live.system;
  const boxUp = sys?.status === 'online' ? sys : null;
  const boxDown = live.systemFailed || sys?.status === 'offline';

  return (
    <div className="max-w-[36ch] text-2xl leading-[1.45] text-muted-foreground sm:text-[1.75rem] lg:text-3xl lg:leading-[1.4]">
      <p>
        I’m CTO at{' '}
        <a href="https://maia-analytics.com" target="_blank" rel="noopener" className="text-foreground underline decoration-border-strong decoration-1 underline-offset-[0.2em] hover:decoration-primary">
          MAIA Analytics
        </a>{' '}
        and I live in the Outer Sunset. What I build on the side is on{' '}
        <a href={`${BASE}/projects`} className="text-foreground underline decoration-border-strong decoration-1 underline-offset-[0.2em] hover:decoration-primary">
          the network
        </a>
        : <Reading value={String(total)} /> projects, <Reading value={String(online)} /> running right now.
      </p>

      <p className="mt-6">
        {act && act.totalPushes === 0 ? (
          <>GitHub shows no public pushes from me in the last seven days.</>
        ) : (
          <>
            This week I pushed <Reading value={pushes === null ? null : String(pushes)} /> times to{' '}
            <Reading value={repos === null ? null : String(repos)} /> repos
            {latest ? (
              <>
                , most recently to <Reading value={latest.name} />{' '}
                <RelativeTime date={latest.pushedAt} tick={60_000} className="font-mono text-[0.8em] text-foreground" />.
              </>
            ) : (
              '.'
            )}
          </>
        )}
      </p>

      <p className="mt-6">
        This page is served from an OptiPlex under my desk
        {boxUp ? (
          <>
            . Right now it’s at <Reading value={boxUp.cpu === null ? null : `${Math.round(boxUp.cpu)}%`} /> cpu with{' '}
            <Reading value={`${boxUp.services.running}/${boxUp.services.total}`} /> services up.
          </>
        ) : boxDown ? (
          <>
            , which isn’t answering status checks from here, so there’s no reading to show.
          </>
        ) : (
          <>
            . <Reading value={null} />
          </>
        )}
      </p>

      <WindowSentence />

      <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-base">
        {LINKS.map((l) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noopener me" className="text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-primary">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** What the background is drawing, said plainly. */
function WindowSentence() {
  const { data, failed } = useLive<TideData>('/api/tide', 30 * 60_000);
  const now = useNow(60_000);
  const tide = data && 'extremes' in data ? tideAt(data, now) : null;
  const up = sunPosition(now).alt > -0.833;
  const ev = React.useMemo(() => nextSunEvent(now, up ? 'set' : 'rise'), [Math.floor(now / 600_000), up]);
  const fmt = (t: number) => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' }).toLowerCase();

  return (
    <p className="mt-6">
      Out the window, {tide ? (
        <>
          the tide at the Golden Gate is <Reading value={`${tide.ft.toFixed(1)} ft`} /> and {tide.rising ? 'rising' : 'falling'}
        </>
      ) : failed || (data && !('extremes' in data)) ? (
        <>NOAA’s tide feed isn’t answering</>
      ) : (
        <>
          the tide is <Reading value={null} />
        </>
      )}
      , and the sun {up ? 'sets' : 'comes up'} at <Reading value={ev ? fmt(ev) : null} />.
    </p>
  );
}

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/c2keesey' },
  { label: 'X', href: 'https://x.com/c2keesey' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/c2keesey' },
];

/* ───────────── the week's pushes ───────────── */

/** /api/activity marks private repos with url "#" (MAIA's override is the exception). Their names stay off the page. */
function isPrivate(r: ActivityRepo) {
  return r.url === '#';
}

function byRecent(repos: ActivityRepo[]) {
  return [...repos].sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt));
}

function latestPublic(repos: ActivityRepo[]) {
  return byRecent(repos).find((r) => !isPrivate(r)) ?? null;
}

function Pushes({ live }: { live: NetworkLive }) {
  const act = live.activity;
  const repos = act ? byRecent(act.repos) : null;
  const pub = repos?.filter((r) => !isPrivate(r)) ?? [];
  const priv = repos?.filter(isPrivate) ?? [];
  const shown = pub.slice(0, 6);
  const morePublic = pub.length - shown.length;

  return (
    <section aria-labelledby="pushes-heading" className="min-w-0 self-start lg:pt-2">
      <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
        <h2 id="pushes-heading" className="chrome">
          pushes / 7d
        </h2>
        <div className="flex items-end gap-3">
          {act && <Sparkline values={act.pushesByDay} width={72} height={18} label={`${act.totalPushes} pushes in the last 7 days, by day`} />}
          <span className="tabular font-mono text-xl leading-none text-foreground">{act ? act.totalPushes : '--'}</span>
        </div>
      </div>

      {!act ? (
        <p className="chrome py-3">waiting for github</p>
      ) : repos!.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">Nothing pushed in the last seven days.</p>
      ) : (
        <ol className="divide-y divide-border">
          {shown.map((r) => (
            <li key={r.name} className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-3 py-2.5">
              <RelativeTime date={r.pushedAt} tick={60_000} className="chrome" />
              <div className="min-w-0">
                <a href={r.url} target="_blank" rel="noopener" className="font-mono text-sm text-foreground hover:text-primary">
                  {r.name}
                </a>
                {(r.lastCommit || r.description) && (
                  <p className="truncate text-sm text-muted-foreground" title={r.lastCommit || r.description || ''}>
                    {r.lastCommit || r.description}
                  </p>
                )}
              </div>
            </li>
          ))}
          {priv.length > 0 && (
            <li className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-3 py-2.5">
              <RelativeTime date={priv[0].pushedAt} tick={60_000} className="chrome" />
              <p className="text-sm text-muted-foreground">
                {priv.length} private {priv.length === 1 ? 'repo' : 'repos'}
                {morePublic > 0 && <>, {morePublic} more public</>}
              </p>
            </li>
          )}
        </ol>
      )}
      {act && <p className="chrome mt-3">from github’s event feed</p>}
    </section>
  );
}
