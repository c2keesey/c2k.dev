"use client";

import { useState, type ReactNode } from "react";
import type React from "react";
import type { Project } from "@/lib/projects";

export const instrumentLabels = {
  maia: "Resolve the next geospatial evidence layer",
  c2k: "Switch the public and private system boundary",
  flux: "Advance the cylindrical LED effect",
  corne: "Advance the eight-layer keymap",
  spotify: "Compare the audio-covered benchmark",
  dashboard: "Inspect the prototype data boundary",
  dotfiles: "Advance the configuration install chain",
  secretgate: "Approve the synthetic declared request",
  techdigest: "Detect the next release change",
  lightning: "Generate a procedural lightning strike",
  propeller: "Inspect the next metro availability check",
  panecmd: "Route the next artifact to the pane",
  playlistai: "Compare the next historical model family",
  djtrainer: "Reveal the next control group",
  songsorter: "Send the synthetic track to a destination",
  momentplayer: "Pause and inspect transcript context",
  alldifferent: "Reveal the visual-assumption critique",
  vibe: "Run the fixture through live reload",
  polymarket: "Advance the zero-stakes research gate",
  calsync: "Reconcile the synthetic note and calendar",
  parley: "Queue another synthetic agent reply",
  "agent-console": "Advance the redacted agent work lifecycle",
} as const;

export const instrumentIds = Object.keys(instrumentLabels);

function InstrumentFrame({ project, state, children }: { project: Project; state: string; children: ReactNode }) {
  return (
    <figure className={`project-instrument instrument-${project.slug}`} data-instrument={project.slug} data-state={state} aria-labelledby={`${project.slug}-instrument-title`}>
      <header className="instrument-header">
        <div><span>Interactive instrument</span><h2 id={`${project.slug}-instrument-title`}>{project.name} mechanism</h2></div>
        <output aria-live="polite">{state}</output>
      </header>
      {children}
      <figcaption>{project.storyBeats[1]} <span>Deterministic public-safe fixture; no live or private state.</span></figcaption>
    </figure>
  );
}

function PrincipalButton({ slug, onClick, children }: { slug: keyof typeof instrumentLabels; onClick: () => void; children?: ReactNode }) {
  return <button type="button" className="instrument-control" data-principal-control onClick={onClick} aria-label={instrumentLabels[slug]}>{children ?? instrumentLabels[slug]}</button>;
}

function Steps({ labels, active }: { labels: readonly string[]; active: number }) {
  return <ol className="instrument-steps">{labels.map((label, index) => <li key={label} data-active={index <= active || undefined}><i />{label}</li>)}</ol>;
}

