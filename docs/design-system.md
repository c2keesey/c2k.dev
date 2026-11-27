# Outer Sunset: the c2k.page design system

The live version is at **`/design-system`** (`bun run dev`, then open the route). This file is the written contract. When the two disagree, the code in `src/styles/app.css` and `src/components/system/` wins; fix whichever is wrong.

Named for the neighbourhood the site is built in, at the hour the sky over the Pacific turns violet and the last orange sits on the water. The concept is unchanged from `CLAUDE.md`: **a system monitor for my life**. And it is **primarily an art project**. Chris's own direction lives in `docs/design-direction.md`. That doc outranks this one, so when the two disagree, this doc changes.

---

## 1. Principles

These five decide arguments. Anything this doc doesn't cover goes back to them.

0. **It's an art project first.** Background effects such as canvas meshes, starfields, particles and cursor trails are wanted. They are part of the piece, not noise to cut. Keep them subtle enough that the content stays readable, and honour reduced motion.
1. **Real data, never fake data.** Every reading, status, count and relationship reflects actual state. Missing data reads `--` and never a plausible fake. This governs *data*. It does not forbid art: a background effect is fine, as long as it doesn't pretend to be a reading.
2. **Data resolves; it does not slide.** Show change by decoding text into place, not with fades or slide-ups. Each view gets one orchestrated decode on load. After that, data motion only answers what the visitor does. Ambient background art may keep moving.
3. **The sunset means change.** The purple → orange gradient is reserved for things in transition: glyphs mid-decode, live route pulses, and the `c2k` mark. Resolved content is solid colour. Don't use the gradient as a background wash, and don't paint gradient headlines.
4. **Chrome is quiet, content is loud.** Labels, counters and status lines are small lowercase mono at the edge of perception. Names and writing are proportional and full contrast. Uppercase is allowed only for machine states and route names.

---

## 2. Architecture: how shadcn fits into Astro

| Piece | Where | Notes |
|---|---|---|
| Tailwind v4 | `@tailwindcss/vite` in `astro.config.mjs` | No `tailwind.config`. The theme lives in CSS. |
| Tokens + Tailwind entry | `src/styles/app.css` | Loaded **only** by `AppLayout.astro`. |
| React islands | `@astrojs/react@4` (Astro 5 needs v4, not v7) | |
| shadcn/ui | `src/components/ui/*.tsx`, `components.json` | Style `new-york`, restyled to these tokens. Add more with `bunx --bun shadcn@latest add <name>`, then **fix the import**: the CLI writes `from "cn"`. Change it to `from "@/lib/utils"`. |
| System primitives | `src/components/system/*` | The site's own components, built on shadcn. Import from `@/components/system`. |
| Shell | `src/layouts/AppLayout.astro` | Header (mark, sliding nav, theme), main, live system strip. |
| Path alias | `@/*` → `src/*` | Set in `tsconfig.json`. |
| `cn()` | `src/lib/utils.ts` | clsx + tailwind-merge |

### Migration layout: nothing regresses while we port

- The **legacy site is untouched**. `src/pages/index.astro` still loads `global.css` and the old components, and serves `/`, `/projects`, `/about` and `/lab`. Tailwind's preflight never reaches it.
- **Ported pages live under `/next`**: `src/pages/next/index.astro`, `projects.astro` and `about.astro` exist as placeholders. Replace them.
- The swap is two steps: set `BASE = ''` in `src/lib/site.ts`, then move `src/pages/next/*` up one level and delete the legacy page. Chris approves the swap first. **Do not deploy.**
- **Legacy bridge.** The bottom of `app.css` maps the old variable names (`--bg`, `--text`, `--purple`, `--orange`, `--gradient`, …) onto the new tokens. An un-ported `.astro` component such as `DesktopDashboard.astro` will therefore render inside `AppLayout` with roughly the right colours while you migrate it. Treat this as scaffolding. Delete each alias once nothing reads it.
- Dev middleware fix: `/projects` used to serve a stale `dist/` file in dev. Dev mode now serves the live index.

### Islands checklist

