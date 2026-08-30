# c2k.dev project-truth audit

Audited 2026-08-30 for `c2-wisp-0eo.1`. This is a migration handoff, not a UI implementation. The canonical, machine-readable companion is [`project-truth.json`](./project-truth.json); it intentionally contains facts and content guidance rather than React, Astro, route, or component shapes.

## Canonical scope

- Preserve all **21 existing desktop projects**.
- The current mobile inventory contains **19 projects**. Its only omissions are **Pane Skill** (`panecmd`) and **Playlist AI** (`playlistai`); both must be restored in the migration.
- The current seven bespoke state-3 showcases are MAIA, c2k.page, Dotfiles, Spotify Macro, Flux Gauntlet, Corne, and Lightning Cloud.
- Add **Agent Console** as a new **22nd** desktop, mobile, and rich-page target. It does not replace an existing project.
- `morning-digest` exists as an unreachable `MiniProjectCard` inside hidden showcase source, but it is not a desktop or mobile project node. It is not one of the 21 and is outside this 22-project migration inventory.

The live/source inventory therefore resolves as follows:

| Surface | Existing count | Migration count | Required correction |
|---|---:|---:|---|
| Desktop | 21 | 22 | Add Agent Console |
| Mobile | 19 | 22 | Add Pane Skill, Playlist AI, and Agent Console |
| Bespoke/rich | 7 | 22 | Preserve seven and create truthful rich treatments for the other 15 |

## Migration P0s

1. **Broken media:** every `/projects` load requests `/flux-gauntlet.gif`, `/corne.gif`, and `/lightning-cloud.gif`. All three return 404, producing three console errors on desktop and mobile. Source accurate, creator-owned assets or remove those requests. An `onerror` that hides the container does not make the request acceptable.
2. **Agent Console privacy:** never publish or link its live private service. Do not place real service URLs, private GitHub links, tokens, prompts, history, local paths, host or tailnet identifiers, session IDs, or real operational state in public assets. Use deterministic redacted fixtures only.
3. **Inventory preservation:** Agent Console is target 22. It cannot displace any of the current 21; Pane Skill and Playlist AI cannot disappear on mobile.

Manager Playwright evidence also establishes that MAIA's state 1 → 2 → 3 interaction and Escape exit work without horizontal overflow. Preserve that behavior as a verified baseline; it is not a defect to redesign around.

## Status and link rules

The existing `ONLINE`, `DEPLOYING`, and `STANDBY` values are editorial constants, not observed health. They currently make prototypes, private repositories, cron jobs, and completed hardware look like equally monitored services. The migration should store and render lifecycle separately from health:

- `live-public`: a publicly reachable product or site.
- `active-private`: active work or personal infrastructure without a public product URL.
- `maintained`: a current tool, automation, or open-source project whose live runtime health is not being asserted.
- `prototype`: implemented exploration that must not read as shipped production.
- `historical`: an intentionally preserved earlier experiment.
- `completed-artifact`: finished hardware whose current network health is irrelevant.
- `research-monitoring`: evidence gathering or zero-stakes forward observation, not production trading.

Only show operational health when a real probe and observation timestamp exist. Do not compute “systems nominal” from lifecycle labels.

Public-link actions:

- Correct MAIA to `https://www.maia-analytics.com/`.
- Correct Corne to `https://github.com/c2keesey/zmk-config-corne-2`.
- Prefer the live All Look Different page, `https://c2keesey.github.io/All-look-different/`, with its public repository as a secondary source link.
- Remove public links for Spotify Macro and Dotfiles; both repositories are private and the current GitHub links return 404 to unauthenticated visitors.
- Do not add links for OptiPlex Dashboard, DJ Trainer, Moment Player, Vibe Framework, Polymarket Bot, Cal Sync, or Agent Console. Their truth can be told without exposing private infrastructure or repositories.
- The remaining public GitHub URLs in `project-truth.json` were verified as reachable during the audit.

## Per-project canonical matrix

The “confidence” value reflects the evidence for the status and facts, not an aesthetic judgment.

