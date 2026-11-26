import { NAV } from '@/lib/site';
import { Mark } from './Mark';
import { SlidingNav } from './SlidingNav';
import { ThemeToggle } from './ThemeToggle';

export function SiteHeader({ pathname, homeHref }: { pathname: string; homeHref: string }) {
  const activeIndex = NAV.findIndex((n) => n.match(pathname));
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6">
        <Mark href={homeHref} />
        <SlidingNav items={NAV.map(({ href, label }) => ({ href, label }))} activeIndex={activeIndex} />
        <ThemeToggle />
      </div>
    </header>
  );
}
