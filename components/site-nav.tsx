"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, FolderKanban, Home, Radio, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const publicItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderKanban },
] as const;

const privateItems = [
  { href: "/about", label: "About", icon: UserRound },
  { href: "/lab", label: "Lab", icon: FlaskConical },
] as const;

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ showPrivate }: { showPrivate: boolean }) {
  const pathname = usePathname();
  const items = showPrivate ? [...publicItems, ...privateItems] : publicItems;

  return (
    <>
      <aside className="desktop-rail" aria-label="Primary navigation">
        <Link className="brand-mark" href="/" aria-label="C2K home">
          <span>C2</span><strong>K</strong>
        </Link>
        <nav className="rail-nav">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isCurrent(pathname, href);
            return (
              <Link className={cn("rail-link", active && "is-active")} href={href} key={href} aria-current={active ? "page" : undefined}>
                <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="rail-bottom">
          <ThemeToggle />
          <div className="rail-signal" title="OptiPlex hosted">
            <Radio aria-hidden="true" size={15} />
            <span>SF / 01</span>
          </div>
        </div>
      </aside>

      <nav className="mobile-nav" aria-label="Primary navigation">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isCurrent(pathname, href);
          return (
            <Link className={cn("mobile-nav-link", active && "is-active")} href={href} key={href} aria-current={active ? "page" : undefined}>
              <Icon aria-hidden="true" size={19} />
              <span>{label}</span>
            </Link>
          );
        })}
        <ThemeToggle />
      </nav>
    </>
  );
}
