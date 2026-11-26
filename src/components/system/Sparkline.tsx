import { cn } from '@/lib/utils';

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  /** Tailwind text color class; the line uses currentColor */
  className?: string;
  /** accessible summary, e.g. "2 pushes in the last 7 days" */
  label: string;
  fill?: boolean;
}

/** Minimal inline trend. No axes: it sits next to a Readout that states the number. */
export function Sparkline({ values, width = 64, height = 16, className, label, fill = true }: SparklineProps) {
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const pts = values.map((v, i) => [i * step, height - 1 - (v / max) * (height - 2)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg role="img" aria-label={label} width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn('overflow-visible text-ember', className)}>
      {fill && <path d={area} fill="currentColor" opacity={0.1} />}
      <path d={line} fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" opacity={0.75} />
      {last && <circle cx={last[0]} cy={last[1]} r={1.75} fill="currentColor" />}
    </svg>
  );
}
