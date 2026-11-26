import { useNow } from '@/hooks/use-live';
import { ago } from '@/lib/time';
import { cn } from '@/lib/utils';

interface RelativeTimeProps {
  date: Date | string | number;
  className?: string;
  /** tick rate; 1s for "LAST SYNC", 60s for commit times */
  tick?: number;
}

/** "4m ago" that stays true. Full timestamp on hover and for machines. */
export function RelativeTime({ date, className, tick = 30_000 }: RelativeTimeProps) {
  const now = useNow(tick);
  const d = new Date(date);
  return (
    <time dateTime={d.toISOString()} title={d.toLocaleString()} className={cn('tabular', className)} suppressHydrationWarning>
      {ago(d, now)}
    </time>
  );
}
