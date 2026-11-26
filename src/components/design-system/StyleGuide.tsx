import * as React from 'react';
import { RotateCcw, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Kbd } from '@/components/ui/kbd';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  NodeCard,
  Panel,
  PanelBody,
  PanelHeader,
  Readout,
  RelativeTime,
  ROUTES,
  Scramble,
  Sparkline,
  StatusBadge,
  StatusDot,
  STATUSES,
  STATUS_META,
  type Route,
} from '@/components/system';
import { useLive } from '@/hooks/use-live';
import { overallToStatus, type SystemStatus } from '@/lib/live';
import type { Activity } from '@/components/system/status';
import { cn } from '@/lib/utils';

/* ───────────────────────── layout helpers ───────────────────────── */

const SECTIONS = [
  ['principles', 'principles'],
  ['color', 'color'],
  ['type', 'type'],
  ['shape', 'shape'],
  ['motion', 'motion'],
  ['status', 'status'],
  ['components', 'components'],
  ['patterns', 'patterns'],
  ['writing', 'writing'],
] as const;

function Section({ id, title, lede, children }: { id: string; title: string; lede?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border pt-10 pb-16">
      <div className="mb-8 grid gap-2 md:grid-cols-[12rem_1fr] md:gap-x-0">
        <a href={`#${id}`} className="chrome pt-2 hover:text-foreground">#{id}</a>
        <div>
          <h2 className="font-display text-3xl">{title}</h2>
          {lede && <p className="mt-2 max-w-[62ch] text-muted-foreground">{lede}</p>}
        </div>
      </div>
      <div className="md:pl-[12rem]">{children}</div>
    </section>
  );
}

