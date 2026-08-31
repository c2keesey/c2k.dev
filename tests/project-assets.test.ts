import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import catalog from "@/public/project-assets/catalog.json";
import safetyManifest from "@/public/project-assets/source-safety-manifest.json";
import { projects } from "@/lib/projects";

describe("public project asset safety contract", () => {
  it("covers every canonical target with a project-specific disposition", () => {
    expect(catalog.targets.map(({ id }) => id)).toEqual(projects.map(({ slug }) => slug));
    expect(catalog.summary.targets).toBe(projects.length);
    expect(catalog.summary.selectedAssets + catalog.summary.customVisualizationRecommendations).toBe(projects.length);
  });

  it("keeps selected assets content-addressed and safety-approved", () => {
    const approved = new Set(safetyManifest.selected.filter(({ safetyReview }) => safetyReview.result === "approved").map(({ assetId }) => assetId));
    for (const target of catalog.targets) {
      if (!("assets" in target)) continue;
      for (const asset of target.assets ?? []) {
        const assetPath = join(process.cwd(), "public", asset.url.replace(/^\//, ""));
        expect(statSync(assetPath).size, asset.id).toBe(asset.bytes);
        expect(createHash("sha256").update(readFileSync(assetPath)).digest("hex"), asset.id).toBe(asset.sha256);
        expect(approved.has(asset.safetyRef), asset.id).toBe(true);
      }
    }
  });

  it("keeps visualization briefs aligned with canonical runtime claims", () => {
    const briefs = Object.fromEntries(catalog.targets.flatMap((target) => target.recommendation ? [[target.id, target.recommendation.brief]] : []));
    expect(briefs.flux).not.toMatch(/seven named effects/i);
    expect(briefs.dashboard).toMatch(/mocked Expo client boundary/i);
    expect(briefs.dashboard).not.toMatch(/PWA delivery/i);
    expect(briefs.momentplayer).not.toMatch(/specification-only/i);
  });
});
