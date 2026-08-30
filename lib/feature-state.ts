import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

export interface FeatureProposal {
  title?: string;
  description?: string;
  source?: string;
  proposed_at?: string;
  files_changed?: string[];
  branch?: string;
  outcome?: "accepted" | "denied" | "error";
  feedback?: string;
  resolved_at?: string;
}

export interface FeatureState {
  version: number;
  status: "idle" | "proposing" | "pending_review" | "accepting" | "denying";
  current: FeatureProposal | null;
  history: FeatureProposal[];
  next_source: string;
  denied_patterns: string[];
  seeded_themes: string[];
  log_file?: string;
  accept_feedback?: string | null;
  deny_reason?: string | null;
}

export const defaultFeatureState: FeatureState = {
  version: 1,
  status: "idle",
  current: null,
  history: [],
  next_source: "bead",
  denied_patterns: [],
  seeded_themes: [
    "micro-interactions and hover effects",
    "terminal/CLI aesthetic elements",
    "data visualization and sparklines",
    "accessibility improvements",
    "performance and loading polish",
  ],
};

export function getFeatureStateDirectory(): string {
  return process.env.C2K_FEATURE_STATE_DIR || join(homedir(), ".config", "c2k-feature-lab");
}

export function getFeatureStatePath(): string {
  return join(getFeatureStateDirectory(), "state.json");
}

export function readFeatureState(): FeatureState {
  const statePath = getFeatureStatePath();
  if (!existsSync(statePath)) return structuredClone(defaultFeatureState);
  try {
    return { ...structuredClone(defaultFeatureState), ...JSON.parse(readFileSync(statePath, "utf-8")) } as FeatureState;
  } catch {
    return structuredClone(defaultFeatureState);
  }
}

export function writeFeatureState(state: FeatureState): void {
  const directory = getFeatureStateDirectory();
  mkdirSync(directory, { recursive: true });
  writeFileSync(getFeatureStatePath(), JSON.stringify(state, null, 2));
}

export function featureStateAgeMs(): number | null {
  try {
    return Date.now() - statSync(getFeatureStatePath()).mtimeMs;
  } catch {
    return null;
  }
}

export function triggerFeatureLab(action: "accept" | "deny" | "propose"): void {
  const script = process.env.C2K_FEATURE_LAB_SCRIPT || join(homedir(), ".local", "bin", "c2k-feature-lab");
  const child = spawn(/* turbopackIgnore: true */ script, [action], {
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      PATH: `${homedir()}/.local/bin:${homedir()}/.cargo/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH ?? ""}`,
    },
  });
  child.unref();
}
