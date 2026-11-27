/**
 * The project network: one source of truth for the desktop map and the mobile line view.
 *
 * Every node rides exactly one route (its colour), and every edge is a real relationship
 * between two projects. x/y are percentages of the map's frame (see
 * components/network/layout.ts). Projects sit on a staggered lattice: rows at y 0, 50 and
 * 100, four columns (0, 33.3, 66.7, 100) on the outer rows and three (16.7, 50, 83.3) in
 * the middle. Small builds sit on the gutter rows between them (y 25 and 75, x in
 * sevenths). Platform and Claude tools ride the top, hardware the bottom. The slots were
 * chosen to keep every route clear of the cards and crossings low; keep new stations on
 * the lattice.
 *
 * This is the ONLY place project copy lives (name, tagline, description, tech, links).
 * Components read it; nothing copies it. The daily c2k-project-sync bot (dotfiles/bin)
 * edits `tagline` and `description` here and nowhere else.
 */
import type { Activity, Route, Status } from '@/components/system';

export type ShowcaseId =
  | 'maia'
  | 'c2k'
  | 'dotfiles'
  | 'statusline'
  | 'spotify'
  | 'flux'
  | 'corne'
  | 'lightning'
  | 'alldifferent';

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** what it is to Chris, rendered as a role badge */
  role: string;
  status: Status;
  /** how often it actually does something → status dot heartbeat */
  activity: Activity;
  route: Route;
  /** small builds draw as a diamond station instead of a card */
  kind: 'project' | 'satellite';
  wip?: boolean;
  tech: string[];
  link?: string;
  linkText?: string;
  /** GitHub repo name in /api/activity, for "last push" */
  repo?: string;
  /** a bespoke interactive showcase exists for this project */
  showcase?: ShowcaseId;
  x: number;
  y: number;
}

