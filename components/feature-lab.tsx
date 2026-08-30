"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, FlaskConical, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Proposal {
  title?: string;
  description?: string;
  source?: string;
  proposed_at?: string;
  files_changed?: string[];
  outcome?: string;
}

interface LabPayload {
  status: "idle" | "proposing" | "pending_review" | "accepting" | "denying";
  current: Proposal | null;
  history: Proposal[];
  log_tail: string[];
  interactive: boolean;
}

const labels: Record<LabPayload["status"], string> = {
  idle: "Idle",
  proposing: "Proposing",
  pending_review: "Ready for review",
  accepting: "Accepting",
  denying: "Denying",
};

export function FeatureLab() {
  const [data, setData] = useState<LabPayload | null>(null);
  const [action, setAction] = useState<"accept" | "deny" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    try {
      const response = await fetch("/api/feature/current", { cache: "no-store" });
      if (!response.ok) throw new Error("Feature Lab is unavailable");
      setData(await response.json() as LabPayload);
      setError(null);
    } catch {
      setError("Feature Lab signal lost. Retrying…");
    }
  }, []);

  useEffect(() => {
    const immediate = window.setTimeout(() => void poll(), 0);
    const timer = window.setInterval(poll, 5_000);
    return () => { window.clearTimeout(immediate); window.clearInterval(timer); };
  }, [poll]);

  async function submit() {
    if (!action) return;
    setSubmitting(true);
    setError(null);
    const body = action === "accept" ? { feedback: feedback.trim() || undefined } : { reason: feedback.trim() || undefined };
    try {
      const response = await fetch(`/api/feature/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Request failed" })) as { error?: string };
        throw new Error(payload.error || "Request failed");
      }
      setAction(null);
      setFeedback("");
      await poll();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="lab-stack">
      <header className="page-heading lab-heading">
        <div>
          <span className="eyebrow">Private surface / runtime gated</span>
          <h1>Feature Lab</h1>
          <p>Review the next autonomous change before it becomes part of the site.</p>
        </div>
        <Badge variant="outline" className="lab-status"><i data-status={data?.status ?? "loading"} />{data ? labels[data.status] : "Connecting"}</Badge>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      {!data || data.status === "proposing" || data.status === "accepting" || data.status === "denying" ? (
        <Card className="lab-state-card">
          <LoaderCircle className="lab-spinner" aria-hidden="true" />
          <h2>{data?.status === "proposing" ? "Building a proposal" : data?.status === "accepting" ? "Accepting the change" : data?.status === "denying" ? "Removing the change" : "Connecting to Feature Lab"}</h2>
          <p>This surface refreshes automatically. You can safely leave and return.</p>
          {!!data?.log_tail.length && <pre aria-label="Proposal progress">{data.log_tail.join("\n")}</pre>}
        </Card>
      ) : data.status === "idle" ? (
        <Card className="lab-state-card">
          <FlaskConical aria-hidden="true" />
          <h2>No proposal pending</h2>
          <p>A new feature will appear here when one is ready for review.</p>
        </Card>
      ) : (
        <Card className="lab-review-card">
          <CardHeader>
            <div className="lab-review-meta"><Badge>{data.current?.source || "proposal"}</Badge><time>{data.current?.proposed_at ? new Date(data.current.proposed_at).toLocaleString() : "Just now"}</time></div>
            <CardTitle>{data.current?.title || "Untitled proposal"}</CardTitle>
            <p>{data.current?.description}</p>
          </CardHeader>
          <CardContent>
            {!!data.current?.files_changed?.length && (
              <div className="changed-files" aria-label="Files changed">
                {data.current.files_changed.map((file) => <code key={file}>{file}</code>)}
              </div>
            )}
            {data.interactive && !action && (
              <div className="lab-actions">
                <Button onClick={() => setAction("accept")}><Check aria-hidden="true" size={17} />Keep</Button>
                <Button variant="destructive" onClick={() => setAction("deny")}><X aria-hidden="true" size={17} />Remove</Button>
              </div>
            )}
            {data.interactive && action && (
              <div className="feedback-form">
                <label htmlFor="feature-feedback">{action === "accept" ? "Optional improvements" : "Reason for removal"}</label>
                <textarea id="feature-feedback" value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={4} autoFocus />
                <div>
                  <Button variant="ghost" onClick={() => { setAction(null); setFeedback(""); }} disabled={submitting}>Cancel</Button>
                  <Button variant={action === "deny" ? "destructive" : "default"} onClick={submit} disabled={submitting}>{submitting ? "Sending…" : "Submit decision"}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <section className="lab-history" aria-labelledby="history-title">
        <h2 id="history-title">Recent decisions</h2>
        {data?.history?.length ? (
          <ol>{data.history.slice().reverse().slice(0, 10).map((item, index) => <li key={`${item.title}-${index}`}><i data-outcome={item.outcome} /><span>{item.title || "Untitled"}</span><small>{item.outcome || "resolved"}</small></li>)}</ol>
        ) : <p>No proposals yet.</p>}
      </section>
    </div>
  );
}