- Every React component that needs interactivity needs a `client:*` directive: `client:load` above the fold, `client:visible` below it, `client:idle` for the footer.
- **Each island is its own React root.** Context doesn't cross islands, so wrap tooltips in a `<TooltipProvider>` inside the island.
- For static text that only needs to decode, use `Decode.astro`. It ships no React.

---

## 3. Tokens

All tokens are CSS variables in `src/styles/app.css` and are exposed to Tailwind through `@theme inline`. Use the Tailwind class, and fall back to `var(--token)` only in SVG or inline styles.

### Themes

- **Dusk** (default, dark): `:root`
- **Golden hour** (light): `[data-theme="warm"]` on `<html>`. The storage key `c2k-theme` is shared with the legacy toggle.
- Variants: `dark:` applies when *not* warm, and `warm:` applies to golden hour. Most code needs neither, because the tokens flip on their own.

### Colour

| Role | Class | Token | Use |
|---|---|---|---|
| night | `bg-background` | `--background` | the page |
| surface | `bg-surface` | `--surface` | flat raised areas |
| surface-2 | `bg-surface-2` | `--surface-2` | hover, popovers |
| card | `bg-card` / `.panel` | `--card` | frosted panel at 72%, sits on the dot grid |
| ink | `text-foreground` | `--foreground` | names, writing, values. **16.6:1** |
| muted ink | `text-muted-foreground` | `--muted-foreground` | secondary prose, taglines. **8.6:1** |
| faint ink | `text-faint-foreground` | `--faint-foreground` | chrome labels only. **5.0:1**, the floor for any text |
| violet | `bg-primary` / `text-primary` | `--primary` | the one primary action, links, focus |
| ember | `text-ember` | `--ember` | warm counterweight: sparklines, highlights |
| sunset | `.text-sunset`, `var(--sunset)` | `--sunset` | transition only (principle 3) |
| hairline | `border-border` / `border-border-strong` | | 8% / 14% white |

Contrast figures are measured on night in dusk. Every text token clears 4.5:1 on the page background in both themes. Check with `node scripts/contrast.mjs`, and add any new text colour to it.

### Status (semantic; never decorative)

| Word | Class | Meaning |
|---|---|---|
| `ONLINE` | `status-online` | shipped and in use |
| `DEPLOYING` | `status-deploying` | being built right now |
| `STANDBY` | `status-standby` | exists, not running (hardware, paused). Drawn as a hollow ring |
| `ADVISORY` | `status-advisory` | running with a known problem |
| `OFFLINE` | `status-offline` | unreachable, and real data said so |

Aggregates use the control-room phrasing `14/22 NOMINAL`, never "14 nodes".

### Routes (project network metro lines)

`route-core` CORE STACK (purple) · `route-hardware` HARDWARE (orange) · `route-software` SOFTWARE (green) · `route-claude` CLAUDE TOOLS (red) · `route-config` CONFIG (violet-blue) · `route-automation` AUTOMATION (teal). `ROUTES` in `@/components/system` holds the name, text class and stroke var for each.

### Type

- **Instrument Sans Variable** (`font-sans`) handles prose. The `font-display` utility sets it at 88% width, weight 620 and −0.025em tracking for headlines and names.
- **JetBrains Mono Variable** (`font-mono`) handles all instrument chrome: labels, counters, status, node names on the map, tech tags and code.
- Both fonts are self-hosted through `@fontsource-variable`, with no Google Fonts request.
- The scale follows classical ratios: `text-2xs` 11 · `xs` 12 · `sm` 14 · `base` 16 · `lg` 18 · `xl` 21 · `2xl` 24 · `3xl` 30 · `4xl` 36 · `5xl` 48 · `6xl` 60 · `7xl` 72.
- `.chrome` is mono 11px in faint ink with tabular figures. Every instrument label uses it.
- `.tabular` gives tabular figures with a slashed zero. Use it on any number that updates.
- Keep prose under about 70ch.

### Shape: radius encodes hierarchy

`rounded-xs` 3px (kbd, tags) < `rounded-sm` 5px (buttons, inputs, nav pill) < `rounded-md` 8px (panels, node cards) < `rounded-lg` 12px (expanded nodes, dialogs, sheets). Note that shadcn's stock `rounded-md` on buttons was deliberately changed to `rounded-sm`.

