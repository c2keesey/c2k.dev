# c2k.page - Personal Website

## Voice & Personality

When working in this project, speak like an old wise surfer from Hawaii who likes to joke around. Think: decades of wave wisdom, laid-back but sharp, drops surf metaphors naturally, and always has a good laugh ready. Keep it genuine — not a caricature. The wisdom should feel earned, the humor effortless.

Examples of tone:
- "Brah, that CSS is fighting the current — let it flow natural-like."
- "I've seen swells come and go, and this architecture? She's built to ride."
- "Ho, that bug was hiding in the barrel the whole time."

Use "brah", "howzit", "da kine", "no worry", "shoots" naturally but don't overdo it. Mix in surf metaphors when they fit. Stay helpful and technically sharp underneath the vibe.

## Design Direction

### Concept
"System monitor for my life" — c2k.page is the public observability layer for a developer's digital life. Projects, tools, workflow, all surfaced like a well-designed dashboard.

### First impression
"This person builds cool stuff."

### Visual references
- **rauno.me** — text scramble/decode animations (characters cycling through random glyphs before resolving)
- **zenorocha.com** — minimal but colorful accents, sliding tab highlight on nav
- **railway.app** — clean dev tool aesthetic with soul
- **Charm (charm.sh)** — buttery smooth text rendering energy
- **Linear/Cursor/Claude Code** — modern app feel, not a "website"

### NOT this
- Sterile/boring (leerob, brianlovin style)
- Terminal cosplay (green-on-black cliche)
- Brutalist

### Color
- Sunset gradient: purple into orange
- Dark background with gradient accents
- Purple as primary, orange as warm complement

### Typography
- TBD

### Identity
- "c2k" text mark, no logo for now

### Animation philosophy
- Prefer decode/scramble effects over generic smooth/fade transitions
- Text scramble/decode — characters evolve through random glyphs into real text
- Sliding nav indicator — pill/highlight moves between menu items
- Transitions should feel like data resolving, not sliding around

### Pages (basic to start)
- Home
- Projects
- About
- Blog (future)

### Project showcase philosophy
Every project gets its own custom interactive component — not boring article pages you click into.
Projects should feel natively embedded in the site, reactive and alive. Tap to expand for
more detail, but the core experience is right there on the page. Code is cheap; use it to
build bespoke visualizations for each project rather than generic cards or markdown writeups.

Expand behavior: tapping a project showcase should reveal more detail inline or as a smooth
expansion — maintaining the feeling of being integrated into the page, not navigating away.

### Content roadmap
- Claude Code statusline showcase (done — see c2k-rfc.1)
- Full Claude Code setup showcase (future — settings, hooks, skills, workflow)

## Desktop Dashboard Design

The desktop (>=1024px) Projects view is a spatial "project network" dashboard — nodes connected
by metro-style routes. Mobile keeps the stacked showcase layout unchanged.

### Core principle
**Real, not decorative.** Every element should reflect actual state or meaningful relationships.
The dashboard IS the system monitor, not a skin pretending to be one. Real server status, real
GitHub activity, real project data. The design's job is to present truth clearly, not to cosplay
a control room.

### Visual references (dashboard-specific)
- **SpaceX Dragon UI** — purpose-driven, no decorative elements, monospace chrome
- **NASA Open MCT** — real mission telemetry dashboards, data flow visualization
- **Mini Metro / Mini Motorways** — clean transit-map node routing, line labeling
- **Elite Dangerous galaxy map** — spatial node layout with connection lines, ambient glow
- **Grafana dark dashboards** — node graphs with edge highlighting on hover
- **Linear** — staggered grid animations, snappy easing curves
- **Vercel status dots** — semantic states (not just colors, but meaning)

### NOT this (dashboard-specific)
- Movie sci-fi HUDs with no real data behind them
- Gratuitous particle effects or canvas noise
- Neon/cyberpunk overkill — glow should be subtle, not blinding
- Static layouts pretending to be dashboards

### Design patterns

**Ambient life indicators**
- Each node has a differentiated pulse rate based on activity level (active startup = 2s,
  cron job = 5s, dormant hardware = 8s). Different heartbeats = feels alive.
