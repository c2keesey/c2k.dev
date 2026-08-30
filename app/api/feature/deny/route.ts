import { isPrivateEnvironment } from "@/lib/env";
import { readFeatureState, triggerFeatureLab, writeFeatureState } from "@/lib/feature-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isPrivateEnvironment()) return new Response("Not found", { status: 404 });
  const state = readFeatureState();
  if (state.status !== "pending_review") return Response.json({ error: "No feature pending review" }, { status: 409 });
  const body = await request.json().catch(() => ({})) as { reason?: string };
  if (body.reason) state.denied_patterns.push(body.reason);
  state.status = "denying";
  state.deny_reason = body.reason || null;
  writeFeatureState(state);
  triggerFeatureLab("deny");
  return Response.json({ ok: true });
}
