import { existsSync, readFileSync } from "node:fs";
import { featureStateAgeMs, readFeatureState, triggerFeatureLab, writeFeatureState } from "@/lib/feature-state";
import { isPrivateEnvironment } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isPrivateEnvironment()) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "private, no-store" } });
  }

  const state = readFeatureState();
  if (["accepting", "denying", "proposing"].includes(state.status) && (featureStateAgeMs() ?? 0) > 10 * 60 * 1000) {
    if (state.current) state.history.push({ ...state.current, outcome: "error", feedback: `timeout: stuck in ${state.status}`, resolved_at: new Date().toISOString() });
    state.status = "idle";
    state.current = null;
    writeFeatureState(state);
    triggerFeatureLab("propose");
  }

  let logTail: string[] = [];
  if (state.status === "proposing" && state.log_file && existsSync(state.log_file)) {
    try { logTail = readFileSync(state.log_file, "utf-8").split("\n").filter((line) => line.trim()).slice(-8); } catch { /* best effort */ }
  }

  return Response.json({ status: state.status, current: state.current, history: state.history ?? [], log_tail: logTail, interactive: true }, { headers: { "Cache-Control": "private, no-store" } });
}
