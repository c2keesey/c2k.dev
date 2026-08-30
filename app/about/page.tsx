import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { isPrivateEnvironment } from "@/lib/env";

export const metadata: Metadata = { title: "About", robots: { index: false, follow: false } };

export default function AboutPage() {
  if (!isPrivateEnvironment()) notFound();
  const facts = [
    ["role", "CTO · context engineer"], ["company", "MAIA Analytics"], ["location", "Outer Sunset, SF"],
    ["editor", "Claude Code + Codex"], ["terminal", "Ghostty + tmux"], ["keyboard", "Corne 42-key split"],
    ["host", "OptiPlex micro · Ubuntu"], ["network", "Tailscale + Cloudflare Tunnel"],
  ];
  return (
    <div className="page-shell about-page">
      <header className="page-heading"><div><span className="eyebrow">Private surface / operator profile</span><h1>Christopher Keesey</h1><p>CTO, context engineer, systems builder. I like infrastructure that disappears and hardware that absolutely does not.</p></div></header>
      <div className="about-layout">
        <Card className="about-facts">{facts.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</Card>
        <div className="about-copy"><p>At MAIA Analytics, the pitch is that you ask a question about a property and get a map back. The reality is LLM orchestration and data pipelines that have to be right, because a map that is confidently wrong is worse than no map.</p><p>Outside of that I solder things that do not need to exist: a 300-LED gauntlet, a cloud that generates its own lightning, a keyboard with 42 keys. Most of my week is coding agents in a terminal. The rest is Ocean Beach, backcountry when there is snow, and more time mixing drum and bass than I would defend in public.</p><p>All of this runs on a used OptiPlex micro under my desk, this site included. The telemetry bar is real. If it goes red, something in my apartment is actually broken.</p></div>
      </div>
    </div>
  );
}
