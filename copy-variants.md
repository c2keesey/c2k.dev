# About page — three variants

Variant A is live. To swap, replace the two `<p>` blocks inside `.about-blurb`
in `src/pages/index.astro` (~line 280) with another variant below.

The tells I was writing away from: em-dash chains, rule-of-three rhythm,
"I'm a X who Y" openers, "When I'm not building...", symmetric work-paragraph /
play-paragraph structure, and the tidy summary sentence at the end that
restates what you just read.

---

## A — dry / understated  ← LIVE

> CTO at MAIA Analytics. The pitch is that you ask a question about a property
> and get a map back. The reality is a lot of LLM orchestration and a lot of
> data pipelines that have to be right, because a map that is confidently wrong
> is worse than no map.
>
> Outside of that I solder things that don't need to exist. A 300-LED gauntlet.
> A cloud that generates its own lightning. A keyboard with 42 keys, which is
> fewer than you think you need and turns out to be enough. Most of my week is
> Claude Code in a terminal. The rest is Ocean Beach, backcountry when there's
> snow, and more time mixing drum and bass than I'd defend in public.
>
> All of this runs on a used OptiPlex micro under my desk, this site included.
> The status bar at the bottom of the page is real. If it goes red, something
> in my apartment is actually broken.

**Why this one ships:** the page already has a fastfetch readout doing the
machine voice. If the prose is also clipped and technical it reads like two
terminals talking to each other. Dry-but-human is the counterweight, and the
flat delivery lets the specifics (42 keys, the OptiPlex, the red status bar)
carry the personality instead of adjectives.

---

## B — warm / conversational

> Hey, I'm Chris. I build software, and I solder things that don't need to
> exist.
>
> The day job is MAIA Analytics, where I'm CTO. You ask a question about a
> property, you get a map back. Everything hard lives between those two
> sentences, and most of my time goes into making the agents in the middle
> reliable enough that you'd actually trust the answer.
>
> The rest of it: a 300-LED gauntlet I wear to shows, a cloud lamp that
> generates its own lightning, a 42-key keyboard I rebuilt my typing around. I
> surf Ocean Beach when it isn't closing out, ski backcountry when there's
> snow, and mix drum and bass badly but happily.
>
> Everything on this site runs on a used OptiPlex under my desk. The status bar
> at the bottom is live. If it goes red, come back later.

---

## C — terse / technical

> CTO at MAIA Analytics. Natural language in, maps out. LLM orchestration and
> property data pipelines, mostly TypeScript and Python.
>
> Strong bias toward simple code and few abstractions. I would rather delete a
> layer than add one.
>
> Off-hours: LEDs, keyboards, and automations that save thirty seconds a day
> and cost a weekend. Currently 42 keys, 7 layers, no number row.
>
> Self-hosted on an OptiPlex micro. Tailscale for the private things,
> Cloudflare Tunnel for this one. Footer telemetry is live, not decorative.

---

# Other copy changed in this pass

Not variants, just rewrites. Old on the left in the commit diff.

- **Home hero** — left alone. "Ridiculous output · Living in agreement with
  nature" is already yours and doesn't read as machine.
- **Project node blurbs** (`DesktopDashboard.astro`, `MobileNetworkView.astro`) —
  same facts, less brochure. Killed the em-dash-plus-tricolon pattern that every
  single one of them shared.
- **Showcase taglines and descriptions** — "Public observability layer for a
  developer's entire digital system" and friends. Same idea, said out loud.
- **c2k.page page map** ("Landing beacon", "The operator behind the system") —
  these read like a product deck describing a website. Now they describe what
  the page does.
