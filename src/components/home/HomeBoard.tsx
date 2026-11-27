import * as React from 'react';
import { Panel, PanelBody, PanelHeader, Readout, RelativeTime, StatusDot } from '@/components/system';
import { useNetworkLive } from '@/components/network/shared';
import type { ActivityRepo } from '@/lib/live';
import { MaiaFeature } from './MaiaFeature';

/**
 * The legacy home's lower half on the new foundation: "currently building" and the
 * systems readout on the left, the MAIA showcase on the right. One island, so
 * /api/status and /api/activity are each polled once.
 */
export default function HomeBoard() {
  const live = useNetworkLive();
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
      <div className="flex min-w-0 flex-col gap-6">
        <Building repos={live.activity?.repos ?? null} />
        <Systems live={live} />
      </div>
      <MaiaFeature live={live} />
    </div>
  );
}

const byRecent = (a: ActivityRepo, b: ActivityRepo) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt);

/** /api/activity marks private repos (older responses only signal it with url "#"). */
const isPrivate = (r: ActivityRepo) => r.private ?? r.url === '#';

function Building({ repos }: { repos: ActivityRepo[] | null }) {
  const sorted = repos ? [...repos].sort(byRecent) : null;
  const pub = sorted?.filter((r) => !isPrivate(r)) ?? [];
  const priv = sorted?.filter(isPrivate) ?? [];

  return (
    <Panel>
      <PanelHeader label={<><StatusDot status="online" activity="active" />currently building</>} />
      <PanelBody className="pb-3">
        {!sorted ? (
          <p className="chrome py-1">--</p>
        ) : sorted.length === 0 ? (
          <p className="py-1 text-sm text-muted-foreground">Nothing pushed in the last seven days.</p>
        ) : (
          <ul className="flex flex-col">
            {pub.map((r) => (
              <li key={r.name}>
                <a href={r.url} target="_blank" rel="noopener" className="-mx-2 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 rounded-sm px-2 py-1.5 hover:bg-surface-2">
                  <span className="min-w-0">
                    <span className="block font-mono text-sm text-foreground">{r.name}</span>
                    {(r.lastCommit || r.description) && <span className="block truncate text-xs text-muted-foreground">{r.lastCommit || r.description}</span>}
                  </span>
                  <RelativeTime date={r.pushedAt} tick={60_000} className="chrome" />
                </a>
              </li>
            ))}
            {priv.length > 0 && (
              <li className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 py-1.5">
                <span className="font-mono text-sm text-muted-foreground">
                  {priv.length} private {priv.length === 1 ? 'repo' : 'repos'}
                </span>
                <RelativeTime date={priv[0].pushedAt} tick={60_000} className="chrome" />
              </li>
            )}
          </ul>
        )}
        <p className="chrome mt-3 border-t border-border pt-2.5">each push is a swell on the water; it reaches the shore 24h later</p>
      </PanelBody>
    </Panel>
  );
}

function Systems({ live }: { live: ReturnType<typeof useNetworkLive> }) {
  const s = live.system?.status === 'online' ? live.system : null;
  const down = live.systemFailed || live.system?.status === 'offline';
  return (
    <Panel>
      <PanelHeader
        label={<><StatusDot status={down ? 'offline' : s ? 'online' : 'standby'} />systems</>}
        aside={live.systemSyncedAt ? <span className="chrome">sync <RelativeTime date={live.systemSyncedAt} tick={1000} /></span> : undefined}
      />
      <PanelBody>
        <div className="grid grid-cols-4 gap-3">
          <Readout label="services" value={s ? `${s.services.running}/${s.services.total}` : null} />
          <Readout label="crons" value={s ? `${s.crons.ok}/${s.crons.total}` : null} />
          <Readout label="cpu" value={s?.cpu ?? null} unit="%" />
          <Readout label="mem" value={s?.memory ?? null} unit="%" />
        </div>
        {down && <p className="chrome mt-3">optiplex unreachable, no readings to show</p>}
      </PanelBody>
    </Panel>
  );
}