function Sub({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-10', className)}>
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Swatch({ name, token, note, className }: { name: string; token: string; note?: string; className?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn('h-16 rounded-md border border-border', className)} style={{ background: `var(${token})` }} />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        <code className="chrome">{token}</code>
        {note && <span className="chrome mt-0.5 text-muted-foreground">{note}</span>}
      </div>
    </div>
  );
}

/* ───────────────────────────── sections ───────────────────────────── */

function Principles() {
  const items = [
    ['Real, not decorative', 'Every dot, line and number reflects actual state. If there is no data behind it, it does not get drawn. Missing data reads "--", never a plausible fake.'],
    ['Data resolves; it does not slide', 'Change is shown by text decoding into place, not by fades and slide-ups. One orchestrated decode per view on load; after that, motion answers what the visitor does.'],
    ['The sunset means change', 'The purple → orange gradient is reserved for things in transition: glyphs mid-decode, live route pulses, and the c2k mark. Resolved content is solid colour.'],
    ['Chrome is quiet, content is loud', 'Labels, counters and status are small lowercase mono at the edge of perception. Names and writing are proportional and full contrast. Uppercase is only for machine states.'],
  ];
  return (
    <ul className="grid gap-x-10 gap-y-8 md:grid-cols-2">
      {items.map(([t, d]) => (
        <li key={t}>
          <div>
            <p className="font-medium">{t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Color() {
  return (
    <>
      <Sub title="Night & surfaces — dusk theme (golden hour is the light theme; flip it in the header)">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Swatch name="night" token="--background" note="page" />
          <Swatch name="surface" token="--surface" note="raised" />
          <Swatch name="surface-2" token="--surface-2" note="popovers, hover" />
          <Swatch name="card" token="--card" note="frosted panel, 72%" className="bg-dot-grid" />
        </div>
      </Sub>
      <Sub title="Ink">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['foreground', '--foreground', 'Names, writing, values. 16.6 : 1'],
            ['muted', '--muted-foreground', 'Secondary prose, taglines. 8.6 : 1'],
            ['faint', '--faint-foreground', 'Chrome labels only. 5.0 : 1 — the floor for text'],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-md border border-border p-4">
              <p className="text-2xl font-display" style={{ color: `var(${t})` }}>Outer Sunset</p>
              <p className="mt-2 text-sm font-medium">{n} <code className="chrome ml-1">{t}</code></p>
              <p className="chrome mt-1 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Sub>
      <Sub title="Brand — violet sky, ember sun, and the gradient between them">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Swatch name="violet" token="--primary" note="primary action, focus, links" />
          <Swatch name="ember" token="--ember" note="warm counterweight: trends, highlights" />
          <div className="col-span-2 flex flex-col gap-2">
            <div className="h-16 rounded-md border border-border" style={{ background: 'var(--sunset)' }} />
            <span className="text-sm font-medium">sunset</span>
            <code className="chrome">--sunset · .text-sunset</code>
            <span className="chrome text-muted-foreground">transition only — never a background wash</span>
          </div>
        </div>
      </Sub>
      <Sub title="Routes — the six metro lines of the project network">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(ROUTES) as Route[]).map((r) => (
            <li key={r} className="flex items-center gap-3">
              <svg width="72" height="10" className="shrink-0" aria-hidden>
                <line x1="0" y1="5" x2="72" y2="5" stroke={ROUTES[r].stroke} strokeWidth="2" strokeDasharray="6 4" className="animate-flow-slow" strokeLinecap="round" />
              </svg>
              <span className="flex flex-col">
                <span className={cn('font-mono text-xs', ROUTES[r].text)}>{ROUTES[r].name}</span>
                <code className="chrome">--route-{r}</code>
              </span>
            </li>
          ))}
        </ul>
      </Sub>
    </>
  );
}

function Type() {
  const scale = [
    ['7xl', 'text-7xl font-display', '72'],
    ['5xl', 'text-5xl font-display', '48'],
    ['3xl', 'text-3xl font-display', '30'],
    ['xl', 'text-xl font-medium', '21'],
    ['base', 'text-base', '16'],
    ['sm', 'text-sm text-muted-foreground', '14'],
    ['xs mono', 'font-mono text-xs', '12'],
    ['2xs chrome', 'chrome', '11'],
  ];
  return (
    <>
      <Sub title="Two families">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-md border border-border p-5">
            <p className="font-display text-5xl">Instrument Sans</p>
            <p className="mt-3 text-sm text-muted-foreground">Display and prose. Variable width axis: headlines run slightly condensed (88%) and tight, so names read like labels on hardware. Body runs at normal width, 16/26.</p>
            <code className="chrome mt-3 block">font-sans · font-display</code>
          </div>
          <div className="rounded-md border border-border p-5">
            <p className="font-mono text-4xl font-medium tracking-tight">JetBrains Mono</p>
            <p className="mt-3 text-sm text-muted-foreground">All instrument chrome: labels, counters, status, node names on the map, tech tags, code. Tabular figures with slashed zero for every number that updates.</p>
            <code className="chrome mt-3 block">font-mono · chrome · tabular</code>
          </div>
        </div>
      </Sub>
      <Sub title="Scale — 11 · 12 · 14 · 16 · 21 · 30 · 48 · 72 (classical ratios, not a linear ramp)">
        <div className="divide-y divide-border">
          {scale.map(([n, cls, px]) => (
            <div key={n} className="grid grid-cols-[8rem_1fr] items-baseline gap-4 py-3">
              <span className="chrome tabular">{n} / {px}</span>
              <span className={cn('truncate', cls)}>Ocean Beach, 6:47 pm</span>
            </div>
          ))}
        </div>
      </Sub>
    </>
  );
}

function Shape() {
  const r = [
    ['xs · 3px', 'rounded-xs', 'kbd, tech tags'],
    ['sm · 5px', 'rounded-sm', 'buttons, inputs, nav pill'],
    ['md · 8px', 'rounded-md', 'panels, node cards'],
    ['lg · 12px', 'rounded-lg', 'expanded nodes, dialogs'],
  ];
  return (
    <>
      <Sub title="Radius encodes hierarchy — the bigger the container, the softer the corner">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {r.map(([n, c, u]) => (
            <div key={n} className="flex flex-col gap-2">
              <div className={cn('h-20 border border-border-strong bg-surface', c)} />
              <span className="text-sm font-medium">{n}</span>
              <span className="chrome">{u}</span>
            </div>
          ))}
        </div>
      </Sub>
      <Sub title="Depth comes from light, not shadow">
        <div className="relative grid gap-4 overflow-hidden rounded-lg border border-border bg-dot-grid p-8 sm:grid-cols-3">
          <div className="pointer-events-none absolute inset-0 bg-vignette" />
          <div className="relative rounded-md bg-surface p-4"><p className="text-sm font-medium">surface</p><p className="chrome">flat, one step up</p></div>
          <Panel className="relative p-4"><p className="text-sm font-medium">panel</p><p className="chrome">frosted · hairline · top-edge highlight</p></Panel>
          <div className="relative rounded-md border border-border-strong bg-popover p-4 shadow-2xl shadow-black/40"><p className="text-sm font-medium">overlay</p><p className="chrome">the only thing with a shadow</p></div>
        </div>
      </Sub>
    </>
  );
}

function Motion() {
  const [key, setKey] = React.useState(0);
  const pulses: [Activity, string, string][] = [
    ['active', '2s', 'shipping this week'],
    ['periodic', '5s', 'cron, daily driver'],
    ['dormant', '8s', 'hardware on a shelf'],
  ];
  return (
    <>
      <Sub title="Decode — the signature">
        <Panel className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Scramble key={key} trigger="mount" text="Christopher Keesey" as="p" className="font-display text-4xl sm:text-5xl" />
            <Button variant="chrome" onClick={() => setKey((k) => k + 1)}><RotateCcw className="size-3" />replay</Button>
          </div>
          <p className="mt-4 max-w-[62ch] text-sm text-muted-foreground">
            Characters are born as <span className="font-mono">–</span>, cycle through hex glyphs drawn in the sunset gradient, and resolve left to right with jitter over 900 ms.
            Screen readers get the final text immediately. Under reduced motion it simply appears.
          </p>
          <code className="chrome mt-3 block">{'<Scramble text="…" />'} (React) · {'<Decode text="…" />'} (Astro, no JS framework) · decode(el, text) (lib/scramble)</code>
        </Panel>
      </Sub>
      <Sub title="Heartbeats — pulse rate is a fact about the thing">
        <div className="grid gap-4 sm:grid-cols-3">
          {pulses.map(([a, s, d]) => (
            <div key={a} className="flex items-center gap-3 rounded-md border border-border p-4">
              <StatusDot status="online" activity={a} size="md" />
              <div>
                <p className="font-mono text-sm">{a} <span className="text-faint-foreground">· {s}</span></p>
                <p className="chrome">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Sub>
      <Sub title="Timing">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="chrome"><tr><th className="py-2 font-normal">token</th><th className="font-normal">value</th><th className="font-normal">use</th></tr></thead>
            <tbody className="divide-y divide-border">
              {[
                ['ease-snap', 'cubic-bezier(.2,.8,.2,1)', 'everything by default — snappy, not floaty'],
                ['duration-150', '150ms', 'route highlight, colour changes'],
                ['duration-200', '200ms', 'hover (default transition)'],
                ['duration-300', '300ms', 'node expand, nav pill slide'],
                ['decode', '900ms', 'text resolve; 500ms for short marks'],
              ].map(([t, v, u]) => (
                <tr key={t}><td className="py-2 font-mono text-xs">{t}</td><td className="font-mono text-xs text-muted-foreground">{v}</td><td className="text-muted-foreground">{u}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sub>
    </>
  );
}

function StatusSection() {
  return (
    <div className="divide-y divide-border rounded-md border border-border">
      {STATUSES.map((s) => (
        <div key={s} className="grid grid-cols-[9rem_1fr] items-center gap-4 px-4 py-3 sm:grid-cols-[9rem_1fr_auto]">
          <StatusBadge status={s} />
          <span className="text-sm text-muted-foreground">{STATUS_META[s].meaning}</span>
          <code className="chrome hidden sm:block">status-{s}</code>
        </div>
      ))}
      <div className="px-4 py-3 text-sm text-muted-foreground">
        Aggregate counts read like a control room: <StatusBadge status="online" className="mx-1">14/22 NOMINAL</StatusBadge> not "14 nodes".
        Standby is a hollow ring: it exists, it is not running.
      </div>
    </div>
  );
}

function Components() {
  const [range, setRange] = React.useState('7d');
  return (
    <>
      <Sub title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Open the network</Button>
          <Button variant="outline">View source</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="chrome">expand</Button>
          <Button variant="chrome" aria-pressed>filter: hardware</Button>
          <Button variant="link">github.com/c2keesey</Button>
          <Button disabled>Disabled</Button>
        </div>
        <p className="chrome mt-3">One violet button per view, at most. Most actions are outline or chrome.</p>
      </Sub>
      <Sub title="Badge">
        <div className="flex flex-wrap items-center gap-2">
          {['Astro', 'React', 'Python', 'Tailwind', 'SQLite'].map((t) => <Badge key={t} variant="tag">{t}</Badge>)}
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Badge variant="role">founder</Badge>
          <Badge variant="role">daily driver</Badge>
        </div>
        <p className="chrome mt-3">tag = what it's made of · role = what it is to me · live state is never a Badge, use StatusBadge</p>
      </Sub>
      <Sub title="Tabs & toggle group">
        <div className="grid gap-6 md:grid-cols-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stack">Stack</TabsTrigger>
              <TabsTrigger value="log">Log</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-3 text-sm text-muted-foreground">An AI geospatial platform. You ask in plain English; agents find the parcels and draw them.</TabsContent>
            <TabsContent value="stack" className="pt-3 text-sm text-muted-foreground">React, FastAPI, Postgres, DuckDB.</TabsContent>
            <TabsContent value="log" className="pt-3 text-sm text-muted-foreground">Pushed 4d ago.</TabsContent>
          </Tabs>
          <div>
            <ToggleGroup type="single" variant="outline" size="sm" value={range} onValueChange={(v) => v && setRange(v)} aria-label="Range">
              {['24h', '7d', '30d'].map((r) => <ToggleGroupItem key={r} value={r} className="font-mono text-xs">{r}</ToggleGroupItem>)}
            </ToggleGroup>
            <p className="chrome mt-3">range = {range}</p>
          </div>
        </div>
      </Sub>
      <Sub title="Overlays — tooltip, hover card, dialog, sheet">
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild><Button variant="outline" size="sm">Tooltip</Button></TooltipTrigger>
            <TooltipContent>shared infrastructure</TooltipContent>
          </Tooltip>
          <HoverCard openDelay={120}>
            <HoverCardTrigger asChild><Button variant="outline" size="sm">Hover card</Button></HoverCardTrigger>
            <HoverCardContent>
              <div className="flex items-center justify-between"><span className="font-mono text-sm text-route-core">maia</span><StatusBadge status="online" /></div>
              <p className="mt-2 text-sm text-muted-foreground">AI geospatial platform</p>
              <p className="chrome mt-2">3 services · last deploy 2h ago</p>
            </HoverCardContent>
          </HoverCard>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" size="sm">Dialog</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialogs are rare here</DialogTitle>
                <DialogDescription>Projects expand inline, in place on the map. Reach for a dialog only when something genuinely interrupts.</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="sm">Sheet</Button></SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Mobile detail</SheetTitle>
                <SheetDescription>On phones, an expanded node may rise as a bottom sheet so the stack keeps its place.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <span className="chrome flex items-center gap-1">close with <Kbd>esc</Kbd></span>
        </div>
      </Sub>
      <Sub title="Loading — skeletons hold the exact shape of what's coming">
        <div className="flex max-w-sm items-center gap-3">
          <Skeleton className="size-1.5 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="ml-auto h-3 w-12" />
        </div>
        <p className="chrome mt-3">Prefer "--" in readouts; use Skeleton only for whole rows of text.</p>
      </Sub>
    </>
  );
}

function Patterns() {
  const { data: status, syncedAt, failed } = useLive<SystemStatus>('/api/status', 30_000);
  const { data: activity } = useLive<{ repos: { name: string; lastCommit: string | null; pushedAt: string }[]; totalPushes: number; pushesByDay: number[] }>('/api/activity', 300_000);
  const online = status?.status === 'online' ? status : null;
  const st = failed ? 'offline' : overallToStatus(status);
  const latest = activity?.repos[0];

  return (
    <>
      <Sub title="Telemetry panel — wired to /api/status and /api/activity (real values, right now)">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel>
            <PanelHeader label={<><StatusDot status={st} />optiplex</>} aside={<StatusBadge status={st} />} />
            <PanelBody className="grid grid-cols-4 gap-4 pt-2">
              <Readout label="cpu" value={online?.cpu} unit="%" />
              <Readout label="mem" value={online?.memory} unit="%" />
              <Readout label="services" value={online ? `${online.services.running}/${online.services.total}` : null} />
              <Readout label="crons" value={online ? `${online.crons.ok}/${online.crons.total}` : null} />
            </PanelBody>
            <div className="chrome border-t border-border px-4 py-2">
              {syncedAt ? <>last sync <RelativeTime date={syncedAt} tick={1000} /></> : 'syncing…'}
            </div>
          </Panel>
          <Panel>
            <PanelHeader label={<><StatusDot status={latest ? 'deploying' : 'standby'} />currently building</>} aside={activity && <Sparkline values={activity.pushesByDay} label={`${activity.totalPushes} pushes in the last 7 days`} />} />
            <PanelBody className="pt-2">
              {latest ? (
                <div className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-primary">{latest.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{latest.lastCommit ?? 'private'}</p>
                  </div>
                  <RelativeTime date={latest.pushedAt} className="chrome shrink-0" />
                </div>
              ) : (
                <div className="flex gap-3"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-48" /></div>
              )}
              <Readout className="mt-4" size="sm" label="pushes / 7d" value={activity?.totalPushes} />
            </PanelBody>
          </Panel>
        </div>
      </Sub>
      <Sub title="Node — progressive disclosure: glance, hover for a data preview, click to expand in place">
        <div className="relative flex min-h-72 flex-wrap items-start gap-6 overflow-hidden rounded-lg border border-border bg-dot-grid p-6">
          <div className="pointer-events-none absolute inset-0 bg-vignette" />
          <NodeCard name="maia" tagline="AI geospatial platform" status="online" activity="active" route="core" preview="3 services · last deploy 2h ago">
            <p className="text-sm text-muted-foreground">The bespoke showcase for each project renders here, inside the node, on the map. No page change, no modal.</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{['React', 'FastAPI', 'Postgres', 'DuckDB'].map((t) => <Badge key={t} variant="tag">{t}</Badge>)}</div>
          </NodeCard>
          <NodeCard name="flux-gauntlet" tagline="LED wearable" status="standby" route="hardware" preview="esp32 · last flashed 3mo ago" />
          <NodeCard name="parley" tagline="Two-way voice for coding agents" status="deploying" route="claude" preview="v0.8.0 · pushed 4d ago" />
        </div>
      </Sub>
    </>
  );
}

function Writing() {
  const rows = [
    ['optiplex nominal · sync 12s ago', 'All systems operational!'],
    ['currently building', 'CURRENTLY BUILDING (tracked caps eyebrow)'],
    ['14/22 NOMINAL', '22 nodes'],
    ['--', '0% (when the source is down)'],
    ['Open the network', 'Explore my work →'],
    ['optiplex unreachable — showing last reading from 4m ago', 'Oops! Something went wrong.'],
  ];
  return (
    <>
      <div className="overflow-hidden rounded-md border border-border">
        <div className="chrome grid grid-cols-2 border-b border-border bg-surface px-4 py-2"><span>write</span><span>not</span></div>
        {rows.map(([d, n]) => (
          <div key={d} className="grid grid-cols-2 gap-4 border-b border-border px-4 py-2.5 text-sm last:border-0">
            <span className="font-mono text-xs">{d}</span>
            <span className="flex items-center gap-1.5 font-mono text-xs text-faint-foreground"><XIcon className="size-3 shrink-0" />{n}</span>
          </div>
        ))}
      </div>
      <ul className="mt-6 grid max-w-[70ch] gap-2 text-sm text-muted-foreground">
        <li>Sentence case everywhere. Uppercase only for machine states and route names.</li>
        <li>Labels are lowercase keys, the way a config file names things: <span className="font-mono text-foreground">cpu</span>, <span className="font-mono text-foreground">last deploy</span>.</li>
        <li>No middle-dot taglines strung together for rhythm. A "·" separates two real readings, nothing else.</li>
        <li>No "→" glued onto links. Links say where they go.</li>
        <li>Errors state what failed and what you're seeing instead. They don't apologise.</li>
      </ul>
    </>
  );
}

/* ───────────────────────────── page ───────────────────────────── */

export function StyleGuide() {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="relative">
        <header className="pb-12">
          <p className="chrome mb-4">c2k.page / design system / v1</p>
          <Scramble as="h1" trigger="mount" text="Outer Sunset" className="font-display text-6xl sm:text-7xl" />
          <p className="mt-5 max-w-[60ch] text-lg text-muted-foreground">
            The visual language for c2k.page: a system monitor for one person's life. Named for the neighbourhood it's built in, at the hour the sky goes violet over the Pacific and the last orange sits on the water.
          </p>
          <nav aria-label="Sections" className="mt-8 flex flex-wrap gap-1.5">
            {SECTIONS.map(([id, label]) => (
              <Button key={id} asChild variant="chrome"><a href={`#${id}`}>{label}</a></Button>
            ))}
          </nav>
        </header>

        <Section id="principles" title="Principles" lede="Four rules that decide every argument. When a choice isn't covered below, go back to these.">
          <Principles />
        </Section>
        <Section id="color" title="Colour" lede="Dark by default, with a violet cast like the sky after sundown. Brand colour is spent on action and change; status and routes have their own vocabularies so meaning never collides with decoration.">
          <Color />
        </Section>
        <Section id="type" title="Type" lede="Two families with clearly different jobs: a proportional voice for names and words, and a monospace instrument for everything the machine says.">
          <Type />
        </Section>
        <Section id="shape" title="Shape & depth" lede="Corners and light carry hierarchy, so one radius and one shadow never get stamped on everything.">
          <Shape />
        </Section>
        <Section id="motion" title="Motion" lede="Motion is data resolving. It happens once on arrival, or in answer to the visitor — never as ambient decoration with nothing behind it.">
          <Motion />
        </Section>
        <Section id="status" title="Status vocabulary" lede="Operational words, each with exactly one meaning. These are the only uppercase strings on the site.">
          <StatusSection />
        </Section>
        <Section id="components" title="Components" lede="shadcn/ui primitives (Radix under the hood), restyled to the tokens. Import from @/components/ui/*.">
          <Components />
        </Section>
        <Section id="patterns" title="Patterns" lede="System primitives composed into the site's recurring shapes. Import from @/components/system.">
          <Patterns />
        </Section>
        <Section id="writing" title="Writing" lede="Copy is part of the instrument. It reports, plainly, in the system's voice.">
          <Writing />
        </Section>
      </div>
    </TooltipProvider>
  );
}
