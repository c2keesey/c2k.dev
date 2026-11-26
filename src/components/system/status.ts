/** The site's status vocabulary. Operational words, each with one meaning. */
export const STATUSES = ['online', 'deploying', 'standby', 'advisory', 'offline'] as const;
export type Status = (typeof STATUSES)[number];

/** How often a thing actually does something → how fast its dot breathes. */
export type Activity = 'active' | 'periodic' | 'dormant' | 'none';

export const STATUS_META: Record<Status, { label: string; meaning: string; text: string; bg: string }> = {
  online: { label: 'ONLINE', meaning: 'Shipped and in use', text: 'text-status-online', bg: 'bg-status-online' },
  deploying: { label: 'DEPLOYING', meaning: 'Being built right now', text: 'text-status-deploying', bg: 'bg-status-deploying' },
  standby: { label: 'STANDBY', meaning: 'Exists, not running (hardware, paused)', text: 'text-status-standby', bg: 'bg-status-standby' },
  advisory: { label: 'ADVISORY', meaning: 'Running with a known problem', text: 'text-status-advisory', bg: 'bg-status-advisory' },
  offline: { label: 'OFFLINE', meaning: 'Unreachable — real data said so', text: 'text-status-offline', bg: 'bg-status-offline' },
};

export const ACTIVITY_ANIMATION: Record<Activity, string> = {
  active: 'animate-pulse-active',
  periodic: 'animate-pulse-periodic',
  dormant: 'animate-pulse-dormant',
  none: '',
};
