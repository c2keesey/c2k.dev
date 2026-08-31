import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  throw new Error("Next standalone output is missing. Run next build first.");
}

const copies = [
  [join(root, "public"), join(standalone, "public")],
  [join(root, ".next", "static"), join(standalone, ".next", "static")],
];

for (const [source, destination] of copies) {
  if (!existsSync(source)) continue;
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
}

const serverPath = join(standalone, "server.js");
const serverSource = readFileSync(serverPath, "utf-8");
if (serverSource.includes(root)) {
  writeFileSync(serverPath, serverSource.replaceAll(root, "."));
}

console.log("Prepared .next/standalone with public/static assets and sanitized build paths.");
