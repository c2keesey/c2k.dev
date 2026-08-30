import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import { StatusFooter } from "@/components/status-footer";

export function AppShell({ children, showPrivate }: { children: ReactNode; showPrivate: boolean }) {
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteNav showPrivate={showPrivate} />
      <main id="main-content" className="app-main" tabIndex={-1}>{children}</main>
      <StatusFooter />
    </div>
  );
}
