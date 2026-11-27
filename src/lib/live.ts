/** Shapes of the site's real-data endpoints. Keep in sync with src/pages/api/*. */
export type SystemStatus =
  | { status: 'offline' }
  | {
      status: 'online';
      overall: 'green' | 'yellow' | 'red';
      cpu: number | null;
      memory: number | null;
      uptime: string | null;
      services: { running: number; total: number };
      system: { running: number; total: number };
      crons: { ok: number; error: number; total: number };
    };

export interface ActivityRepo {
  name: string;
  url: string;
  description: string | null;
  lastCommit: string | null;
  pushedAt: string;
  /** set by the server; private repos' names stay off public pages */
  private?: boolean;
}

export interface ActivityPush {
  repo: string;
  /** ISO time of the push */
  at: string;
  private: boolean;
}

export interface Activity {
  repos: ActivityRepo[];
  totalPushes: number;
  /** pushes per day, [6 days ago … today] */
  pushesByDay: number[];
  /** every push in the 7-day window, newest first */
  pushes?: ActivityPush[];
}

/** Map the server's overall color to the site's status vocabulary. */
export function overallToStatus(s: SystemStatus | null): import('@/components/system/status').Status {
  if (!s) return 'standby';
  if (s.status === 'offline') return 'offline';
  return s.overall === 'green' ? 'online' : s.overall === 'yellow' ? 'deploying' : 'advisory';
}
