import { describe, expect, it } from "vitest";
import { getConnectedProjects, getProject, projectConnections, projects } from "@/lib/projects";

describe("canonical project registry", () => {
  it("contains all 21 migrated projects plus Agent Console", () => {
    expect(projects).toHaveLength(22);
    expect(new Set(projects.map((project) => project.slug)).size).toBe(22);
    expect(projects.every((project) => !("status" in project))).toBe(true);
    expect(new Set(projects.map((project) => project.lifecycle))).toEqual(new Set(["live-public", "active-private", "maintained", "prototype", "historical", "completed-artifact", "research-monitoring"]));
  });

  it("preserves the landed Parley project", () => {
    const parley = getProject("parley");
    expect(parley).toMatchObject({ name: "Parley", lifecycle: "maintained", tagline: "Two-way voice for coding agents" });
    expect(parley?.stack).toEqual(expect.arrayContaining(["Python", "Claude Code", "Codex", "OpenAI", "whisper.cpp", "tmux"]));
    expect(parley?.links?.[0].href).toBe("https://github.com/c2keesey/parley");
  });

  it("keeps Agent Console private-safe", () => {
    const consoleProject = getProject("agent-console");
    expect(consoleProject?.links).toBeUndefined();
    expect(consoleProject?.stack).toEqual(expect.arrayContaining(["Node.js", "React", "TypeScript", "Pi RPC", "systemd", "PWA"]));
    expect(JSON.stringify(consoleProject)).not.toMatch(/tailscale|100\.|token|bearer|localhost|127\.0\.0\.1|\.ts\.net/i);
  });

  it("only connects known projects and provides reverse lookups", () => {
    const slugs = new Set(projects.map((project) => project.slug));
    for (const connection of projectConnections) {
      expect(slugs.has(connection.from)).toBe(true);
      expect(slugs.has(connection.to)).toBe(true);
    }
    expect(getConnectedProjects("agent-console").map(({ project }) => project.slug).sort()).toEqual(["c2k", "dashboard", "dotfiles"]);
  });
});