### Depth

Depth comes from light, not shadow. Stack surfaces in this order: flat `bg-surface`, then `.panel` (frosted, hairline, top-edge highlight, `backdrop-blur 8px`), then overlays. **Only overlays get a shadow.** Map backgrounds use `.bg-dot-grid` plus a `.bg-vignette` layer.

### Motion

| Token | Value | Use |
|---|---|---|
| `ease-snap` | `cubic-bezier(.2,.8,.2,1)` | default for everything (`--default-transition-timing-function`) |
| `duration-150` | 150ms | route highlight, colour |
| `duration-200` | 200ms | hover (the default duration) |
| `duration-300` | 300ms | node expand, nav pill |
| decode | 900ms | text resolve; 500ms for short marks |
| `animate-pulse-active` / `-periodic` / `-dormant` | 2s / 5s / 8s | status heartbeat, chosen from how often the thing actually runs |
| `animate-flow` / `animate-flow-slow` | dash offset | route lines (`stroke-dasharray` 6 4 or similar). Flow runs from dependency toward dependent |

`prefers-reduced-motion` is honoured globally in `app.css`, and the decode engine sets text instantly under reduced motion.

---

## 4. Components

### shadcn/ui (`@/components/ui/*`), restyled

`button`, `badge`, `card`, `tooltip`, `tabs`, `separator`, `skeleton`, `hover-card`, `dialog`, `sheet`, `scroll-area`, `toggle`, `toggle-group`, `kbd`.

**Button variants**

- `default` (violet): at most one per view.
- `outline`: most buttons.
- `secondary`.
- `ghost`: toolbars.
- `chrome`: mono lowercase instrument control, such as `expand` or `filter: hardware`. It supports `aria-pressed` and `data-state=on`.
- `link`.
- `destructive`: kept for parity.

**Badge variants**

- `tag`: what a project is made of, e.g. `Python`.
- `role`: what it is to Chris, e.g. `founder` or `daily driver`.
- `outline`, `secondary`, `default`.
- **Live state is never a Badge.** Use `StatusBadge`.

**Card** is restyled to the `.panel` surface. For instruments, prefer `Panel` from system.

Overlays (tooltip, hover card, dialog, sheet) use `bg-popover` with a strong hairline. Tooltips use mono 11px. **Dialogs are rare:** projects expand inline. On phones, a bottom `Sheet` is the acceptable overlay for project detail.

### System primitives (`@/components/system`)

| Component | What it is |
|---|---|
| `Scramble` | React decode text. `trigger`: `visible` (default), `mount`, `hover`, or `manual` plus `replayKey`. Screen readers get the real text; the animation is `aria-hidden`; the placeholder has the same shape, so layout never shifts. |
| `Decode.astro` | The same decode for `.astro` pages without React. `<Decode as="h1" text="…" class="…" delay={150} />` |
| `decode(el, text, opts)` | The engine (`@/lib/scramble`), for hand-written scripts and canvas/SVG labels |
| `StatusDot` | A dot whose pulse rate follows `activity`. Standby is a hollow ring. Pass `label` when it stands alone. |
| `StatusBadge` | Dot plus uppercase state word, e.g. `<StatusBadge status="online">14/22 NOMINAL</StatusBadge>` |
| `Readout` | A telemetry value over a lowercase mono key. `null` renders `--`; `stale` dims it. |
| `Sparkline` | Inline trend in currentColor (ember by default). `label` is required for a11y. |
| `RelativeTime` | "4m ago" that stays true. `<time>` element with the full timestamp on hover. `tick={1000}` for LAST SYNC. |
| `Panel` / `PanelHeader` / `PanelBody` | Frosted instrument. The header has a mono label on the left and live state or action on the right. |
| `NodeCard` | Reference node for the project network, with progressive disclosure: glance, then hover preview (`preview`), then click to expand inline (`children`). Takes the route colour, accessible button, `aria-expanded`, and `inert` while collapsed. |
| `ROUTES` | Route name, class and stroke var |
| `Mark` | The lowercase `c2k` mark in sunset; re-decodes on hover |
| `SlidingNav` | One highlight that slides to whatever you point at or focus, then settles on the current page |
| `ThemeToggle` | Switches between dusk and golden hour |
| `SiteHeader` / `SystemStrip` | The shell pieces `AppLayout` uses. `SystemStrip` polls `/api/status` and says `OPTIPLEX OFFLINE` when it can't reach the box. |

