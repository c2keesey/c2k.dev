import { readFeatureState, triggerFeatureLab, writeFeatureState } from "@/lib/feature-state";
import { privateJson, privateMutationError } from "@/lib/private-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestError = privateMutationError(request);
  if (requestError) return requestError;
  const state = readFeatureState();
  if (state.status !== "pending_review") return privateJson({ error: "No feature pending review" }, { status: 409 });
  const body = await request.json().catch(() => ({})) as { feedback?: string };
  state.status = "accepting";
  state.accept_feedback = body.feedback || null;
  writeFeatureState(state);
  triggerFeatureLab("accept");
  return privateJson({ ok: true, feedback: body.feedback || null });
}
