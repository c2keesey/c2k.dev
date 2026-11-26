import { cn } from '@/lib/utils';

interface ReadoutProps {
  /** lowercase key, like a field name: "cpu", "uptime", "pushes/7d" */
  label: string;
  /** null/undefined renders "--" — never a fake number */
  value: React.ReactNode | null | undefined;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  /** dims the value when the reading is stale or the source failed */
  stale?: boolean;
  className?: string;
}

const VALUE_SIZE = { sm: 'text-sm', md: 'text-xl', lg: 'text-4xl font-display' } as const;

/** One telemetry reading: value over key. */
export function Readout({ label, value, unit, size = 'md', stale, className }: ReadoutProps) {
  const empty = value === null || value === undefined;
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className={cn('tabular font-mono leading-none text-foreground', VALUE_SIZE[size], (empty || stale) && 'text-faint-foreground')}>
        {empty ? '--' : value}
        {unit && !empty && <span className="ml-0.5 text-[0.6em] text-muted-foreground">{unit}</span>}
      </span>
      <span className="chrome">{label}</span>
    </div>
  );
}
