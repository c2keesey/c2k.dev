import { describe, expect, it } from "vitest";
import { getConnectedProjects, getProject, projectConnections, projects, projectTruth } from "@/lib/projects";
import projectAssetCatalog from "@/public/project-assets/catalog.json";

const canonicalLifecycle = {
  maia: "active-private", c2k: "live-public", flux: "completed-artifact", corne: "maintained",
  spotify: "active-private", dashboard: "prototype", dotfiles: "active-private", secretgate: "prototype",
  techdigest: "maintained", lightning: "completed-artifact", propeller: "maintained", panecmd: "maintained",
  playlistai: "historical", djtrainer: "prototype", songsorter: "prototype", momentplayer: "prototype",
  alldifferent: "live-public", vibe: "active-private", polymarket: "research-monitoring", calsync: "active-private",
  parley: "maintained", "agent-console": "active-private",
} as const;

describe("canonical project registry", () => {
  it("derives all 22 runtime records directly from the audited ledger", () => {
    expect(projects.map(({ slug }) => slug)).toEqual(Object.keys(canonicalLifecycle));
    expect(new Set(projects.map(({ slug }) => slug)).size).toBe(22);
    expect(projects.every((project) => !("status" in project))).toBe(true);

    for (const project of projects) {
      const source = projectTruth.projects.find(({ id }) => id === project.slug)!;
      expect(project).toMatchObject({
        name: source.name,
        tagline: source.canonical.tagline,
        description: source.canonical.summary,
        lifecycle: canonicalLifecycle[project.slug as keyof typeof canonicalLifecycle],
        confidence: source.canonical.status.confidence,
        basis: source.canonical.status.basis,
      });
      expect(project.stack).toEqual(source.canonical.tech);
      expect(project.links?.map(({ href }) => href) ?? []).toEqual(source.canonical.links.map(({ url }) => url));
    }
  });

  it("locks audited technology and link corrections", () => {
    expect(getProject("maia")?.stack).toContain("PostgreSQL/PostGIS");
    expect(getProject("maia")?.stack).not.toContain("DuckDB");
    expect(getProject("maia")?.links?.[0].href).toBe("https://www.maia-analytics.com/");
    expect(getProject("corne")?.stack).toContain("ZMK");
    expect(getProject("corne")?.stack).not.toContain("QMK");
    expect(getProject("corne")?.links?.[0].href).toBe("https://github.com/c2keesey/zmk-config-corne-2");
    expect(getProject("dashboard")?.stack).toEqual(expect.arrayContaining(["Express", "Expo 54", "React Native 0.81"]));
    expect(getProject("lightning")?.stack).not.toContain("ESP32");
    expect(getProject("parley")?.tagline).toBe("Two-way voice for terminal coding agents");
    expect(getProject("alldifferent")?.links?.[0].href).toBe("https://c2keesey.github.io/All-look-different/");
    expect(getProject("c2k")?.stack).toEqual(expect.arrayContaining(["Next.js 16", "React 19", "TypeScript 6"]));
    expect(getProject("c2k")?.stack).not.toContain("Astro 5");
  });

  it("keeps canonical evidence free of workstation paths", () => {
    expect(JSON.stringify(projectTruth)).not.toMatch(/\/(?:Users|home)\//);
  });

  it("enforces canonical public-link and privacy rules", () => {
    for (const slug of ["spotify", "dashboard", "dotfiles", "djtrainer", "momentplayer", "vibe", "polymarket", "calsync", "agent-console"]) {
      expect(getProject(slug)?.links, `${slug} must have no public action`).toBeUndefined();
    }
    for (const project of projects) {
      expect(JSON.stringify(project.links ?? [])).not.toMatch(/localhost|127\.0\.0\.1|100\.\d+|\.ts\.net|token|bearer/i);
    }
    const agentConsole = getProject("agent-console")!;
    expect(agentConsole.stack).toEqual(expect.arrayContaining(["Node.js", "React 19", "TypeScript 6", "Pi RPC", "systemd", "PWA"]));
    expect(JSON.stringify(agentConsole)).not.toMatch(/localhost|127\.0\.0\.1|100\.\d+|\.ts\.net|token|bearer|session id|machine id/i);
  });

  it("keeps Song Sorter on audited current-track triage, never pairwise ranking", () => {
    const project = getProject("songsorter")!;
    const songSorter = JSON.stringify({ description: project.description, story: project.story, highlights: project.highlights });
    const assetBrief = projectAssetCatalog.targets.find(({ id }) => id === "songsorter")!.recommendation!;
    expect(songSorter).toMatch(/current track/i);
    expect(songSorter).toMatch(/undo/i);
    expect(songSorter).not.toMatch(/pairwise/i);
    expect(assetBrief.kind).toBe("current_track_triage");
    expect(JSON.stringify(assetBrief)).not.toMatch(/pairwise/i);
  });

  it("only connects known projects and preserves Agent Console foundation relationships", () => {
    const slugs = new Set(projects.map((project) => project.slug));
    for (const connection of projectConnections) {
      expect(slugs.has(connection.from)).toBe(true);
      expect(slugs.has(connection.to)).toBe(true);
    }
    expect(getConnectedProjects("agent-console").map(({ project }) => project.slug).sort()).toEqual(["c2k", "dashboard", "dotfiles"]);
  });
});
