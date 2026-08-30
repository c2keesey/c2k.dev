import { spawn } from "node:child_process";

const port = 4382;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [".next/standalone/server.js"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, C2K_ENV: "production", NODE_ENV: "production", HOSTNAME: "127.0.0.1", PORT: String(port) },
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

async function expectRoute(path, status, method = "GET") {
  const response = await fetch(`${origin}${path}`, { method, redirect: "manual" });
  if (response.status !== status) throw new Error(`${method} ${path}: expected ${status}, got ${response.status}`);
  return response;
}

try {
  await waitForServer();
  await expectRoute("/", 200);
  await expectRoute("/projects", 200);
  await expectRoute("/projects/parley", 200);
  await expectRoute("/projects/agent-console", 200);
  await expectRoute("/about", 404);
  await expectRoute("/lab", 404);
  await expectRoute("/api/activity", 200);
  await expectRoute("/api/status", 200);
  await expectRoute("/api/feature/current", 200);
  await expectRoute("/api/feature/accept", 404, "POST");
  await expectRoute("/api/feature/deny", 404, "POST");
  console.log("Standalone production smoke passed: deep links, private gates, and five APIs.");
} finally {
  server.kill("SIGTERM");
}
