/**
 * Site map for the new shell. While the rebuild is in progress, ported pages live
 * under /next so the legacy site at / keeps working. Swapping over = set BASE to ''
 * and move src/pages/next/* up a level.
 */
export const BASE = '/next';

export const NAV = [
  { href: `${BASE}/`, label: 'home', match: (p: string) => p === `${BASE}` || p === `${BASE}/` },
  { href: `${BASE}/projects`, label: 'projects', match: (p: string) => p.startsWith(`${BASE}/projects`) },
  { href: `${BASE}/about`, label: 'about', match: (p: string) => p.startsWith(`${BASE}/about`) },
] as const;

export const THEME_STORAGE_KEY = 'c2k-theme'; // shared with the legacy ThemeToggle
