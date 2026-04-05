// C2K_ENV is set by systemd services (production/staging/feature).
// Defaults to 'feature' so fresh worktrees and `bun run dev` get full
// interactive controls without any manual env setup.

export type C2kEnv = 'production' | 'staging' | 'feature';

const raw = (process.env.C2K_ENV || 'feature') as string;
export const env: C2kEnv = ['production', 'staging', 'feature'].includes(raw)
  ? (raw as C2kEnv)
  : 'feature';

export const isProduction = env === 'production';
export const isPrivate = env === 'staging' || env === 'feature';
