import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("OptiPlex systemd artifact", () => {
  const unit = readFileSync(join(process.cwd(), "c2k-website.service"), "utf-8");

  it("declares production gating and loopback standalone startup", () => {
    expect(unit).toContain("Environment=C2K_ENV=production");
    expect(unit).toContain("Environment=NODE_ENV=production");
    expect(unit).toContain("Environment=HOSTNAME=127.0.0.1");
    expect(unit).toContain("Environment=PORT=4321");
    expect(unit).toContain("ExecStart=/home/c2k/.bun/bin/bun ./.next/standalone/server.js");
    expect(unit).not.toContain("dist/server/entry.mjs");
  });
});
