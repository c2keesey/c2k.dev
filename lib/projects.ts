import truthDocument from "@/docs/project-truth.json";

export type ProjectLifecycle = "live-public" | "active-private" | "maintained" | "prototype" | "historical" | "completed-artifact" | "research-monitoring";
export type TruthConfidence = "high" | "medium" | "low";

interface CanonicalLink { label: string; url: string; publicSafe: true }
interface TruthProjectRecord {
  id: string;
  name: string;
  migrationTarget: { desktop: true; mobile: true; richPage: true };
  canonical: {
    tagline: string;
    summary: string;
    status: { lifecycle: ProjectLifecycle; confidence: TruthConfidence; basis: string };
    tech: string[];
    links: CanonicalLink[];
  };
  storyBeats: string[];
  imagery: { recommend: string[]; avoid: string[] };
}

interface TruthDocument {
  schemaVersion: 1;
  scope: { migrationTargets: number; existingBespokeShowcases: string[]; additionalTarget: string };
  statusModel: { lifecycleValues: ProjectLifecycle[]; confidenceValues: TruthConfidence[] };
  projects: TruthProjectRecord[];
}

export interface ProjectLink { label: string; href: string }
export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  story: string;
  storyBeats: readonly string[];
  category: string;
  lifecycle: ProjectLifecycle;
  confidence: TruthConfidence;
  basis: string;
  accent: string;
  stack: readonly string[];
  highlights: readonly string[];
  links?: readonly ProjectLink[];
  featured?: boolean;
  workInProgress?: boolean;
}

export interface ProjectConnection { from: Project["slug"]; to: Project["slug"]; label: string }

const lifecycleValues = new Set<ProjectLifecycle>(["live-public", "active-private", "maintained", "prototype", "historical", "completed-artifact", "research-monitoring"]);
const confidenceValues = new Set<TruthConfidence>(["high", "medium", "low"]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertTruthDocument(value: unknown): asserts value is TruthDocument {
  if (!isObject(value) || value.schemaVersion !== 1 || !isObject(value.scope) || !Array.isArray(value.projects)) throw new Error("project-truth.json does not match schema version 1");
  if (value.projects.length !== value.scope.migrationTargets) throw new Error("Canonical project count does not match migration target");
  const ids = new Set<string>();
  for (const entry of value.projects) {
    if (!isObject(entry) || typeof entry.id !== "string" || typeof entry.name !== "string" || ids.has(entry.id)) throw new Error("Canonical project IDs must be unique strings");
    ids.add(entry.id);
    if (!isObject(entry.migrationTarget) || entry.migrationTarget.desktop !== true || entry.migrationTarget.mobile !== true || entry.migrationTarget.richPage !== true) throw new Error(`${entry.id} is missing a migration surface`);
    if (!isObject(entry.canonical) || typeof entry.canonical.tagline !== "string" || typeof entry.canonical.summary !== "string" || !isObject(entry.canonical.status)) throw new Error(`${entry.id} canonical facts are incomplete`);
    if (!lifecycleValues.has(entry.canonical.status.lifecycle as ProjectLifecycle) || !confidenceValues.has(entry.canonical.status.confidence as TruthConfidence)) throw new Error(`${entry.id} has an invalid truth status`);
    if (!Array.isArray(entry.canonical.tech) || entry.canonical.tech.length === 0 || !entry.canonical.tech.every((item) => typeof item === "string")) throw new Error(`${entry.id} needs canonical technologies`);
    if (!Array.isArray(entry.canonical.links) || !entry.canonical.links.every((link) => isObject(link) && link.publicSafe === true && typeof link.url === "string" && link.url.startsWith("https://"))) throw new Error(`${entry.id} contains a non-public link`);
    if (!Array.isArray(entry.storyBeats) || entry.storyBeats.length < 4 || !isObject(entry.imagery) || !Array.isArray(entry.imagery.avoid)) throw new Error(`${entry.id} is missing story or privacy guidance`);
  }
}

assertTruthDocument(truthDocument);
export const projectTruth: TruthDocument = truthDocument;

const featured = new Set([...projectTruth.scope.existingBespokeShowcases, projectTruth.scope.additionalTarget, "parley"]);
const accents = ["cyan", "violet", "orange", "cyan", "green", "rose", "violet", "red", "violet", "indigo", "orange", "red", "green", "pink", "emerald", "indigo", "amber", "violet", "teal", "lime", "blue", "orange"] as const;

function categoryFor(record: TruthProjectRecord): string {
  const tech = record.canonical.tech.join(" ").toLowerCase();
  if (["flux", "corne", "lightning"].includes(record.id)) return "hardware";
  if (["spotify", "techdigest", "propeller", "calsync"].includes(record.id)) return "automation";
  if (["dashboard", "agent-console"].includes(record.id)) return "private infrastructure";
  if (["playlistai", "polymarket"].includes(record.id)) return "research";
  if (["djtrainer", "alldifferent"].includes(record.id)) return "interactive learning";
  if (tech.includes("react") || tech.includes("astro") || tech.includes("swiftui")) return "application";
  return "tooling";
}

export const projects: readonly Project[] = projectTruth.projects.map((record, index) => ({
  slug: record.id,
  name: record.name,
  tagline: record.canonical.tagline,
  description: record.canonical.summary,
  story: record.storyBeats.join(" "),
  storyBeats: record.storyBeats,
  category: categoryFor(record),
  lifecycle: record.canonical.status.lifecycle,
  confidence: record.canonical.status.confidence,
  basis: record.canonical.status.basis,
  accent: accents[index % accents.length],
  stack: record.canonical.tech,
  highlights: record.storyBeats.slice(1),
  links: record.canonical.links.length ? record.canonical.links.map(({ label, url }) => ({ label, href: url })) : undefined,
  featured: featured.has(record.id),
  workInProgress: record.canonical.status.lifecycle === "prototype",
}));

export const projectConnections = [
  ["maia", "c2k", "public readout"], ["maia", "dotfiles", "development environment"],
  ["c2k", "dashboard", "host observability"], ["c2k", "agent-console", "private control plane"],
  ["c2k", "corne", "interactive keymap"], ["dotfiles", "corne", "keyboard configuration"],
  ["dotfiles", "panecmd", "agent tooling"], ["dotfiles", "parley", "agent voice layer"],
  ["dotfiles", "calsync", "scheduled automation"], ["spotify", "playlistai", "historical predecessor"],
  ["spotify", "songsorter", "human triage companion"], ["flux", "corne", "hand-built hardware"],
  ["flux", "lightning", "procedural LEDs"], ["secretgate", "techdigest", "Telegram workflows"],
  ["dashboard", "agent-console", "machine visibility"], ["dotfiles", "agent-console", "agent tooling"],
  ["vibe", "c2k", "web feedback loop"], ["momentplayer", "maia", "context retrieval"],
  ["alldifferent", "djtrainer", "interactive learning"], ["polymarket", "propeller", "public-data monitoring"],
].map(([from, to, label]) => ({ from, to, label })) as readonly ProjectConnection[];

export function getProject(slug: string): Project | undefined { return projects.find((project) => project.slug === slug); }

export function getConnectedProjects(slug: string) {
  return projectConnections.flatMap((connection) => {
    if (connection.from === slug) return [{ project: getProject(connection.to)!, label: connection.label }];
    if (connection.to === slug) return [{ project: getProject(connection.from)!, label: connection.label }];
    return [];
  });
}

export const projectCategories = [...new Set(projects.map((project) => project.category))].sort();
