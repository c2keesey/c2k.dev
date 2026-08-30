export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DASHBOARD_URL = "http://localhost:3000";

interface HealthData { cpu: { percent: number }; memory: { percent: number }; uptime: string }
interface Automation { name: string; status: "running" | "success" | "error" | "idle" | "pending" }
interface AutomationsData { user: Automation[]; system: Automation[]; cron: Automation[] }

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${DASHBOARD_URL}${path}`, { signal: AbortSignal.timeout(3_000) });
    return response.ok ? await response.json() as T : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const [health, automations] = await Promise.all([fetchJSON<HealthData>("/api/health"), fetchJSON<AutomationsData>("/api/automations")]);
  if (!health && !automations) return Response.json({ status: "offline" }, { headers: { "Cache-Control": "no-cache" } });

  const services = automations?.user ?? [];
  const systemServices = automations?.system ?? [];
  const crons = automations?.cron ?? [];
  const servicesRunning = services.filter((service) => service.status === "running").length;
  const systemRunning = systemServices.filter((service) => service.status === "running" || service.status === "success").length;
  const cronsOk = crons.filter((cron) => cron.status === "success").length;
  const cronsError = crons.filter((cron) => cron.status === "error").length;
  let overall: "green" | "yellow" | "red" = "green";
  if (cronsError || servicesRunning < services.length || systemRunning < systemServices.length) overall = "red";
  else if (crons.some((cron) => cron.status === "idle")) overall = "yellow";

  return Response.json({
    status: "online", overall,
    cpu: health?.cpu.percent ?? null, memory: health?.memory.percent ?? null, uptime: health?.uptime ?? null,
    services: { running: servicesRunning, total: services.length },
    system: { running: systemRunning, total: systemServices.length },
    crons: { ok: cronsOk, error: cronsError, total: crons.length },
  }, { headers: { "Cache-Control": "no-cache" } });
}
