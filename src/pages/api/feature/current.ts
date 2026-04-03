export const prerender = false;

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const STATE_PATH = join(homedir(), '.config', 'c2k-feature-lab', 'state.json');

const DEFAULT_STATE = {
  version: 1,
  status: 'idle',
  current: null,
  history: [],
  next_source: 'bead',
  denied_patterns: [],
  seeded_themes: [
    'micro-interactions and hover effects',
    'terminal/CLI aesthetic elements',
    'data visualization and sparklines',
    'accessibility improvements',
    'performance and loading polish',
  ],
};

function isPreviewPort(request: Request): boolean {
  const host = request.headers.get('host') || '';
  return host.includes(':4322') || host.startsWith('localhost');
}

function readState() {
  if (!existsSync(STATE_PATH)) return DEFAULT_STATE;
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf-8'));
  } catch {
    return DEFAULT_STATE;
  }
}

export async function GET({ request }: { request: Request }) {
  if (!isPreviewPort(request)) {
    return new Response('Not found', { status: 404 });
  }

  const state = readState();

  return new Response(JSON.stringify({
    status: state.status,
    current: state.current,
    history: state.history || [],
  }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
  });
}
