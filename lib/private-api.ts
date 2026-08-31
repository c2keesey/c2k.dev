import { isPrivateEnvironment } from "@/lib/env";

const privateHeaders = { "Cache-Control": "private, no-store" };

export function privateMutationError(request: Request): Response | null {
  if (!isPrivateEnvironment()) return new Response("Not found", { status: 404, headers: privateHeaders });

  const origin = request.headers.get("Origin");
  const requestUrl = new URL(request.url);
  const host = request.headers.get("X-Forwarded-Host")?.split(",")[0]?.trim() || request.headers.get("Host") || requestUrl.host;
  const protocol = request.headers.get("X-Forwarded-Proto")?.split(",")[0]?.trim() || requestUrl.protocol.slice(0, -1);
  if (!origin || origin !== `${protocol}://${host}`) {
    return Response.json({ error: "Same-origin request required" }, { status: 403, headers: privateHeaders });
  }

  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Application JSON required" }, { status: 415, headers: privateHeaders });
  }

  return null;
}

export function privateJson(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", privateHeaders["Cache-Control"]);
  return Response.json(data, { ...init, headers });
}
