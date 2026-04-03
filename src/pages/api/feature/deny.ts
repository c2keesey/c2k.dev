export const prerender = false;

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { spawn } from 'node:child_process';

const STATE_DIR = join(homedir(), '.config', 'c2k-feature-lab');
const STATE_PATH = join(STATE_DIR, 'state.json');

function isPreviewPort(request: Request): boolean {
  const host = request.headers.get('host') || '';
  return host.includes(':4322') || host.startsWith('localhost');
}

function readState() {
  if (!existsSync(STATE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

function writeState(state: Record<string, unknown>) {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

export async function POST({ request }: { request: Request }) {
  if (!isPreviewPort(request)) {
    return new Response('Not found', { status: 404 });
  }

  const state = readState();
  if (!state || state.status !== 'pending_review') {
    return new Response(JSON.stringify({ error: 'No feature pending review' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json().catch(() => ({})) as { reason?: string };

  // Record denial pattern
  if (body.reason) {
    state.denied_patterns.push(body.reason);
  }

  // Keep current intact — the script needs the branch name to clean up.
  // Script will move current to history and clear it.
  state.status = 'denying';
  state.deny_reason = body.reason || null;
  writeState(state);

  // Spawn background process
  const labScript = join(homedir(), '.local', 'bin', 'c2k-feature-lab');
  const child = spawn(labScript, ['deny'], {
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      PATH: `${homedir()}/.local/bin:${homedir()}/.cargo/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH}`,
    },
  });
  child.unref();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
