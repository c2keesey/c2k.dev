import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getActivity } from "@/app/api/activity/route";
import { GET as getStatus } from "@/app/api/status/route";
import { GET as getCurrent } from "@/app/api/feature/current/route";
import { POST as acceptFeature } from "@/app/api/feature/accept/route";
import { POST as denyFeature } from "@/app/api/feature/deny/route";
import { defaultFeatureState, readFeatureState, writeFeatureState } from "@/lib/feature-state";

const stateDirectory = mkdtempSync(join(tmpdir(), "c2k-feature-contracts-"));

beforeEach(() => {
  vi.restoreAllMocks();
  process.env.C2K_ENV = "feature";
  process.env.C2K_FEATURE_STATE_DIR = stateDirectory;
  process.env.C2K_FEATURE_LAB_SCRIPT = "/usr/bin/true";
  rmSync(join(stateDirectory, "state.json"), { force: true });
});

afterAll(() => {
  rmSync(stateDirectory, { recursive: true, force: true });
  delete process.env.C2K_FEATURE_STATE_DIR;
  delete process.env.C2K_FEATURE_LAB_SCRIPT;
});

describe("GET /api/activity", () => {
  it("retains the activity response and caching contract", async () => {
    const pushedAt = new Date().toISOString();
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/events?")) {
        const page = new URL(url).searchParams.get("page");
        return page === "1" ? Response.json([{ type: "PushEvent", repo: { name: "c2keesey/parley" }, created_at: pushedAt, payload: { head: "abc" } }]) : Response.json([]);
      }
      if (url.endsWith("/repos/c2keesey/parley")) return Response.json({ description: "Voice for coding agents", private: false });
      if (url.endsWith("/commits/abc")) return Response.json({ commit: { message: "Preserve the loop\nmore" } });
      return new Response(null, { status: 404 });
    }));
    const response = await getActivity();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("public, max-age=300");
    expect(await response.json()).toMatchObject({ repos: [{ name: "parley", url: "https://github.com/c2keesey/parley", lastCommit: "Preserve the loop" }], totalPushes: 1 });
  });

  it("excludes private event counts and repository metadata when a token can see them", async () => {
    const pushedAt = new Date().toISOString();
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/events?")) {
        const page = new URL(url).searchParams.get("page");
        return page === "1" ? Response.json([
          { type: "PushEvent", public: false, repo: { name: "c2keesey/private-control-plane" }, created_at: pushedAt, payload: { head: "private" } },
          { type: "PushEvent", public: true, repo: { name: "c2keesey/parley" }, created_at: pushedAt, payload: { head: "public" } },
        ]) : Response.json([]);
      }
      if (url.endsWith("/repos/c2keesey/parley")) return Response.json({ description: "Voice for coding agents", private: false });
      if (url.endsWith("/commits/public")) return Response.json({ commit: { message: "Public work" } });
      throw new Error(`Unexpected private metadata request: ${url}`);
    }));

    const payload = await (await getActivity()).json();
    expect(payload).toMatchObject({ repos: [{ name: "parley" }], totalPushes: 1 });
    expect(JSON.stringify(payload)).not.toContain("private-control-plane");
  });
});

describe("GET /api/status", () => {
  it("retains live health aggregation and no-cache semantics", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => String(input).endsWith("/api/health")
      ? Response.json({ cpu: { percent: 12.5 }, memory: { percent: 42 }, uptime: "3d" })
      : Response.json({ user: [{ name: "site", status: "running" }], system: [{ name: "tunnel", status: "success" }], cron: [{ name: "digest", status: "success" }] })));
    const response = await getStatus();
    expect(response.headers.get("cache-control")).toBe("no-cache");
    expect(await response.json()).toEqual({ status: "online", overall: "green", cpu: 12.5, memory: 42, uptime: "3d", services: { running: 1, total: 1 }, system: { running: 1, total: 1 }, crons: { ok: 1, error: 0, total: 1 } });
  });

  it("returns the stable offline shape when both upstreams fail", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 503 })));
    expect(await (await getStatus()).json()).toEqual({ status: "offline" });
  });

  it("marks partial or schema-drifted telemetry as advisory instead of green", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => String(input).endsWith("/api/health")
      ? Response.json({ cpu: { percent: "unknown" }, memory: {}, uptime: "3d" })
      : new Response(null, { status: 503 })));
    expect(await (await getStatus()).json()).toEqual({
      status: "online", overall: "yellow", cpu: null, memory: null, uptime: "3d",
      services: { running: 0, total: 0 }, system: { running: 0, total: 0 }, crons: { ok: 0, error: 0, total: 0 },
    });
  });
});

describe("GET /api/feature/current", () => {
  it("returns the stable default state and runtime interactivity flag", async () => {
    const response = await getCurrent();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ status: "idle", current: null, history: [], log_tail: [], interactive: true });
  });

  it.each([undefined, "production", "unexpected"])("is unobservable when C2K_ENV is %s", async (value) => {
    if (value === undefined) delete process.env.C2K_ENV;
    else process.env.C2K_ENV = value;
    const response = await getCurrent();
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});

describe("POST /api/feature/accept", () => {
  it("moves a pending proposal to accepting and echoes feedback", async () => {
    writeFeatureState({ ...structuredClone(defaultFeatureState), status: "pending_review", current: { title: "Typed shell" } });
    const response = await acceptFeature(new Request("http://localhost/api/feature/accept", { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost" }, body: JSON.stringify({ feedback: "Keep the semantic route" }) }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, feedback: "Keep the semantic route" });
    expect(readFeatureState()).toMatchObject({ status: "accepting", accept_feedback: "Keep the semantic route", current: { title: "Typed shell" } });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("is not observable in production", async () => {
    process.env.C2K_ENV = "production";
    expect((await acceptFeature(new Request("http://localhost", { method: "POST" }))).status).toBe(404);
  });

  it("rejects cross-origin private mutations", async () => {
    const response = await acceptFeature(new Request("http://localhost/api/feature/accept", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://attacker.example" }, body: "{}" }));
    expect(response.status).toBe(403);
  });
});

describe("POST /api/feature/deny", () => {
  it("moves a pending proposal to denying and records the pattern", async () => {
    writeFeatureState({ ...structuredClone(defaultFeatureState), status: "pending_review", current: { title: "Bad motion" } });
    const response = await denyFeature(new Request("http://localhost/api/feature/deny", { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost" }, body: JSON.stringify({ reason: "Too much motion" }) }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(readFeatureState()).toMatchObject({ status: "denying", deny_reason: "Too much motion", denied_patterns: ["Too much motion"] });
  });

  it("rejects form-compatible content types before changing state", async () => {
    const response = await denyFeature(new Request("http://localhost/api/feature/deny", { method: "POST", headers: { "Content-Type": "text/plain", Origin: "http://localhost" }, body: "{}" }));
    expect(response.status).toBe(415);
  });
});