| # | ID | Project | Canonical lifecycle | Confidence | Required truth correction |
|---:|---|---|---|---|---|
| 1 | `maia` | MAIA | active-private | high | Use the broader geospatial research-engine positioning; do not claim “Founder” or core DuckDB without confirmation. |
| 2 | `c2k` | c2k.page | live-public | high | Only seven of 21 have bespoke showcases; remove the universal component claim and unsupported `v3.2`. |
| 3 | `flux` | Flux Gauntlet | completed-artifact | high | 300 LEDs/16 rings is verified; the named seven effects are examples, not the total; fix/remove the missing GIF. |
| 4 | `corne` | Corne | maintained | high | ZMK, not QMK; eight layers, not seven; use the current `zmk-config-corne-2` repository; fix/remove the missing GIF. |
| 5 | `spotify` | Spotify Macro | active-private | high | Scope `.800 → .878` to metadata baseline vs audio-covered hybrid folder@1; remove the private-repo link. |
| 6 | `dashboard` | OptiPlex Dashboard | prototype | high | Source is Express + Expo/React Native with mock client data, not Next.js/shadcn/SQLite or a live monitoring PWA. |
| 7 | `dotfiles` | Dotfiles | active-private | high | Remove private-repo link; current statusline is 648 lines and uses `jq`; the nine-skill visual is stale. |
| 8 | `secretgate` | Secret Gate | prototype | high | Call it a cooperative approval workflow, never a security boundary; its own research documents bypasses. |
| 9 | `techdigest` | Tech Digest | maintained | high | Current copy is substantially accurate; distinguish digest generation from the separate remote-control bot. |
| 10 | `lightning` | Lightning Cloud | completed-artifact | high | Four strips total 221 pixels; Arduino/FastLED is verified, ESP32 is not; fix/remove the missing GIF. |
| 11 | `propeller` | Propeller Scrape | maintained | medium | Implementation and scheduling are verified, but live cron health was not probed; avoid `ONLINE`. |
| 12 | `panecmd` | Pane Skill | maintained | medium | Restore on mobile; do not imply it remains a current dotfiles skill when the standalone/plugin sources are canonical. |
| 13 | `playlistai` | Playlist AI | historical | high | Restore on mobile and frame it as the 2024 notebook predecessor to Spotify Macro. |
| 14 | `djtrainer` | DJ Trainer | prototype | high | Runtime hotspots are manual vanilla HTML/CSS/JS; SAM/CoreML are separate authoring experiments, not on-device runtime. |
| 15 | `songsorter` | Song Sorter | prototype | high | It triages current tracks into genre-similar playlists; there is no pairwise ranking loop. |
| 16 | `momentplayer` | Moment Player | prototype | low | No remote and only uncommitted local implementation; use exploratory, not shipped-product language. |
| 17 | `alldifferent` | All Look Different | live-public | high | Explicitly critique visual identity inference and verify portrait rights; do not present physiognomic guessing as a skill. |
| 18 | `vibe` | Vibe Framework | active-private | high | It is a functional private Astro/SSE/agent-harness prototype; `DEPLOYING` is not evidenced health. |
| 19 | `polymarket` | Polymarket Bot | research-monitoring | high | One scoped signal survived historical tests, but current documents require zero-stakes forward monitoring before any capital. |
| 20 | `calsync` | Cal Sync | active-private | medium | Calendar identity is persisted by ID; private extended metadata marks managed events. Live health was not probed. |
| 21 | `parley` | Parley | maintained | high | Current v0.5.4 supports Claude Code and Codex on macOS; preserve the global serialized queue and local trigger story. |
| 22 | `agent-console` | Agent Console | active-private | high | New additive target; use current private-remote truth and a completely redacted public story with no live/private link. |

## Rich-page story and imagery map

Each story should move from a real constraint through an implemented mechanism to an honest result. “Safe imagery” means first-party, generated from verified code/data, or clearly licensed; it does not mean a third-party screenshot happened to be available.

