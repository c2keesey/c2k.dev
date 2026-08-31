import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("OptiPlex systemd artifact", () => {
  const unit = readFileSync(join(process.cwd(), "c2k-website.service"), "utf-8");
  const standalonePreparation = readFileSync(join(process.cwd(), "scripts", "prepare-standalone.mjs"), "utf-8");

  it("declares production gating and loopback standalone startup", () => {
    expect(unit).toContain("Environment=C2K_ENV=production");
    expect(unit).toContain("Environment=NODE_ENV=production");
    expect(unit).toContain("Environment=HOSTNAME=127.0.0.1");
    expect(unit).toContain("Environment=PORT=4321");
    expect(unit).toContain("WorkingDirectory=%h/repos/c2k.dev");
    expect(unit).toContain("ExecStart=%h/.bun/bin/bun ./.next/standalone/server.js");
    expect(unit).not.toContain("/home/c2k");
    expect(unit).not.toContain("dist/server/entry.mjs");
  });

  it("removes the local build root from the distributable server", () => {
    expect(standalonePreparation).toContain("serverSource.replaceAll(root, \".\")");
  });
});
