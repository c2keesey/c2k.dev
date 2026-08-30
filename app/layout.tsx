import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import { isPrivateEnvironment } from "@/lib/env";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://c2k.page"),
  title: { default: "C2K — Christopher Keesey", template: "%s · C2K" },
  description: "Christopher Keesey's project atlas: agent systems, useful automations, hardware, and infrastructure running from an OptiPlex in San Francisco.",
  applicationName: "C2K",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  openGraph: { title: "C2K — Christopher Keesey", description: "A living atlas of systems, tools, and things built to be used.", type: "website", url: "https://c2k.page" },
  twitter: { card: "summary", title: "C2K — Christopher Keesey", description: "A living atlas of systems, tools, and things built to be used." },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#09090b", colorScheme: "dark light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <AppShell showPrivate={isPrivateEnvironment()}>{children}</AppShell>
      </body>
    </html>
  );
}
