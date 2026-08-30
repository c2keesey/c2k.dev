# Art direction and design-system brief

## North star: the Signal Atlas

c2k.dev should feel like a calm, authored atlas of a working technical life: part personal essay, part observability surface, part cabinet of interactive instruments.

The visual story is **signals resolving at civil twilight**. Dark mode is graphite night with precise violet, cyan, and ember signals. Warm mode is Outer Sunset morning: mineral paper, espresso ink, and sunlit accents. The UI should feel operational without imitating a terminal and expressive without becoming sci-fi decoration.

The first impression remains: **this person builds cool systems, understands how they connect, and can explain them clearly.**

## Product principles

1. **Story before telemetry.** Start with authorship and a thesis; use live data as proof.
2. **Truth before theater.** Every status, relationship, counter, and image must have a source and an honest unavailable state.
3. **Calm overview, rich depth.** Default views are scannable. Motion and detail arrive in response to intent.
4. **One system, bespoke instruments.** Shared shells, typography, tokens, focus behavior, and responsive rules surround custom project experiences.
5. **Accessibility is interaction architecture.** Semantics and keyboard behavior are designed with the state machine, not patched onto it.
6. **Breakpoints change composition, not content.** Desktop and mobile consume the same records and expose the same projects.

## What “shadcn-based” means here

Use shadcn/ui and Radix for proven behavior, composability, and accessibility. Do not accept their default visual output as the art direction.

Recommended foundations:

- `Button`, `Toggle`, `Badge`, `Separator`, `Tooltip`, and `Skeleton` for atomic behavior;
- `Collapsible` for inline project state 2;
- `Dialog` on desktop and `Drawer` on mobile for project state 3;
- `NavigationMenu` only where its semantics fit; ordinary route links are preferred for Home/Projects;
- `ScrollArea` for bounded immersive content, never for the primary document without a strong reason;
- `Tabs` or `ToggleGroup` for showcase modes such as Corne layers and Flux effects;
- `Sheet` for filters/legend on narrow layouts;
- `Sonner` only for explicit user feedback, not telemetry noise.

Create custom wrappers with stable APIs and CVA variants. A component should not accumulate page-specific Tailwind strings to impersonate a design system.

## Information architecture

### Routes

Home and Projects should be real route-owned pages. Direct navigation, refresh, back/forward, and clean development must work without a prebuilt file. Route transitions may animate content, but inactive pages should not remain keyboard-reachable beside the current page.

### Home

Desktop composition:

- a strong authored introduction occupying the upper 40% of the frame;
- one sentence that explains the practice, not a stack of role labels;
- a focused “current signal” row: current work, system state, and one featured proof;
- one large showcase or live instrument, not several equal-weight widgets;
- a clear route into the full atlas.

Mobile composition:

- name, thesis, and primary links before any telemetry;
- a compact current-signal strip;
- featured project proof;
- bottom navigation that never covers focused or scrolled content.

### Projects

Preserve the spatial relationship map, but stop asking it to be the only index.

Desktop should be a synchronized **atlas + index**:

- the atlas shows featured anchors and relationships for the current filter;
- an accessible roster provides every project in a predictable scan order;
- domain filters such as Product, Agent Tools, Automation, Hardware, and Experiments reduce visual density;
- selecting either a node or roster row selects the same project and reveals the same details;
- relationship labels appear with selection and keyboard focus, not hover alone.

Mobile should be a single sequential index with optional relationship chips. Do not draw long route lines behind every card unless a selected project makes them useful.

The project-truth workstream owns the final categories, status, copy, media, and links. This system defines only how authoritative records are presented.

## Core interaction model

Use one explicit state machine across breakpoints:

| State | User intent | Presentation | Required semantics |
|---|---|---|---|
| Overview | Scan | Compact project trigger | Button with accessible name and `aria-expanded=false` |
| Detail | Learn | Inline `Collapsible` region | `aria-expanded=true`, labeled region, explicit “Explore” action if available |
| Immersive | Interact | Desktop `Dialog`; mobile `Drawer` or full-width dialog | Visible title/description/close, focus trap, Escape, focus restoration |

Do not make a second click on the same undifferentiated card the only route from Detail to Immersive. Show a labeled action: “Explore keymap,” “Run effects,” or a project-truth-approved equivalent.

Backdrop click may close, but never replaces a close button. Immersive state must preserve the project’s place in the underlying index and return focus to its trigger.

## Reusable component patterns

### `AppFrame`

Owns skip link, landmarks, route navigation, theme control, safe areas, and status surface. It provides a single `main` landmark and a page-level heading.

### `PrimaryNav`

Uses real links with `aria-current="page"`. Desktop shows labels; mobile shows icons and persistent visible labels for the small public route set. Targets are at least 44×44px. The active indicator is decorative and derives from route state.

