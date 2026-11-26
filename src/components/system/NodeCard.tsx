import * as React from 'react';
import { cn } from '@/lib/utils';
import { StatusDot } from './StatusDot';
import { STATUS_META, type Activity, type Status } from './status';

export type Route = 'core' | 'hardware' | 'software' | 'claude' | 'config' | 'automation';

export const ROUTES: Record<Route, { name: string; text: string; stroke: string }> = {
  core: { name: 'CORE STACK', text: 'text-route-core', stroke: 'var(--route-core)' },
  hardware: { name: 'HARDWARE', text: 'text-route-hardware', stroke: 'var(--route-hardware)' },
  software: { name: 'SOFTWARE', text: 'text-route-software', stroke: 'var(--route-software)' },
  claude: { name: 'CLAUDE TOOLS', text: 'text-route-claude', stroke: 'var(--route-claude)' },
  config: { name: 'CONFIG', text: 'text-route-config', stroke: 'var(--route-config)' },
  automation: { name: 'AUTOMATION', text: 'text-route-automation', stroke: 'var(--route-automation)' },
};

interface NodeCardProps {
  name: string;
  tagline: string;
  status: Status;
  activity?: Activity;
  route: Route;
  /** hover-only one-liner of real data: "3 services · last deploy 2h ago" */
  preview?: React.ReactNode;
  /** inline detail revealed on click — the bespoke showcase lives here */
  children?: React.ReactNode;
  expanded?: boolean;
  onExpandedChange?: (v: boolean) => void;
  className?: string;
}

/**
 * Reference node for the project network (docs/design-system.md §Patterns/Node).
 * Progressive disclosure: name + tagline + status → hover preview → click expands inline.
 */
export function NodeCard({ name, tagline, status, activity, route, preview, children, expanded: controlled, onExpandedChange, className }: NodeCardProps) {
  const [local, setLocal] = React.useState(false);
  const expanded = controlled ?? local;
  const setExpanded = (v: boolean) => (onExpandedChange ? onExpandedChange(v) : setLocal(v));
  const id = React.useId();
  const r = ROUTES[route];

  return (
    <article
      data-route={route}
      data-expanded={expanded || undefined}
      className={cn(
        'group/node panel w-64 transition-[border-color,width,box-shadow] duration-300 ease-snap',
        'hover:border-[color-mix(in_oklch,var(--node-color)_40%,transparent)]',
        expanded && 'w-96 rounded-lg border-[color-mix(in_oklch,var(--node-color)_45%,transparent)]',
        className,
      )}
      style={{ ['--node-color' as string]: r.stroke }}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={children ? id : undefined}
        onClick={() => children && setExpanded(!expanded)}
        className="flex w-full cursor-pointer flex-col items-start gap-1 rounded-[inherit] px-3.5 py-3 text-left"
      >
        <span className="flex w-full items-center gap-2">
          <StatusDot status={status} activity={activity} />
          <span className={cn('font-mono text-sm font-medium', r.text)}>{name}</span>
          <span className={cn('chrome ml-auto', STATUS_META[status].text)}>{STATUS_META[status].label}</span>
        </span>
        <span className="pl-3.5 text-xs text-muted-foreground">{tagline}</span>
        {preview && (
          <span className="chrome grid w-full grid-rows-[0fr] pl-3.5 opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-snap group-hover/node:grid-rows-[1fr] group-hover/node:opacity-100 group-focus-within/node:grid-rows-[1fr] group-focus-within/node:opacity-100">
            <span className="overflow-hidden pt-1">{preview}</span>
          </span>
        )}
      </button>
      {children && (
        <div id={id} className={cn('grid transition-[grid-template-rows] duration-300 ease-snap', expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
          <div className="overflow-hidden" inert={!expanded}>
            <div className="border-t border-border px-3.5 py-3">{children}</div>
          </div>
        </div>
      )}
    </article>
  );
}
