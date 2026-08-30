"use client";

import { useEffect, useState } from "react";

interface StatusPayload {
  status: "online" | "offline";
  overall?: "green" | "yellow" | "red";
  cpu?: number | null;
  memory?: number | null;
  services?: { running: number; total: number };
  crons?: { ok: number; error: number; total: number };
  observedAt?: string;
}

function summary(data: StatusPayload | null): string {
  if (!data) return "Awaiting OptiPlex telemetry";
  if (data.status === "offline") return "OptiPlex offline";
  const services = data.services ? `${data.services.running}/${data.services.total} services` : "services unknown";
  const cpu = data.cpu == null ? "CPU unknown" : `${Math.round(data.cpu)}% CPU`;
  return `${services} · ${cpu}`;
}

export function StatusFooter() {
  const [status, setStatus] = useState<StatusPayload | null>(null);

  useEffect(() => {
    let active = true;
    const update = async () => {
      try {
        const response = await fetch("/api/status");
        const next = response.ok ? await response.json() as StatusPayload : { status: "offline" as const };
        if (active) setStatus({ ...next, observedAt: new Date().toISOString() });
      } catch {
        if (active) setStatus({ status: "offline", observedAt: new Date().toISOString() });
      }
    };
    void update();
    const timer = window.setInterval(update, 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const state = status?.status === "online" ? status.overall ?? "green" : "offline";
  return (
    <footer className="status-footer" aria-label="OptiPlex status">
      {status?.observedAt && <span className="status-indicator" data-state={state} aria-hidden="true" />}
      <span aria-live="polite">{summary(status)}</span>
      {status?.observedAt && <time className="status-observed" dateTime={status.observedAt}>observed {new Date(status.observedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>}
      <span className="status-location">37.76° N · 122.51° W</span>
    </footer>
  );
}
