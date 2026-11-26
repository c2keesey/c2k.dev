import { useLive } from '@/hooks/use-live';
import { overallToStatus, type SystemStatus } from '@/lib/live';
import { StatusBadge } from './StatusBadge';
import { RelativeTime } from './RelativeTime';

/**
 * Bottom status line: the home server's real state. When the server can't be
 * reached it says OFFLINE — it never pretends.
 */
export function SystemStrip() {
  const { data, syncedAt, failed } = useLive<SystemStatus>('/api/status', 30_000);
  const status = failed ? 'offline' : overallToStatus(data);
  const online = data?.status === 'online' ? data : null;

  return (
    <div className="chrome flex flex-wrap items-center gap-x-4 gap-y-1" aria-live="polite">
      <StatusBadge status={status}>{`OPTIPLEX ${data ? (status === 'online' ? 'NOMINAL' : status.toUpperCase()) : '…'}`}</StatusBadge>
      {online && (
        <>
          <span>cpu <span className="text-foreground">{online.cpu ?? '--'}%</span></span>
          <span>mem <span className="text-foreground">{online.memory ?? '--'}%</span></span>
          <span>svc <span className="text-foreground">{online.services.running}/{online.services.total}</span></span>
        </>
      )}
      {syncedAt && (
        <span>
          sync <RelativeTime date={syncedAt} tick={1000} />
        </span>
      )}
    </div>
  );
}