### `SignalHero`

Contains name, authored thesis, compact role/context, and high-value links. Scramble is an optional one-time reveal, never the source of truth; accessible text is present immediately.

### `TelemetryStrip`

Renders a small set of sourced metrics using `Metric`, `StatusBadge`, and `DataFreshness`. It distinguishes live, stale, unavailable, and degraded states. Decorative pulses are off by default and absent in reduced mode.

### `ProjectAtlas`

Coordinates the visual relationship layer with the accessible project roster. Nodes are buttons. Edges are derived from one graph. Selection, focus, filters, and URL state are shared.

### `ProjectTrigger`

The compact project row/node. It contains project name, one-line purpose, lifecycle/status, and optional domain. It has a generous hit target and an unmistakable focus state.

### `ProjectDetail`

The state-2 region. It contains a concise description, technology tags, relationship summary, authoritative external link, and explicit immersive action. Its layout is consistent even when project content varies.

### `ShowcaseShell`

The state-3 frame around bespoke content. Slots:

- title and project mark;
- provenance/status badges;
- media or interactive stage;
- controls;
- caption/explanation;
- technology/provenance footer;
- primary external link;
- intentional asset-unavailable fallback.

The shell owns resize observation, loading, error state, focus boundaries, close behavior, and reduced-motion propagation. A custom showcase owns only its instrument.

### `StatusBadge`

Status always combines text, shape/icon, and color. Separate lifecycle (`active`, `building`, `archive`) from service health (`healthy`, `degraded`, `offline`, `unknown`). “Standby” is not automatically non-nominal.

### `TechTag`

Compact metadata with readable contrast. Tags do not become a cloud of colored pills; neutral by default, with color reserved for selected filters or meaningful domains.

### `EmptyState` and `AssetFallback`

Offline data and unavailable media get authored, bounded presentations. The fallback explains what is unavailable without implying that the whole site failed and never generates a broken request loop.

## Visual language

### Color

Adopt semantic OKLCH tokens and map them to shadcn variables. Initial direction:

| Role | Graphite night | Sunset paper |
|---|---|---|
| Background | near-black violet graphite | warm mineral paper |
| Surface | lifted neutral with subtle violet bias | cream stone |
| Foreground | cool zinc-white | espresso ink |
| Muted text | stable 4.5:1 gray, never opacity-only | warm gray-brown |
| Primary | electric violet | deeper royal violet |
| Warm accent | ember orange | persimmon |
| Information | coastal cyan | ocean blue |
| Success | clear green | evergreen |
| Warning | amber | ochre |
| Destructive | signal red | oxide red |

Token families:

```text
background / foreground
surface-1 / surface-2 / surface-selected
border-subtle / border-strong
text-primary / text-secondary / text-muted / text-disabled
accent-primary / accent-warm / accent-info
status-success / status-warning / status-danger / status-neutral
focus-ring / selection
overlay / scrim
```

Opacity may create depth in borders and decoration, but informative text uses an opaque semantic color with verified contrast. Accent colors are not assigned per project arbitrarily; domain or status meaning controls color, while individual showcases may introduce a bounded local accent.

### Typography

- Heading: Satoshi or a self-hosted equivalent with distinctive geometry.
- Body: Inter or a comparable humanist grotesk.
- Operational chrome: JetBrains Mono.

Recommended scale:

| Token | Desktop | Mobile | Use |
|---|---:|---:|---|
| Display | 40/44 | 30/34 | Name or page thesis |
| H1 | 32/38 | 28/34 | Page heading |
| H2 | 24/30 | 22/28 | Section/showcase title |
| Body | 16/26 | 16/25 | Narrative and descriptions |
| UI | 14/20 | 14/20 | Controls and project names |
| Metadata | 12/17 | 12/17 | Status, timestamps, tags |
| Micro | 11/15 | 11/15 | Decorative chrome only |

Do not render informative text below 12px. Monospace is a seasoning for operational meaning, not the default paragraph face.

### Spacing and geometry

- 4px base grid.
- Page gutters: 24–32px desktop, 16px mobile.
- Content max width: 1200–1280px for atlas surfaces; 720–800px for reading.
- Control height: 36px compact desktop, 44px touch.
- Card padding: 16px compact, 20–24px expanded.
- Radius: 10px controls, 14px surfaces, 18px immersive shells.
- Borders: one quiet structural border plus selection/focus treatment; avoid stacked glow, border, gradient, and shadow on every surface.

### Elevation and texture

Dark depth comes from tonal separation, not black-on-black opacity. Warm depth comes from ink contrast and sparse soft shadow. Backdrop blur is reserved for fixed navigation and immersive overlays. Use the dot grid or mesh in one bounded atlas layer, not beneath every page.

