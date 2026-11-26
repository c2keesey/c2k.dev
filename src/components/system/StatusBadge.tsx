import { cn } from '@/lib/utils';
import { StatusDot } from './StatusDot';
import { STATUS_META, type Activity, type Status } from './status';

interface StatusBadgeProps {
  status: Status;
  activity?: Activity;
  /** override the word, e.g. "14/22 NOMINAL". Keep it uppercase + operational. */
  children?: React.ReactNode;
  className?: string;
}

/** Dot + status word. The only place ALL CAPS is allowed: it is a machine state. */
export function StatusBadge({ status, activity, children, className }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 font-mono text-2xs tracking-wide tabular', meta.text, className)}
      title={meta.meaning}
    >
      <StatusDot status={status} activity={activity} />
      {children ?? meta.label}
    </span>
  );
}