export interface Edge {
  from: string;
  to: string;
  label: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'maia', name: 'MAIA', tagline: 'AI geospatial platform',
    description: 'Ask a question about a property, get a map back. My day job: LLM orchestration, agent workflows, and the property data pipelines underneath.',
    role: 'startup', status: 'online', activity: 'active', route: 'core', kind: 'project',
    tech: ['TypeScript', 'Python', 'FastAPI', 'Postgres', 'GCP'],
    link: 'https://maia-analytics.com', linkText: 'maia-analytics.com', repo: 'maia-analytics',
    showcase: 'maia', x: 0, y: 0,
  },
  {
    id: 'c2k', name: 'c2k.page', tagline: 'This website',
    description: 'This site. Astro SSR on the OptiPlex under my desk, out through a Cloudflare Tunnel. Every project on it got a hand-built component instead of a card.',
    role: 'web', status: 'online', activity: 'active', route: 'core', kind: 'project',
    tech: ['Astro', 'TypeScript', 'React', 'Tailwind', 'Cloudflare'],
    link: 'https://c2k.page', linkText: 'c2k.page', repo: 'c2k.dev',
    showcase: 'c2k', x: 33.3, y: 0,
  },
  {
    id: 'flux', name: 'Flux Gauntlet', tagline: 'LED wearable',
    description: '300 LEDs in 16 rings, addressed as a 3D cylinder so effects travel around the arm instead of along a strip. Seven of them: blast, lightning, fire, firework, casimir, twinkle, pew.',
    role: 'hardware', status: 'standby', activity: 'none', route: 'hardware', kind: 'project',
    tech: ['C++', 'FastLED', 'ESP32'],
    showcase: 'flux', x: 100, y: 100,
  },
  {
    id: 'corne', name: 'Corne', tagline: '42-key split keyboard',
    description: '42 keys and 7 layers, running ZMK. Combos, home row mods, vim-style arrows. No number row, which sounds worse than it is.',
    role: 'daily driver', status: 'online', activity: 'periodic', route: 'hardware', kind: 'project',
    tech: ['ZMK', 'C', 'KiCad'],
    showcase: 'corne', x: 33.3, y: 100,
  },
  {
    id: 'spotify', name: 'Spotify Macro', tagline: 'Library auto-sorter',
    description: 'Keeps my Spotify library sorted without me. The whole library is cached locally so classification runs offline; track metadata plus a 30-second audio embedding decide which folder a new song belongs in. Adding the audio head moved folder accuracy from .800 to .878.',
    role: 'automation', status: 'online', activity: 'periodic', route: 'automation', kind: 'project',
    tech: ['Python', 'Spotify API', 'EfficientNet', 'scikit-learn', 'launchd'],
    showcase: 'spotify', x: 0, y: 100,
  },
  {
    id: 'dashboard', name: 'OptiPlex Dashboard', tagline: 'Server monitoring PWA',
    description: 'Mobile-first dashboard for the OptiPlex. CPU, memory, disk, network sparklines, cron status and running Claude sessions, all polled live. Installable PWA, reachable over Tailscale. The readouts in the corner of this map come from it.',
    role: 'infra', status: 'online', activity: 'active', route: 'core', kind: 'project',
    tech: ['Next.js', 'TypeScript', 'shadcn/ui', 'SQLite', 'systeminformation'],
    x: 83.3, y: 50,
  },
  {
    id: 'dotfiles', name: 'Dotfiles', tagline: 'Dev environment system',
    description: 'One repo for shell, editor, keybindings, and my Claude Code skills and hooks. Symlinked into place, so setting up a new machine is a clone and a script.',
    role: 'tooling', status: 'online', activity: 'periodic', route: 'config', kind: 'project',
    tech: ['Bash', 'Zsh', 'Claude Code', 'Tmux', 'Ghostty'],
    link: 'https://github.com/c2keesey/dotfiles', linkText: 'github/dotfiles', repo: 'dotfiles',
    showcase: 'dotfiles', x: 50, y: 50,
  },
  {
    id: 'statusline', name: 'Codex Statusline', tagline: 'Native footer + tmux telemetry',
    description: 'A Claude-style status line for Codex. Codex renders its own git, thread, context, model, and limit state; a tiny Go companion adds CPU, memory, weekly burn pace, and Agent Deck identity in tmux.',
    role: 'open source', status: 'online', activity: 'periodic', route: 'claude', kind: 'project',
    tech: ['Go', 'Codex', 'tmux', 'Agent Deck'],
    link: 'https://github.com/c2keesey/codex-statusline', linkText: 'github/codex-statusline', repo: 'codex-statusline',
    showcase: 'statusline', x: 100, y: 0,
  },
  {
    id: 'secretgate', name: 'Secret Gate', tagline: 'Human-in-the-loop gate',
    description: 'An agent that wants a 1Password secret or a sudo command has to ask my phone first. Telegram sends the request, I reply yes or no, nothing runs without an answer. Ships as a Claude Code plugin.',
    role: 'security', status: 'deploying', activity: 'active', route: 'claude', kind: 'satellite', wip: true,
    tech: ['Python', '1Password CLI', 'Telegram', 'Claude Code'],
    link: 'https://github.com/c2keesey/secret-gate', linkText: 'github/secret-gate', repo: 'secret-gate',
    x: 100, y: 25,
  },
  {
    id: 'techdigest', name: 'Tech Digest', tagline: 'Daily release digest',
    description: 'Pulls release notes for everything in my stack, has Claude read them, and sends me the short version on Telegram. The same bot lets me drive a headless Claude session from my phone.',
    role: 'daily driver', status: 'online', activity: 'periodic', route: 'automation', kind: 'satellite',
    tech: ['Python', 'Claude CLI', 'Telegram', 'GitHub API', 'cron'],
    link: 'https://github.com/c2keesey/tech-digest', linkText: 'github/tech-digest', repo: 'tech-digest',
    x: 100, y: 75,
  },
  {
    id: 'lightning', name: 'Lightning Cloud', tagline: 'Procedural lightning',
    description: 'A cloud lamp that makes its own lightning. Bolts are generated at runtime with branching forks, then flashed and faded. No animation files, just an ESP32 doing math.',
    role: 'hardware', status: 'standby', activity: 'none', route: 'hardware', kind: 'project',
    tech: ['C++', 'FastLED', 'ESP32'],
    showcase: 'lightning', x: 66.7, y: 100,
  },
  {
    id: 'propeller', name: 'Propeller Scrape', tagline: 'Concert ticket monitor',
    description: 'Watches Propeller rewards for concert tickets in LA, SF, and Boulder and pings me on Telegram when something good shows up. Runs on cron and I forget it exists.',
    role: 'utility', status: 'online', activity: 'periodic', route: 'automation', kind: 'satellite',
    tech: ['Python', 'BeautifulSoup', 'Telegram', 'cron'],
    link: 'https://github.com/c2keesey/propeller-scrape', linkText: 'github/propeller-scrape', repo: 'propeller-scrape',
    x: 57.1, y: 75,
  },
  {
    id: 'panecmd', name: 'Pane Skill', tagline: 'Claude tmux side pane',
    description: 'Claude Code skill that throws files, diffs, and command output into a managed tmux side pane instead of the chat log. Routes each through Helix, delta, or less depending on what it is.',
    role: 'claude tools', status: 'online', activity: 'periodic', route: 'claude', kind: 'satellite',
    tech: ['Bash', 'tmux', 'Claude Code', 'Helix'],
    link: 'https://github.com/c2keesey/claude-pane-skill', linkText: 'github/claude-pane-skill', repo: 'claude-pane-skill',
    x: 71.4, y: 25,
  },
  {
    id: 'playlistai', name: 'Playlist AI', tagline: 'ML playlist sorter',
    description: 'The first attempt at auto-sorting my liked songs, back when Spotify still handed out audio features. Random forests against gradient boosting against SVMs against a small net, scored on my own playlists.',
    role: 'ml', status: 'standby', activity: 'none', route: 'software', kind: 'satellite',
    tech: ['Python', 'scikit-learn', 'Jupyter', 'Spotify API'],
    link: 'https://github.com/c2keesey/spotify-playlist-ai', linkText: 'github/spotify-playlist-ai', repo: 'spotify-playlist-ai',
    x: 28.6, y: 75,
  },
  {
    id: 'djtrainer', name: 'DJ Trainer', tagline: 'Learn the DDJ-FLX4',
    description: 'Click any knob, fader or pad on a Pioneer DDJ-FLX4 and it tells you what that one does. The hotspots come from an on-device SAM and CoreML pipeline that finds the controls in a photo, because placing them all by hand was not happening.',
    role: 'learning', status: 'online', activity: 'periodic', route: 'software', kind: 'project',
    tech: ['JavaScript', 'Vite', 'Python', 'CoreML', 'SAM'],
    x: 16.7, y: 50,
  },
  {
    id: 'songsorter', name: 'Song Sorter', tagline: 'Pairwise library ranker',
    description: 'Ranks a Spotify library by making you pick between two songs, over and over, until fuzzy taste comes out as an ordered list. React and Zustand over the Spotify Web API.',
    role: 'web app', status: 'standby', activity: 'none', route: 'software', kind: 'satellite',
    tech: ['TypeScript', 'React', 'Zustand', 'Radix UI', 'Tailwind'],
    link: 'https://github.com/c2keesey/spotify-song-sorter', linkText: 'github/song-sorter', repo: 'spotify-song-sorter',
    x: 14.3, y: 75,
  },
  {
    id: 'momentplayer', name: 'Moment Player', tagline: 'Podcast AI companion',
    description: 'Podcast player for iOS. Pause on a line you did not follow, ask about it, get an answer with the transcript as context, then keep going. SwiftUI on the front, a Python transcript and LLM service behind it.',
    role: 'ios', status: 'standby', activity: 'none', route: 'software', kind: 'satellite', wip: true,
    tech: ['Swift', 'SwiftUI', 'Python', 'FastAPI', 'LLM'],
    x: 14.3, y: 25,
  },
  {
    id: 'alldifferent', name: 'All Look Different', tagline: 'Border-desk face quiz',
    description: 'Eighteen real British, German and French faces at a border desk, and you stamp the passport you think each one holds. Freely licensed portraits from Wikidata and Wikimedia Commons, a global roster on Cloudflare Workers, and a European answer to alllooksame.com.',
    role: 'game', status: 'online', activity: 'periodic', route: 'software', kind: 'satellite',
    tech: ['JavaScript', 'Wikidata', 'Wikimedia Commons', 'Cloudflare Workers'],
    link: 'https://alllookdifferent.c2k.page', linkText: 'alllookdifferent.c2k.page',
    showcase: 'alldifferent', x: 0, y: 75,
  },
  {
    id: 'vibe', name: 'Vibe Framework', tagline: 'In-app agent, live reload',
    description: 'Astro template with a chat panel on every page, wired to a Claude Code session on the host machine. Ask it to change something and Vite refreshes the page while you watch. Works from my phone over Tailscale, which is either very good or very bad.',
    role: 'tooling', status: 'deploying', activity: 'active', route: 'claude', kind: 'satellite', wip: true,
    tech: ['Astro', 'TypeScript', 'Bun', 'Claude Code', 'SSE'],
    x: 42.9, y: 25,
  },
  {
    id: 'polymarket', name: 'Polymarket Bot', tagline: 'Behavioral edge research',
    description: 'Backtest and paper-trade harness for behavioral biases on prediction markets. Public read-only data, no wallet, no real money. Most of the hypotheses died in the gauntlet; the mid-range underdog one survived replication.',
    role: 'research', status: 'standby', activity: 'none', route: 'automation', kind: 'satellite',
    tech: ['Python', 'pandas', 'Polymarket API'],
    x: 85.7, y: 75,
  },
  {
    id: 'calsync', name: 'Cal Sync', tagline: 'Apple Note ↔ Calendar',
    description: 'Plans get written in a shared Apple Note, not a calendar app. This syncs that note to a Google Calendar both ways, and identifies the calendar by a marker instead of its name so renaming it does not quietly break the sync.',
    role: 'automation', status: 'online', activity: 'periodic', route: 'automation', kind: 'satellite',
    tech: ['Python', 'Google Calendar API', 'AppleScript', 'launchd'],
    x: 42.9, y: 75,
  },
  {
    id: 'parley', name: 'Parley', tagline: 'Two-way voice for coding agents',
    description: 'Turns terminal coding agents into a real voice loop: replies are spoken as they land, long jobs can narrate themselves, and a wake phrase lets me answer hands-free. One queue keeps every session from talking over the others.',
    role: 'open source', status: 'online', activity: 'active', route: 'claude', kind: 'project',
    tech: ['Python', 'Claude Code', 'Codex', 'OpenAI', 'whisper.cpp', 'tmux'],
    link: 'https://github.com/c2keesey/parley', linkText: 'github/parley', repo: 'parley',
    x: 66.7, y: 0,
  },
];

