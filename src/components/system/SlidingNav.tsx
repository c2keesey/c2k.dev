import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  label: string;
}

interface SlidingNavProps {
  items: NavItem[];
  /** index of the current page, or -1 */
  activeIndex: number;
  className?: string;
}

/**
 * Nav with a single highlight that slides to whatever you point at and settles
 * back on the current page. One moving part, not N hover states.
 */
export function SlidingNav({ items, activeIndex, className }: SlidingNavProps) {
  const listRef = React.useRef<HTMLUListElement>(null);
  const [hover, setHover] = React.useState<number | null>(null);
  const [box, setBox] = React.useState<{ x: number; w: number } | null>(null);
  const target = hover ?? activeIndex;

  React.useLayoutEffect(() => {
    const list = listRef.current;
    // measure the <li> (positioned relative to the <ul>), not the <a> inside it
    const el = list?.querySelectorAll<HTMLLIElement>('li[data-nav-item]')[target];
    if (!list || !el) return setBox(null);
    setBox({ x: el.offsetLeft, w: el.offsetWidth });
  }, [target, items.length]);

  return (
    <nav aria-label="Main" className={className}>
      <ul ref={listRef} className="relative flex items-center gap-0.5" onPointerLeave={() => setHover(null)}>
        <li
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-0 rounded-sm bg-accent transition-[transform,width,opacity] duration-300 ease-snap',
            !box && 'opacity-0',
          )}
          style={box ? { width: box.w, transform: `translateX(${box.x}px)` } : undefined}
        />
        {items.map((item, i) => (
          <li key={item.href} data-nav-item className="relative">
            <a
              href={item.href}
              aria-current={i === activeIndex ? 'page' : undefined}
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className={cn(
                'block rounded-sm px-3 py-1.5 font-mono text-xs transition-colors duration-200',
                i === target ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
