export const prerender = false;

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { isProduction, isPrivate } from '../../../lib/env';

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

function readState() {
  if (!existsSync(STATE_PATH)) return DEFAULT_STATE;
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf-8'));
  } catch {
    return DEFAULT_STATE;
  }
}

export async function GET({ request }: { request: Request }) {
  const state = readState();

  // Auto-recover from stuck accepting/denying/proposing states (10 min timeout)
  const STUCK_STATES = ['accepting', 'denying', 'proposing'];
  if (STUCK_STATES.includes(state.status)) {
    try {
      const mtime = statSync(STATE_PATH).mtimeMs;
      if (Date.now() - mtime > 10 * 60 * 1000) {
        state.status = 'idle';
        state.current = null;
        writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
      }
    } catch { /* best effort */ }
  }

  // Surface last lines of the proposing log so the UI can show progress
  let logTail: string[] = [];
  if (state.status === 'proposing' && state.log_file) {
    try {
      const logContent = readFileSync(state.log_file, 'utf-8');
      const lines = logContent.split('\n').filter((l: string) => l.trim());
      logTail = lines.slice(-8);
    } catch { /* file may not exist yet */ }
  }

  return new Response(JSON.stringify({
    status: state.status,
    current: state.current,
    history: state.history || [],
    log_tail: logTail,
    interactive: isPrivate,
  }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
  });
}