export function ProjectMedia({ project }: { project: Project }) {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState(0);
  const next = (length: number) => setStep((value) => (value + 1) % length);

  if (project.slug === "maia") {
    const layers = ["Structured records", "Public imagery", "Live-web evidence"];
    return <InstrumentFrame project={project} state={`${step + 1}/3 layers resolved`}><div className="maia-stage"><div className="maia-map" aria-label="Synthetic geospatial resolution grid">{Array.from({ length: 24 }, (_, index) => <i key={index} data-resolved={index < (step + 1) * 8 || undefined} />)}<b>Inspectable result</b></div><div className="instrument-side"><Steps labels={layers} active={step} /><PrincipalButton slug="maia" onClick={() => next(layers.length)} /></div></div></InstrumentFrame>;
  }

  if (project.slug === "c2k") {
    const isPublic = step % 2 === 0;
    return <InstrumentFrame project={project} state={isPublic ? "Public readout selected" : "Private boundary selected · nothing loaded"}><div className="c2k-network"><div className="network-boundary" data-public={isPublic} data-selected={isPublic || undefined}><span>Public readout</span><b>Project atlas</b><b>Live site</b><b>Public source</b></div><div className="network-boundary private" data-selected={!isPublic || undefined}><span>{isPublic ? "Private / outside the readout" : "Private / withheld by design"}</span>{isPublic ? <><b>Host panels</b><b>Machine identity</b><b>Operator state</b></> : <><b>No host panels loaded</b><b>Machine identity withheld</b><b>Operator state unpublished</b></>}</div></div><PrincipalButton slug="c2k" onClick={() => next(2)}>{isPublic ? "Inspect private boundary" : "Return to public readout"}</PrincipalButton></InstrumentFrame>;
  }

  if (project.slug === "flux") {
    const effects = ["Blast", "Lightning", "Fire", "Casimir"];
    return <InstrumentFrame project={project} state={`${effects[step]} · ring ${choice + 1}/16`}><div className="flux-cylinder" aria-label="Sixteen-ring cylindrical LED model">{Array.from({ length: 16 }, (_, index) => <i key={index} style={{ "--ring": index } as React.CSSProperties} data-lit={Math.abs(index - choice) < 3 || undefined} />)}</div><div className="instrument-controls"><label>Active cylinder ring <input aria-label="Active cylinder ring" type="range" min="0" max="15" value={choice} onChange={(event) => setChoice(Number(event.target.value))} /></label><PrincipalButton slug="flux" onClick={() => next(effects.length)}>{`Run ${effects[(step + 1) % effects.length]} effect`}</PrincipalButton></div></InstrumentFrame>;
  }

  if (project.slug === "corne") {
    const layers = ["base", "nav", "fn", "num", "sys", "mouse", "uc", "sym"];
    return <InstrumentFrame project={project} state={`Layer ${step + 1}/8 · ${layers[step]}`}><div className="corne-board"><div className="corne-half">{Array.from({ length: 21 }, (_, index) => <kbd key={index} data-hot={index % 8 === step || undefined}>{index % 3 === 0 ? layers[step] : "·"}</kbd>)}</div><div className="corne-half">{Array.from({ length: 21 }, (_, index) => <kbd key={index} data-hot={(index + 4) % 8 === step || undefined}>{index % 4 === 0 ? layers[step] : "·"}</kbd>)}</div></div><div className="layer-strip" aria-label="Eight ZMK layers">{layers.map((layer, index) => <span key={layer} data-active={index === step || undefined}>{layer}</span>)}</div><PrincipalButton slug="corne" onClick={() => next(layers.length)} /></InstrumentFrame>;
  }

  if (project.slug === "spotify") {
    const hybrid = step % 2 === 1;
    return <InstrumentFrame project={project} state={hybrid ? "Audio-covered hybrid · folder@1 .878" : "Metadata baseline · folder@1 .800"}><div className="spotify-benchmark"><div><span>Metadata baseline</span><i style={{ "--score": "80%" } as React.CSSProperties} /><strong>.800</strong></div><div data-active={hybrid}><span>Metadata + audio-covered subset</span><i style={{ "--score": hybrid ? "87.8%" : "0%" } as React.CSSProperties} /><strong>{hybrid ? ".878" : "—"}</strong></div></div><p className="instrument-note">Scoped folder@1 benchmark, not universal classification accuracy. No tracks, playlists, or account data.</p><PrincipalButton slug="spotify" onClick={() => next(2)}>{hybrid ? "Show metadata baseline" : "Add audio-covered path"}</PrincipalButton></InstrumentFrame>;
  }

  if (project.slug === "dashboard") {
    const implemented = step % 2 === 0;
    return <InstrumentFrame project={project} state={implemented ? "Implemented backend" : "Mock client boundary"}><div className="dashboard-phone"><div><span>{implemented ? "Host metric classes" : "Prototype client panels"}</span>{(implemented ? ["CPU category", "Memory category", "System info"] : ["Synthetic sparkline", "Mock cron card", "Mock session card"]).map((item) => <b key={item}>{item}<small>{implemented ? "implemented" : "synthetic"}</small></b>)}</div></div><PrincipalButton slug="dashboard" onClick={() => next(2)}>{implemented ? "Inspect mocked client" : "Inspect implemented backend"}</PrincipalButton></InstrumentFrame>;
  }

  if (project.slug === "dotfiles") {
    const chain = ["Versioned source", "Symlink manifest", "Shell + tmux", "Agent hooks", "Repeatable machine"];
    return <InstrumentFrame project={project} state={chain[step]}><div className="dotfiles-chain"><Steps labels={chain} active={step} /><div className="fake-statusline"><span>fixture/repository</span><b>648-line statusline</b><span>jq-backed · sanitized</span></div></div><PrincipalButton slug="dotfiles" onClick={() => next(chain.length)} /></InstrumentFrame>;
  }

  if (project.slug === "secretgate") {
    const decisions = ["Pending human decision", "Allowed once", "Denied"];
    return <InstrumentFrame project={project} state={decisions[step]}><div className="gate-flow"><div><small>Declared request</small><b>privileged capability / synthetic</b></div><span>→</span><div className="gate-phone"><small>Human decision</small><b>{decisions[step]}</b></div><span>→</span><div><small>Scoped response</small><b>{step === 1 ? "continue once" : step === 2 ? "stop" : "wait"}</b></div></div><p className="instrument-warning">Cooperative approval aid—not a security boundary. Indirect and encoded bypasses are documented.</p><div className="instrument-controls"><PrincipalButton slug="secretgate" onClick={() => setStep(1)}>Approve synthetic request</PrincipalButton><button type="button" className="instrument-control secondary" onClick={() => setStep(2)}>Deny synthetic request</button></div></InstrumentFrame>;
  }

  if (project.slug === "techdigest") {
    const stages = ["Public feeds", "Version/hash change", "Claude condensation", "Compact digest"];
    return <InstrumentFrame project={project} state={stages[step]}><div className="digest-pipeline"><Steps labels={stages} active={step} /><article><small>Deterministic digest</small><h3>{step < 2 ? "No changed material yet" : "Two release notes condensed"}</h3><p>{step === 3 ? "Only verified changes enter this briefing. Remote agent control remains a separate bot." : "Advance change detection to build the briefing."}</p></article></div><PrincipalButton slug="techdigest" onClick={() => next(stages.length)} /></InstrumentFrame>;
  }

  if (project.slug === "lightning") {
    const paths = ["12,82 42,52 34,39 70,9", "18,12 49,43 43,58 78,87", "8,61 39,47 56,20 86,35"];
    return <InstrumentFrame project={project} state={`Strike ${step + 1} · four-flash sequence`}><div className="lightning-field"><svg viewBox="0 0 100 100" role="img" aria-label="Generated primary bolt and branching forks"><polyline points={paths[step]} /><polyline className="fork" points={step === 1 ? "49,43 73,48 88,62" : "42,52 61,66 79,65"} /></svg><div className="strip-geometry"><span>95</span><span>27</span><span>61</span><span>38</span></div></div><PrincipalButton slug="lightning" onClick={() => next(paths.length)} /></InstrumentFrame>;
  }

  if (project.slug === "propeller") {
    const cities = ["Los Angeles", "San Francisco", "Boulder"];
    return <InstrumentFrame project={project} state={`${cities[step]} · synthetic check`}><div className="propeller-map">{cities.map((city, index) => <button type="button" key={city} data-active={index === step || undefined} onClick={() => setStep(index)} aria-label={`Inspect ${city} synthetic availability`}>{city}<i /></button>)}</div><Steps labels={["Listing found", "Detail page checked", "State deduplicated", "One useful alert"]} active={choice} /><PrincipalButton slug="propeller" onClick={() => { setStep((value) => (value + 1) % 3); setChoice((value) => (value + 1) % 4); }} /></InstrumentFrame>;
  }

  if (project.slug === "panecmd") {
    const artifacts = [["File", "Helix"], ["Diff", "delta"], ["Log", "less"], ["Markdown", "rendered view"]] as const;
    return <InstrumentFrame project={project} state={`${artifacts[step][0]} → ${artifacts[step][1]}`}><div className="pane-router"><nav aria-label="Synthetic artifact types">{artifacts.map(([artifact], index) => <span key={artifact} data-active={index === step || undefined}>{artifact}</span>)}</nav><div className="tmux-pane"><small>one managed pane</small><b>{artifacts[step][1]}</b><code>{artifacts[step][0].toLowerCase()} fixture / no local paths</code></div></div><PrincipalButton slug="panecmd" onClick={() => next(artifacts.length)} /></InstrumentFrame>;
  }

  if (project.slug === "playlistai") {
    const models = ["Random forest", "Gradient boosting", "SVM", "Neural network"];
    return <InstrumentFrame project={project} state={`${models[step]} selected`}><div className="model-lab"><div className="feature-space">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ "--x": `${(index * 37) % 94}%`, "--y": `${(index * 53) % 88}%` } as React.CSSProperties} />)}</div><div><small>2024 shared evaluation frame</small><h3>{models[step]}</h3><p>Historical notebook comparison using legacy audio features. Aggregate score is intentionally not invented here.</p></div></div><PrincipalButton slug="playlistai" onClick={() => next(models.length)} /></InstrumentFrame>;
  }

  if (project.slug === "djtrainer") {
    const groups = ["Mixer", "Deck", "Transport", "Performance"];
    return <InstrumentFrame project={project} state={`${groups[step]} controls revealed`}><div className="dj-surface" aria-label="Original abstract DJ control taxonomy">{Array.from({ length: 20 }, (_, index) => <button type="button" aria-label={`${groups[index % 4]} control ${index + 1}`} key={index} data-active={index % 4 === step || undefined} onClick={() => setStep(index % 4)} />)}<strong>{groups[step]}</strong></div><p className="instrument-note">Original control map; no third-party controller photograph. Runtime hotspots are manually authored.</p><PrincipalButton slug="djtrainer" onClick={() => next(groups.length)} /></InstrumentFrame>;
  }

  if (project.slug === "songsorter") {
    const destinations = ["Warm textures", "Night drive", "Open focus"];
    return <InstrumentFrame project={project} state={choice ? `Moved to ${destinations[step]} · undo available` : "Synthetic current track awaiting triage"}><div className="song-triage"><article><small>Current track / fixture</small><h3>Untitled synthetic record</h3><span>genre evidence: electronic · ambient</span></article><div aria-label="Genre-similar destinations">{destinations.map((destination, index) => <button type="button" key={destination} onClick={() => { setStep(index); setChoice(1); }} data-active={choice && index === step || undefined}>{index + 1}<b>{destination}</b><small>genre-similar destination</small></button>)}</div></div><div className="instrument-controls"><PrincipalButton slug="songsorter" onClick={() => { setStep((value) => (value + 1) % destinations.length); setChoice(1); }}>Send synthetic track</PrincipalButton><button type="button" className="instrument-control secondary" disabled={!choice} onClick={() => setChoice(0)}>Undo last destination</button></div></InstrumentFrame>;
  }

  if (project.slug === "momentplayer") {
    const paused = step % 2 === 1;
    return <InstrumentFrame project={project} state={paused ? "Paused · nearby transcript selected" : "Synthetic playback running"}><div className="moment-wave">{Array.from({ length: 40 }, (_, index) => <i key={index} style={{ "--height": `${14 + (index * 17) % 70}%` } as React.CSSProperties} data-context={paused && index > 17 && index < 27 || undefined} />)}</div><blockquote>{paused ? "“…the nearby context resolves the unfamiliar term…”" : "Pause at a confusing moment to capture only nearby context."}</blockquote><PrincipalButton slug="momentplayer" onClick={() => next(2)}>{paused ? "Resume synthetic playback" : "Pause and ask with context"}</PrincipalButton></InstrumentFrame>;
  }

  if (project.slug === "alldifferent") {
    const revealed = step % 2 === 1;
    return <InstrumentFrame project={project} state={revealed ? "Assumption revealed as unknowable" : "Confidence before evidence"}><div className="assumption-game"><div className="abstract-portrait" aria-label="Abstract silhouette, not a real portrait"><i /><i /><i /></div><div><label>How confident is the visual assumption? <input aria-label="Visual assumption confidence" type="range" min="0" max="100" value={choice} onChange={(event) => setChoice(Number(event.target.value))} /></label><strong>{revealed ? "Appearance cannot establish nationality." : `${choice}% claimed confidence`}</strong><p>This historical experiment is framed as a critique of bias, not a physiognomic skill.</p></div></div><PrincipalButton slug="alldifferent" onClick={() => next(2)} /></InstrumentFrame>;
  }

  if (project.slug === "vibe") {
    const stages = ["Fixture request", "Agent edit", "Filesystem event", "Vite HMR", "Rendered change"];
    return <InstrumentFrame project={project} state={stages[step]}><div className="vibe-loop"><div className="fixture-chat">“Make the synthetic accent warmer.”</div><Steps labels={stages} active={step} /><div className="browser-preview" style={{ "--warmth": `${step * 22}%` } as React.CSSProperties}>preview</div></div><PrincipalButton slug="vibe" onClick={() => next(stages.length)} /></InstrumentFrame>;
  }

  if (project.slug === "polymarket") {
    const gates = ["Hypotheses proposed", "Historical replication", "Cost sensitivity", "Scoped survivor", "Zero-stakes forward monitor"];
    return <InstrumentFrame project={project} state={gates[step]}><div className="research-funnel">{[5, 3, 2, 1, 1].map((count, index) => <div key={gates[index]} data-active={index <= step || undefined} style={{ width: `${100 - index * 14}%` }}><span>{gates[index]}</span><b>{count}</b></div>)}</div><p className="instrument-warning">Research visualization only. No wallet, real capital, live positions, profit claim, or financial advice.</p><PrincipalButton slug="polymarket" onClick={() => next(gates.length)} /></InstrumentFrame>;
  }

  if (project.slug === "calsync") {
    const stages = ["Parse synthetic note", "Resolve persisted calendar ID", "Diff managed event metadata", "Write both directions"];
    return <InstrumentFrame project={project} state={stages[step]}><div className="cal-sync"><article><small>Shared note / fixture</small><p>Tuesday · Focus block · 10:00</p></article><div className="sync-arrows"><span>→</span><span>←</span></div><article><small>Calendar / fixture</small><p>Focus block · managed</p></article></div><Steps labels={stages} active={step} /><PrincipalButton slug="calsync" onClick={() => next(stages.length)} /></InstrumentFrame>;
  }

  if (project.slug === "parley") {
    const sessions = ["Agent A", "Agent B", "Agent C"];
    return <InstrumentFrame project={project} state={`${choice + 1} synthetic replies queued`}><div className="parley-queue"><div>{sessions.map((session, index) => <span key={session} data-speaking={index === step || undefined}>{session}<i /></span>)}</div><div className="voice-wave">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ "--height": `${20 + ((index + choice) * 29) % 75}%` } as React.CSSProperties} />)}</div><b>One serialized audio queue</b></div><PrincipalButton slug="parley" onClick={() => { setStep((value) => (value + 1) % sessions.length); setChoice((value) => value + 1); }} /></InstrumentFrame>;
  }

  if (project.slug === "agent-console") {
    const stages = ["Human intent", "Automation admission", "Isolated worker", "PR / CI", "Exact-revision deploy"];
    return <InstrumentFrame project={project} state={`${stages[step]} · representative state`}><div className="agent-console-stage"><div className="console-phone"><div className="console-phone-bar"><i />Agent Console <span>Private</span></div><div className="console-message human"><small>Human / fixture</small>Advance approved portfolio work.</div><div className="console-event"><i />{stages[step]}</div><div className="console-message agent"><small>Redacted event</small>{step < 2 ? "Bounded work is being admitted." : step < 4 ? "Isolated change is being verified." : "Candidate revision reached its final gate."}</div><div className="console-input">No service connected</div></div><Steps labels={stages} active={step} /></div><p className="instrument-warning">Representative local demo. No live service, private history, host data, prompts, paths, identifiers, or authenticated endpoint is loaded.</p><PrincipalButton slug="agent-console" onClick={() => next(stages.length)} /></InstrumentFrame>;
  }

  throw new Error(`Missing project instrument: ${project.slug}`);
}