### Real data

- `useLive<T>(url, intervalMs)` in `@/hooks/use-live` returns `{ data, syncedAt, failed }`. `data` stays `null` until a real response arrives.
- `useNow(ms)` re-renders on a tick.
- The response shapes are in `@/lib/live`: `SystemStatus` (`/api/status`) and `Activity` (`/api/activity`). `overallToStatus()` maps the server's green, yellow and red onto the status vocabulary.
- On the Mac, `/api/status` returns `{status:"offline"}` because the OptiPlex dashboard isn't on localhost. That's correct behaviour, not a bug to paper over.

---

## 5. Patterns

**Project network** (for the projects worker)

- Full bleed: `<AppLayout title="Projects" bleed>`.
- The map surface is `bg-dot-grid`, then the living background (`MeshField` in `src/components/network/MeshField.tsx`: a noise-breathing triangle mesh, a twinkling parallax starfield and a cursor heat trail), then a `bg-vignette` overlay.
- Nodes are `NodeCard`, or your own built on the same parts: `StatusDot`, `ROUTES`, `.panel`, `chrome`.
- Layout: projects on a staggered lattice, small builds on the gutter rows between (see the note on `x`/`y` in `src/data/projects.ts`). `src/components/network/layout.ts` maps it into a frame clear of the header, telemetry and legend, routes each line through the gutters rather than under a card, and sets each lit label where it covers no station.
- Routes are orthogonal SVG paths with rounded corners. Use `stroke={ROUTES[r].stroke}`, dashed, with `animate-flow` or `animate-flow-slow` depending on connection type.
- Hovering a node brightens connected routes from 0.3 to 0.7 opacity and dims the rest to 0.1, over 150ms.
- Glow uses SVG `feGaussianBlur`, never `box-shadow`.
- Header line: a `StatusBadge` reading `n/m NOMINAL`, plus `last sync` with `RelativeTime`.
- Mobile keeps a stacked layout, and detail may rise in a `Sheet`.
- The bespoke per-project showcases still go inside the expanded node.

**Telemetry panel**

`Panel` → `PanelHeader label={<><StatusDot/>name</>} aside={<StatusBadge/>}` → a grid of `Readout`, then a footer `chrome` line with `last sync`. See `/design-system#patterns`.

**Home** (for the home worker)

- The legacy home reads as AI-generic because of:
  - tracked all-caps eyebrows (`CURRENTLY BUILDING`, `SYSTEMS`);
  - a gradient headline;
  - a middle-dot tagline (`Outer Sunset, SF · Ridiculous output · …`);
  - two identical boxed widgets next to a showcase card.
- Spend boldness in one place, which is probably the name decoding at display size.
- Keep the chrome quiet.
- Show only real readings.
- Don't box everything: if it isn't an instrument, it doesn't need a panel.

---

## 6. Writing

- Use sentence case. Uppercase is only for machine states and route names.
- Labels are lowercase keys, the way a config file names things: `cpu`, `last deploy`, `pushes / 7d`.
- A `·` separates two real readings and nothing else. Don't string middle-dot taglines together for rhythm.
- Don't add `→` to links. Links say where they go.
- Errors say what failed and what is being shown instead, e.g. `optiplex unreachable — showing last reading from 4m ago`. They don't apologise.
- A CTA names exactly what happens: "Open the network", not "Explore my work".

## 7. Accessibility floor

- Visible focus (`:focus-visible` 2px violet ring).
- A skip link in `AppLayout`.
- `aria-current` on nav.
- Decode text readable by screen readers.
- `role="img"` plus a label on standalone dots and sparklines.
- Every text token is ≥ 4.5:1.
- Reduced motion is honoured globally.
- Responsive to 375px. Check `scrollWidth` at 375 after layout work. Grid children holding truncated text need `min-w-0`; `Panel` has it built in.