| Project | Recommended story arc | Safe imagery/source | Do not use |
|---|---|---|---|
| MAIA | Physical-world question → heterogeneous evidence → agent orchestration → inspectable geospatial result | Existing logo, official marketing media, redacted product capture with synthetic/public data | Customer/property data or unredacted internal state |
| c2k.page | Public readout → meaningful project graph → self-host/tunnel boundary → truth-first migration | Current site captures, first-party icons, code-native network | Private host panels, fake telemetry, tailnet details |
| Flux Gauntlet | Strip → 16-ring cylinder coordinates → finger input/effects → wearable artifact | Creator-owned photo/loop or existing cylinder simulation | Missing GIF or unverified third-party footage |
| Corne | 42-key constraint → eight-layer resolution → combos/home-row mods → daily-driver evolution | `draw/keymap.png`, `draw/base.svg`, creator-owned photo | Missing GIF, QMK/KiCad visuals |
| Spotify Macro | API-independent cache → provenance → scoped benchmark → safe reconciliation | Abstract flow, anonymized taxonomy, repository-derived benchmark plot | Album art, playlist names/IDs, private link |
| OptiPlex Dashboard | Intended mobile hierarchy → implemented backend → mocked client boundary → future monitoring direction | Labeled prototype screen, synthetic telemetry, code-derived diagram | Real host state or production claims |
| Dotfiles | Source repo → symlink manifest → current statusline/hooks → capability graduation | Sanitized terminal capture and fake statusline data | Home paths, machine names, tokens |
| Secret Gate | Declared privileged intent → phone decision → scoped response → honest bypass boundary | Synthetic request/decision flow and threat-boundary diagram | Real secrets/chat IDs or enforcement claims |
| Tech Digest | Noisy release feeds → change detection → Claude condensation → compact delivery | Deterministic fake digest and pipeline diagram | Bot tokens or personal chat history |
| Lightning Cloud | Four-strip geometry → generated bolt/forks → four flashes/fade → physical lamp | Existing canvas, creator-owned video, geometry diagram | Missing GIF or unverified board imagery |
| Propeller Scrape | Three-city listings → detail-page availability → dedupe → one useful alert | Synthetic listing/alert and simple map | Event art or Propeller branding without permission |
| Pane Skill | Chat overload → artifact routing → content-specific viewer → one stable pane | Sanitized fixture-based tmux capture | Private diffs, paths, logs, or tokens |
| Playlist AI | Legacy audio features → four-model comparison → measured failure/success → later-system bridge | Anonymized notebook/model charts | Track IDs, personal playlist names, album art |
| DJ Trainer | Dense control surface → discoverable hotspots → manual authoring → separate ML experiments | Original SVG or creator-owned/licensed controller photo | Current third-party image without rights clearance |
| Song Sorter | Current track → ranked destinations → keyboard action → undo/history | Placeholder tracks and original UI rendering | Copyrighted album covers or personal playlists |
| Moment Player | Pause at confusion → nearby transcript → contextual answer → resume | Synthetic waveform/transcript and fake episode UI | Copyrighted podcast audio/artwork |
| All Look Different | Ethical premise → confidence/error → architecture → critique of assumptions | Synthetic/licensed/consented portraits or abstract silhouettes | Unverified face corpus or celebratory inference framing |
| Vibe Framework | In-app request → streamed agent work → code change → HMR reveal | Deterministic fixture conversation and path-free demo | Private prompts, host paths, tailnet URLs |
| Polymarket Bot | Hypothesis set → replication failures → one scoped survivor → zero-stakes forward gate | Public-data calibration/backtest plots labeled as simulation | Profit promises, wallet/account data, financial-advice framing |
| Cal Sync | Shared-note habit → parsed intent → ID/metadata reconciliation → two-way result | Fabricated note/calendar and reconciliation diagram | Household schedule, OAuth state, calendar IDs |
| Parley | Useful narration → local wake/dictation → multi-session queue → privacy/provider fallback | Repository-owned diagrams, synthetic waveform, sanitized tmux | Captured speech or private transcripts |
| Agent Console | Human Conductor → Automation Conductor/resource admission → isolated worker/worktree → PR/CI → exact-SHA deploy | Deterministic redacted mock, fabricated metrics, abstract lifecycle diagram | Live service/private repo links, real screenshots/state, identifiers, paths, tokens, prompts/history |

## Evidence and conflict policy

The audit used the checked-out site source for desktop/mobile/showcase inventory, relevant base repositories under `/Users/c2k/repos` and `/Users/c2k/Projects`, and GitHub default-branch metadata/content where the local checkout was absent or stale. Private repository visibility was treated as a public-link prohibition, not as evidence that a project does not exist.

Important source qualifications:

- Agent Console's local checkout trails its private GitHub default branch; current remote README/metadata and `c2-7rayg` govern the public-safe facts.
- Moment Player has no remote and its implementation is untracked local work, hence low confidence and prototype-only wording.
- Lightning Cloud has no relevant local checkout; its small public GitHub history is the authoritative source.
- Corne's active local remote is `zmk-config-corne-2`; the older linked repository is not the current configuration.
- MAIA's repository README and current marketing position differ in scope; the public product positioning governs the headline, while the repository governs technology claims.
- Parley was inspected only through `/Users/c2k/repos/parley` and public repository truth. The existing Parley worktree was not accessed or modified.
- Tracker history writes are globally broken because the Beads database is missing its `events` table. This audit used the manager-approved `bd ... --no-history` workaround and made no destructive database repair.

## Migration acceptance gates

1. The rendered/project data inventory contains 22 unique IDs, preserving the exact 21 existing IDs and adding only `agent-console`.
2. Desktop and mobile both contain all 22 targets; Pane Skill and Playlist AI are no longer mobile omissions.
3. Every project uses the canonical lifecycle, technologies, links, and conflict corrections in `project-truth.json`.
4. No status is presented as observed health without a real probe and timestamp.
5. The three missing GIF requests are removed or replaced with creator-owned, accurate assets and `/projects` loads without their console errors.
6. Agent Console has no public service/private repository link and no real private state in copy, HTML, data, source maps, screenshots, alt text, or fixtures.
7. MAIA retains the verified state 1 → 2 → 3 and Escape interaction with no horizontal overflow.
8. Rich pages use the recommended beats and safe-source rules, with special editorial review for Secret Gate security language, All Look Different ethics/rights, Polymarket financial framing, and DJ Trainer image rights.
9. `project-truth.json` validates as JSON, contains 22 unique projects, reports 21/19 current desktop/mobile counts, and contains no duplicate or unexpected migration IDs.
