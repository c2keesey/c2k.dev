import { cn } from '@/lib/utils';
import { ACTIVITY_ANIMATION, STATUS_META, type Activity, type Status } from './status';

interface StatusDotProps {
  status: Status;
  /** pulse rate; defaults from status (online→periodic, deploying→active, others still) */
  activity?: Activity;
  size?: 'sm' | 'md';
  className?: string;
  /** set when the dot stands alone (no adjacent status word) */
  label?: string;
}

const DEFAULT_ACTIVITY: Record<Status, Activity> = {
  online: 'periodic',
  deploying: 'active',
  standby: 'none',
  advisory: 'active',
  offline: 'none',
};

export function StatusDot({ status, activity, size = 'sm', className, label }: StatusDotProps) {
  const meta = STATUS_META[status];
  const act = activity ?? DEFAULT_ACTIVITY[status];
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-status={status}
      className={cn(
        'inline-block shrink-0 rounded-full',
        size === 'sm' ? 'size-1.5' : 'size-2',
        meta.bg,
        meta.text, // currentColor drives the pulse ring
        status === 'standby' && 'bg-transparent ring-1 ring-current ring-inset',
        ACTIVITY_ANIMATION[act],
        className,
      )}
    />
  );
}
