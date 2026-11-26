import { cn } from '@/lib/utils';

/**
 * Panel — the frosted instrument surface. Use for a self-contained readout or widget.
 * Not for wrapping every section: if the content isn't an instrument, it doesn't need a box.
 */
export function Panel({ className, ...props }: React.ComponentProps<'section'>) {
  return <section data-slot="panel" className={cn('panel flex min-w-0 flex-col', className)} {...props} />;
}

/** Header row: lowercase mono label on the left, live state or action on the right. */
export function PanelHeader({
  label,
  aside,
  className,
  children,
}: {
  label: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={cn('flex items-center justify-between gap-3 px-4 pt-3 pb-2', className)}>
      <h2 className="chrome flex items-center gap-2 text-muted-foreground">{label}</h2>
      {aside && <div className="flex items-center gap-2">{aside}</div>}
      {children}
    </header>
  );
}

export function PanelBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('px-4 pb-4', className)} {...props} />;
}