The sunset gradient remains an identity mark for the c2k wordmark, key authored headings, and rare transitions. It should not decorate generic buttons or every project title.

## Motion system

Motion communicates data resolving or state changing.

| Token | Duration | Use |
|---|---:|---|
| Instant | 0ms | Reduced mode, route positioning |
| Fast | 120ms | Hover/focus color |
| Standard | 180ms | Button and small disclosure |
| Emphasized | 260ms | Project expansion/dialog entry |
| Reveal | ≤450ms | One-time text resolve |

Rules:

- no stagger longer than 300ms across the full visible collection;
- never leave names unreadable while the page is usable;
- no infinite motion unless it conveys fresh state and remains subtle;
- pause canvas and timers when hidden, offscreen, or in a background tab;
- resize interactive stages with `ResizeObserver` instead of assuming their source dimensions;
- avoid smooth scroll when fixed chrome would occlude the destination.

Reduced motion contract:

- text is immediately resolved;
- route edges are static;
- status indicators are solid;
- particles, mesh, stars, lightning, and ambient canvases do not start;
- disclosure and dialog changes use instant or ≤120ms opacity only;
- user-triggered showcase simulations require an explicit action and may offer their own stop control.

## Accessibility contract

Every reusable pattern must satisfy these conditions by construction:

- one `main` landmark and one page `h1`;
- skip link visible on focus;
- route links expose `aria-current`;
- all interaction uses native controls or equivalent complete semantics;
- selected/expanded state is programmatic;
- inactive panels are unmounted or `inert`;
- focus rings are never removed and have ≥3:1 contrast against adjacent colors;
- immersive state supplies title, description, close, focus trap, Escape, and focus restoration;
- all target sizes are ≥44×44px on touch layouts;
- color is never the sole status signal;
- informative text meets ≥4.5:1 contrast; large text ≥3:1;
- status updates use restrained live regions only when a user needs the update;
- reduced motion and forced colors are included in component review;
- media has accurate alternative text or is marked decorative; missing media has an intentional fallback.

## Data and state architecture

Use one canonical `ProjectRecord[]` and one relationship graph. The exact content belongs to project-truth research, but the presentation contract needs stable fields for:

```text
id
name
short purpose
long description
domain
lifecycle
health (optional and sourced)
technologies
authoritative links
relationships
media with provenance and fallback
showcase capability
featured rank/order
```

Desktop and mobile derive from this source. No duplicated arrays inside viewport-specific components. Status and activity data merge at runtime without overwriting editorial truth.

Model UI states explicitly: loading, resolved, empty, stale, offline, error, and partial. Avoid `--` without nearby meaning.

## Migration sequence

### Phase 0 — remove false baselines

Repair clean direct routing, decide the three missing-media outcomes with project truth, and establish zero-console-error production preview. These failures should not be copied into new components.

### Phase 1 — foundation

Create semantic color/type/space/motion tokens, `AppFrame`, route navigation, skip/landmark structure, theme control, focus ring, reduced-motion provider, and automated viewport/accessibility gates.

### Phase 2 — one complete project slice

Implement one project through Overview → Detail → Immersive using `ProjectTrigger`, `ProjectDetail`, `ShowcaseShell`, and responsive Dialog/Drawer. Prove keyboard, touch, focus management, resize, media fallback, and reduced motion before multiplying the pattern.

### Phase 3 — canonical atlas

Move all authoritative project records and relationships into one schema. Build the synchronized desktop atlas/index and mobile sequential index. Preserve content parity and URL-addressable selection/filter state.

### Phase 4 — Home

Recompose Home around authored thesis, current signal, one featured proof, and a clear atlas entry. Reuse the established shells instead of creating another visual dialect.

### Phase 5 — bespoke showcases

Port each custom instrument into `ShowcaseShell`, one at a time. Add per-showcase interaction and visual regression coverage. Verify asset provenance with project truth.

### Phase 6 — hardening

Run the exact baseline viewports plus intermediate widths, zoom, reduced motion, forced colors, keyboard-only, touch, slow/offline data, and zero-network-failure checks. Compare against this screenshot set for identity and hierarchy, not pixel preservation.

## Definition of done

The migration is successful when the site is unmistakably c2k.dev—not unmistakably shadcn—and when its operational personality is supported by a quieter, more legible, more truthful system:

- authored hierarchy wins over dashboard noise;
- every project is available and operable at every supported breakpoint;
- the atlas explains relationships instead of merely drawing them;
- bespoke showcases share a dependable shell without losing their character;
- dark and warm themes feel intentionally art-directed;
- no essential information depends on low opacity, pointer hover, animation, or color alone;
- direct routes, console, network, focus, overflow, and reduced motion are clean.

