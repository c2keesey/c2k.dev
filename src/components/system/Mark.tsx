import { Scramble } from './Scramble';
import { cn } from '@/lib/utils';

/** The "c2k" text mark. Sunset gradient is allowed here and nowhere static. Re-decodes on hover. */
export function Mark({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <a href={href} aria-label="c2k — home" className={cn('group inline-flex items-baseline font-mono text-base font-bold tracking-tight', className)}>
      <Scramble text="c2k" trigger="hover" duration={500} className="text-sunset" />
    </a>
  );
}
