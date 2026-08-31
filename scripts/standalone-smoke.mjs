import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const stateDirectory = mkdtempSync(join(tmpdir(), "c2k-standalone-smoke-"));
const standaloneServer = readFileSync(join(process.cwd(), ".next", "standalone", "server.js"), "utf-8");
if (standaloneServer.includes(process.cwd())) throw new Error("Standalone server leaks the absolute build path");

async function withServer({ port, environment }, verify) {
  const origin = `http://127.0.0.1:${port}`;
  const serverEnvironment = {
    ...process.env,
    NODE_ENV: "production",
    HOSTNAME: "127.0.0.1",
    PORT: String(port),
    C2K_FEATURE_STATE_DIR: stateDirectory,
    C2K_FEATURE_LAB_SCRIPT: "/usr/bin/true",
  };
  if (environment === undefined) delete serverEnvironment.C2K_ENV;
  else serverEnvironment.C2K_ENV = environment;

  const server = spawn(process.execPath, [".next/standalone/server.js"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: serverEnvironment,
  });
  let output = "";
  server.stdout.on("data", (chunk) => { output += chunk; });
  server.stderr.on("data", (chunk) => { output += chunk; });

  async function waitForServer() {
    for (let attempt = 0; attempt < 80; attempt++) {
      try {
        const response = await fetch(origin);
        if (response.ok) return;
      } catch { /* booting */ }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Standalone server did not become ready.\n${output}`);
  }

  try {
    await waitForServer();
    await verify(origin);
  } finally {
    server.kill("SIGTERM");
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 1_000);
      server.once("exit", () => { clearTimeout(timer); resolve(); });
    });
  }
}

async function expectRoute(origin, path, status, options = {}) {
  const response = await fetch(`${origin}${path}`, { redirect: "manual", ...options });
  if (response.status !== status) throw new Error(`${options.method ?? "GET"} ${path}: expected ${status}, got ${response.status}`);
  return response;
}

try {
  await withServer({ port: 4382, environment: "production" }, async (origin) => {
    await expectRoute(origin, "/", 200);
    await expectRoute(origin, "/projects", 200);
    await expectRoute(origin, "/projects/parley", 200);
    await expectRoute(origin, "/projects/agent-console", 200);
    await expectRoute(origin, "/about", 404);
    await expectRoute(origin, "/lab", 404);
    await expectRoute(origin, "/api/activity", 200);
    await expectRoute(origin, "/api/status", 200);
    await expectRoute(origin, "/api/feature/current", 404);
    await expectRoute(origin, "/api/feature/accept", 404, { method: "POST" });
    await expectRoute(origin, "/api/feature/deny", 404, { method: "POST" });
    await expectRoute(origin, "/manifest.json", 200);
    await expectRoute(origin, "/project-assets/agent-console/icon.webp", 200);
  });

  for (const [port, environment] of [[4385, undefined], [4386, "unexpected"]]) {
    await withServer({ port, environment }, async (origin) => {
      await expectRoute(origin, "/about", 404);
      await expectRoute(origin, "/lab", 404);
      await expectRoute(origin, "/api/feature/current", 404);
      await expectRoute(origin, "/api/feature/accept", 404, { method: "POST" });
      await expectRoute(origin, "/api/feature/deny", 404, { method: "POST" });
    });
  }

  await withServer({ port: 4387, environment: "feature" }, async (origin) => {
    await expectRoute(origin, "/about", 200);
    await expectRoute(origin, "/lab", 200);
    await expectRoute(origin, "/api/feature/current", 200);
    const headers = { "Content-Type": "application/json", Origin: origin };
    await expectRoute(origin, "/api/feature/accept", 409, { method: "POST", headers, body: "{}" });
    await expectRoute(origin, "/api/feature/deny", 409, { method: "POST", headers, body: "{}" });
  });

  console.log("Standalone smoke passed: packaging, fail-closed gates, private mode, assets, and five APIs.");
} finally {
  rmSync(stateDirectory, { recursive: true, force: true });
}
