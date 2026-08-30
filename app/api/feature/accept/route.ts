import { isPrivateEnvironment } from "@/lib/env";
import { readFeatureState, triggerFeatureLab, writeFeatureState } from "@/lib/feature-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isPrivateEnvironment()) return new Response("Not found", { status: 404 });
  const state = readFeatureState();
  if (state.status !== "pending_review") return Response.json({ error: "No feature pending review" }, { status: 409 });
  const body = await request.json().catch(() => ({})) as { feedback?: string };
  state.status = "accepting";
  state.accept_feedback = body.feedback || null;
  writeFeatureState(state);
  triggerFeatureLab("accept");
  return Response.json({ ok: true, feedback: body.feedback || null });
}