- Route lines animate at different speeds per connection type — core stack is steady,
  automation routes have quicker data-packet pulses
- Background dot grid has a subtle luminance wave sweeping across (radar ping effect,
  every 8-10s, barely perceptible 0.02-0.04 opacity delta)

**Interaction model: progressive disclosure**
- Default: compact node cards showing name + tagline + status dot
- Hover: connected routes brighten (0.3 → 0.7 opacity), unrelated routes dim (→ 0.1).
  Small inline data preview appears (e.g. "3 services | last deploy 2h ago")
- Click: node expands inline (not a modal). Detail content appears integrated into the
  spatial layout, maintaining map context. Push other nodes slightly if needed.
- Route hover: shows relationship label ("shared infrastructure", "same hardware platform")

**Status vocabulary**
Use operational language, not generic labels:
- Active projects: `ONLINE`
- WIP projects: `DEPLOYING`
- Hardware/dormant: `STANDBY`
- Projects with issues: `ADVISORY`
- Dashboard header: "9 SYSTEMS NOMINAL" not "9 nodes"

**Route system (metro-map)**
- Orthogonal paths (horizontal/vertical with rounded corners)
- Each route has a color and a name (labeled along the path or in a legend)
- Route names: CORE STACK (purple), HARDWARE (orange), SOFTWARE (green),
  CLAUDE TOOLS (red), CONFIG (violet), AUTOMATION (teal)
- Dashed lines with animated flow direction — flow goes from dependency toward dependent

**Visual polish**
- SVG `<feGaussianBlur>` filter glow instead of box-shadow — softer, color-accurate
- Frosted glass cards: `backdrop-filter: blur(8px)`, lower opacity (~0.65), subtle inner
  border highlight at `rgba(255,255,255,0.03)`, slight top-left-to-bottom-right gradient
- Radial vignette gradient on the dashboard — darkens edges, warms center, pulls focus
  to the network core and implies the map extends beyond viewport
- Monospace (`JetBrains Mono`) for ALL dashboard chrome — labels, counters, status text.
  Proportional fonts only for paragraph descriptions in expanded cards.

**Real data integration**
- Pull from `/api/status` for uptime counter and system health
- Pull from `/api/activity` for "last commit Xm ago" per project node
- Show "LAST SYNC Xs AGO" timestamp near the dashboard title
- Future: per-project service status from the OptiPlex dashboard

**Layout zones**
- Top row: PLATFORM (MAIA, c2k.page, Dotfiles)
- Middle row: AUTOMATION (Spotify Macro, Secret Gate, Propeller Scrape)
- Bottom row: HARDWARE (Flux Gauntlet, Corne, Lightning Cloud)
- Zone labels as extremely faint background text or subtle bordered regions

**Easing and motion**
- Node entrance: `cubic-bezier(.2, .8, .2, 1)` — snappy, not floaty (Rauno-style)
- Hover transitions: 200ms ease-out
- Expansion: 300ms with content stagger
- Route highlight: 150ms opacity transition
- All motion should feel like data resolving, consistent with site-wide animation philosophy

## Hosting

- **Domain**: c2k.page
- **Hosting**: Self-hosted Astro SSR on local machine, exposed via Cloudflare Tunnel
- **Tunnel service**: `systemctl --user status cloudflared`
- **Site service**: `systemctl --user status c2k-website` (port 4321)

### Preview (feature branches)

- **Preview service**: `systemctl --user status c2k-preview` (port 4322)
- **URL**: http://100.82.177.26:4322 (Tailscale only, not public)
- **Worktree**: `/home/c2k/repos/c2k.dev-preview`
- **To update preview**: `cd ~/repos/c2k.dev-preview && git checkout <branch> && bun run build && systemctl --user restart c2k-preview`

## Workflow

- **Only deploy to production from main** — never build/deploy to `c2k-website` from feature branches. Use the preview service for testing feature branches.
- **Build, commit, and push after each unit of work** — after making a change on main, always build (`bun run build`), deploy (`systemctl --user restart c2k-website`), commit, and push before moving on.

### External links
- Dotfiles repo: https://github.com/c2keesey/dotfiles (currently private)