/** Real relationships. Flow runs from → to (the thing depended on toward the thing using it). */
export const EDGES: Edge[] = [
  { from: 'dotfiles', to: 'maia', label: 'primary workspace' },
  { from: 'maia', to: 'c2k', label: 'showcase piece' },
  { from: 'c2k', to: 'dotfiles', label: 'co-hosted on optiplex' },
  { from: 'dotfiles', to: 'statusline', label: 'installed by dotfiles' },
  { from: 'statusline', to: 'parley', label: 'codex tooling' },
  { from: 'corne', to: 'c2k', label: 'interactive keymap' },
  { from: 'dotfiles', to: 'corne', label: 'keyboard config' },
  { from: 'dotfiles', to: 'secretgate', label: 'claude code plugin' },
  { from: 'dotfiles', to: 'propeller', label: 'cron on optiplex' },
  { from: 'corne', to: 'flux', label: 'hand-soldered' },
  { from: 'corne', to: 'lightning', label: 'hand-soldered' },
  { from: 'flux', to: 'lightning', label: 'ESP32 + FastLED' },
  { from: 'corne', to: 'spotify', label: 'hotkey macros' },
  { from: 'spotify', to: 'propeller', label: 'background automation' },
  { from: 'secretgate', to: 'propeller', label: 'telegram bots' },
  { from: 'secretgate', to: 'techdigest', label: 'telegram bots' },
  { from: 'dotfiles', to: 'techdigest', label: 'cron on optiplex' },
  { from: 'dashboard', to: 'c2k', label: 'co-hosted on optiplex' },
  { from: 'dashboard', to: 'dotfiles', label: 'monitored services' },
  { from: 'dashboard', to: 'techdigest', label: 'monitors crons' },
  { from: 'dotfiles', to: 'panecmd', label: 'claude code skill' },
  { from: 'panecmd', to: 'secretgate', label: 'claude tools' },
  { from: 'playlistai', to: 'spotify', label: 'spotify api' },
  { from: 'songsorter', to: 'spotify', label: 'spotify api' },
  { from: 'playlistai', to: 'songsorter', label: 'library sorting' },
  { from: 'playlistai', to: 'djtrainer', label: 'on-device ML' },
  { from: 'songsorter', to: 'djtrainer', label: 'react web apps' },
  { from: 'maia', to: 'momentplayer', label: 'LLM backend' },
  { from: 'c2k', to: 'momentplayer', label: 'hand-built UI' },
  { from: 'c2k', to: 'alldifferent', label: 'cloudflare' },
  { from: 'songsorter', to: 'alldifferent', label: 'browser frontends' },
  { from: 'c2k', to: 'vibe', label: 'same astro + bun stack' },
  { from: 'dotfiles', to: 'vibe', label: 'claude code harness' },
  { from: 'techdigest', to: 'polymarket', label: 'agent-driven python' },
  { from: 'propeller', to: 'polymarket', label: 'public api scrapers' },
  { from: 'dotfiles', to: 'calsync', label: 'launchd plist in dotfiles' },
  { from: 'spotify', to: 'calsync', label: 'launchd on the mac' },
  { from: 'dotfiles', to: 'parley', label: 'agent skills + hooks' },
  { from: 'panecmd', to: 'parley', label: 'terminal agent tools' },
];

export const PROJECT_BY_ID: Record<string, Project> = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

/** node id → indices into EDGES */
export const EDGES_BY_NODE: Record<string, number[]> = (() => {
  const m: Record<string, number[]> = Object.fromEntries(PROJECTS.map((p) => [p.id, [] as number[]]));
  EDGES.forEach((e, i) => {
    m[e.from].push(i);
    m[e.to].push(i);
  });
  return m;
})();

export function neighbours(id: string): string[] {
  return EDGES_BY_NODE[id].map((i) => (EDGES[i].from === id ? EDGES[i].to : EDGES[i].from));
}

/** Route order for legends and the mobile line view: platform first, hardware last. */
export const ROUTE_ORDER: Route[] = ['core', 'config', 'claude', 'automation', 'software', 'hardware'];
