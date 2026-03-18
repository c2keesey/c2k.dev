export const prerender = false;

const DASHBOARD_URL = 'http://localhost:3000';

interface HealthData {
  cpu: { percent: number };
  memory: { percent: number };
  uptime: string;
}

interface Automation {
  name: string;
  status: 'running' | 'success' | 'error' | 'idle' | 'pending';
}

interface AutomationsData {
  user: Automation[];
  system: Automation[];
  cron: Automation[];
}

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${DASHBOARD_URL}${path}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

export async function GET() {
  const [health, automations] = await Promise.all([
    fetchJSON<HealthData>('/api/health'),
    fetchJSON<AutomationsData>('/api/automations'),
  ]);

  if (!health && !automations) {
    return new Response(JSON.stringify({ status: 'offline' }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    });
  }

  const services = automations?.user ?? [];
  const systemServices = automations?.system ?? [];
  const crons = automations?.cron ?? [];

  const servicesRunning = services.filter(s => s.status === 'running').length;
  const servicesTotal = services.length;
  const systemRunning = systemServices.filter(s => s.status === 'running' || s.status === 'success').length;
  const systemTotal = systemServices.length;
  const cronsOk = crons.filter(c => c.status === 'success').length;
  const cronsError = crons.filter(c => c.status === 'error').length;
  const cronsTotal = crons.length;

  // Overall status: red if any service down or cron errors, yellow if idle, green if all good
  let overall: 'green' | 'yellow' | 'red' = 'green';
  if (cronsError > 0 || servicesRunning < servicesTotal || systemRunning < systemTotal) {
    overall = 'red';
  } else if (crons.some(c => c.status === 'idle')) {
    overall = 'yellow';
  }

  return new Response(JSON.stringify({
    status: 'online',
    overall,
    cpu: health?.cpu.percent ?? null,
    memory: health?.memory.percent ?? null,
    uptime: health?.uptime ?? null,
    services: { running: servicesRunning, total: servicesTotal },
    system: { running: systemRunning, total: systemTotal },
    crons: { ok: cronsOk, error: cronsError, total: cronsTotal },
  }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
  });
}
