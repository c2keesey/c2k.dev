# Design direction — Chris's inspiration and ideas

**This doc belongs to Chris.** Only Chris adds direction here. Agents may record what he says, in his words, dated, but never add their own ideas, tighten his wording, or turn an idea into a decision. An idea here is open until he says otherwise.

How it relates to the rest:
- `docs/design-system.md` is the system agents build and maintain (tokens, components, patterns). It should follow this doc, not the other way round.
- `CLAUDE.md` holds working rules for agents in this repo.

---

## Ideas

### Ocean cycles (2026-11-26)
> "theming the page around the cycles of the ocean. so everything is cyclical or periodic. think tides, waves, seasons, rotations, etc."

Status: open idea. Not yet decided how or whether it shapes the rebuild.

---

## Earlier direction (from previous work, carried over from CLAUDE.md)

### Concept
"System monitor for my life": c2k.page is the public observability layer for a developer's digital life. Projects, tools, workflow, all surfaced like a well-designed dashboard.

First impression: "This person builds cool stuff."

### Visual references
- **rauno.me**: text scramble/decode animations (characters cycling through random glyphs before resolving)
- **zenorocha.com**: minimal but colorful accents, sliding tab highlight on nav
- **railway.app**: clean dev tool aesthetic with soul
- **Charm (charm.sh)**: buttery smooth text rendering energy
- **Linear/Cursor/Claude Code**: modern app feel, not a "website"

Dashboard-specific:
- **SpaceX Dragon UI**: purpose-driven, no decorative elements, monospace chrome
- **NASA Open MCT**: real mission telemetry dashboards, data flow visualization
- **Mini Metro / Mini Motorways**: clean transit-map node routing, line labeling
- **Elite Dangerous galaxy map**: spatial node layout with connection lines, ambient glow
- **Grafana dark dashboards**: node graphs with edge highlighting on hover
- **Linear**: staggered grid animations, snappy easing curves
- **Vercel status dots**: semantic states (not just colors, but meaning)

### Not this
- Sterile/boring (leerob, brianlovin style)
- Terminal cosplay (green-on-black cliché)
- Brutalist
- Movie sci-fi HUDs with no real data behind them
- Gratuitous particle effects or canvas noise
- Neon/cyberpunk overkill: glow should be subtle, not blinding
- Static layouts pretending to be dashboards
- "Stale and too AI-y" (2026-11-26, about the home page)

### Color
Sunset gradient: purple into orange. Dark background with gradient accents. Purple primary, orange warm complement.

### Motion
Prefer decode/scramble over generic fades. Transitions should feel like data resolving, not sliding around.

### Projects
Every project gets its own custom interactive component, not a boring article page. Projects feel natively embedded, reactive and alive; expanding stays inline, not navigating away.

"Real, not decorative": every element reflects actual state or meaningful relationships.
