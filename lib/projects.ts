export type ProjectLifecycle = "live-public" | "active-private" | "maintained" | "prototype" | "historical" | "completed-artifact" | "research-monitoring";
export type TruthConfidence = "high" | "medium" | "low";

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  story: string;
  category: string;
  lifecycle: ProjectLifecycle;
  confidence: TruthConfidence;
  basis: string;
  accent: string;
  stack: readonly string[];
  highlights: readonly string[];
  links?: readonly ProjectLink[];
  featured?: boolean;
  workInProgress?: boolean;
}

export interface ProjectConnection {
  from: Project["slug"];
  to: Project["slug"];
  label: string;
}

export const projects: readonly Project[] = [
  {
    slug: "maia", name: "MAIA", tagline: "AI geospatial platform", category: "startup", lifecycle: "active-private", confidence: "high", basis: "Active private product repository and public company site.", accent: "cyan", featured: true,
    description: "Ask a question about a property, get a map back. My day job: LLM orchestration, agent workflows, and the property data pipelines underneath.",
    story: "The product makes complex property intelligence feel conversational without pretending the underlying data is simple. A useful answer has to survive both model uncertainty and the unforgiving reality of a map.",
    stack: ["TypeScript", "Python", "FastAPI", "Postgres", "GCP"],
    highlights: ["Natural-language geospatial workflows", "Agent orchestration with auditable data paths", "Production property-data infrastructure"],
    links: [{ label: "maia-analytics.com", href: "https://maia-analytics.com" }],
  },
  {
    slug: "c2k", name: "c2k.page", tagline: "This website", category: "web", lifecycle: "live-public", confidence: "high", basis: "Public site and repository are reachable; source matches the deployment architecture.", accent: "violet", featured: true,
    description: "This site: a typed React application on the OptiPlex under my desk, exposed through a Cloudflare Tunnel and built as a real home for every project.",
    story: "The site began as a hand-built Astro control surface. This foundation turns it into a durable project atlas: real routes, one data model, server-rendered deep links, and room for each project to become a story instead of a card.",
    stack: ["Next.js", "React", "TypeScript", "shadcn/ui", "Bun", "Cloudflare"],
    highlights: ["Runtime-gated private surfaces", "Live OptiPlex telemetry", "Standalone Node-compatible deployment"],
    links: [{ label: "c2k.page", href: "https://c2k.page" }],
  },
  {
    slug: "flux", name: "Flux Gauntlet", tagline: "Cylindrical LED wearable", category: "hardware", lifecycle: "completed-artifact", confidence: "high", basis: "Local PlatformIO/Arduino source and configuration verify the hardware model and effects.", accent: "orange", featured: true,
    description: "A 300-LED wearable arranged as 16 rings and addressed as a 3D cylinder so procedural effects travel around and along the arm.",
    story: "The geometry is the trick. Treating the wearable as a cylinder lets more than fifteen source-defined effects move through space with intent; blast, lightning, fire, Casimir, twinkle, and pew are representative modes, not the whole set.",
    stack: ["C++", "PlatformIO", "Arduino", "Heltec ESP32", "FastLED", "U8g2", "WS2812"],
    highlights: ["300 individually addressed LEDs", "Cylindrical 3D effect coordinates", "More than fifteen procedural effects"],
    links: [{ label: "github/Flux-Gauntlet", href: "https://github.com/c2keesey/Flux-Gauntlet" }],
  },
  {
    slug: "corne", name: "Corne", tagline: "42-key ZMK split keyboard", category: "hardware", lifecycle: "maintained", confidence: "high", basis: "Current configuration and public repository were updated in 2026.", accent: "cyan",
    description: "An actively used 42-key wireless split keyboard with eight ZMK layers, home-row mods, combos, mouse controls, Unicode, and symbol layers.",
    story: "A small keyboard is less about minimalism than proximity: every command is brought under the hands, then tuned until thought and action stop feeling separate.",
    stack: ["ZMK", "Devicetree", "C preprocessor", "west", "Nix", "Bluetooth"],
    highlights: ["Eight layers: base, nav, fn, num, sys, mouse, uc, sym", "Wireless split layout", "Combos and home-row modifiers"],
    links: [{ label: "github/zmk-config-corne-2", href: "https://github.com/c2keesey/zmk-config-corne-2" }],
  },
  {
    slug: "spotify", name: "Spotify Macro", tagline: "Library auto-sorter", category: "automation", lifecycle: "active-private", confidence: "high", basis: "Active private repository, current launchd jobs, and benchmark documentation.", accent: "green", featured: true,
    description: "Keeps my Spotify library sorted automatically. Metadata and a 30-second audio embedding decide which folder a new song belongs in.",
    story: "The library is cached locally so classification works offline. Adding the audio head moved folder accuracy from .800 to .878—enough to make the automation disappear into daily use.",
    stack: ["Python", "Spotify API", "EfficientNet", "scikit-learn", "launchd"],
    highlights: ["Offline whole-library cache", "Metadata plus audio ensemble", ".878 measured folder accuracy"],
  },
  {
    slug: "dashboard", name: "OptiPlex Dashboard", tagline: "Mobile server-monitor prototype", category: "infrastructure", lifecycle: "prototype", confidence: "high", basis: "Private repository source does not implement the production claims previously shown on the site.", accent: "rose",
    description: "A private prototype with an Express/systeminformation backend and an Expo React Native client currently driven by mock data.",
    story: "The OptiPlex is the physical center of this system. This prototype explores a mobile information hierarchy for it while keeping the boundary honest: host-metric collection exists, but the current client telemetry, sparklines, cron state, and agent-session views are mocked.",
    stack: ["Express", "TypeScript", "systeminformation", "Expo 54", "React Native 0.81", "React 19", "React Navigation", "Reanimated"],
    highlights: ["Implemented host-metric backend", "Prototype mobile information hierarchy", "Clearly separated synthetic client telemetry"],
  },
  {
    slug: "dotfiles", name: "Dotfiles", tagline: "Dev environment system", category: "tooling", lifecycle: "active-private", confidence: "high", basis: "Private repository is actively updated and is the source of the current environment.", accent: "violet", featured: true,
    description: "One repo for shell, editor, keybindings, and coding-agent skills and hooks. A new machine becomes familiar with a clone and a script.",
    story: "The repository is less a collection of settings than the executable memory of how work gets done across macOS and Linux.",
    stack: ["Bash", "Zsh", "Claude Code", "Tmux", "Ghostty"],
    highlights: ["Cross-machine source of truth", "Agent skills and hooks", "Symlink-driven installation"],
    links: [{ label: "github/dotfiles", href: "https://github.com/c2keesey/dotfiles" }],
  },
  {
    slug: "secretgate", name: "Secret Gate", tagline: "Human-in-the-loop gate", category: "security", lifecycle: "prototype", confidence: "high", basis: "Public repository and its research document describe the workflow and bypass limitations.", accent: "red", workInProgress: true,
    description: "An agent requesting a 1Password secret or sudo command has to ask my phone first. Nothing runs without an explicit Telegram answer.",
    story: "The point is not a clever permission system. It is a crisp interruption at the moment an autonomous tool crosses from reversible work into authority that belongs to a person.",
    stack: ["Python", "1Password CLI", "Telegram", "Claude Code"],
    highlights: ["Explicit mobile approvals", "Pre-tool-use enforcement", "Auditable allow/deny decisions"],
    links: [{ label: "github/secret-gate", href: "https://github.com/c2keesey/secret-gate" }],
  },
  {
    slug: "techdigest", name: "Tech Digest", tagline: "Daily release digest", category: "automation", lifecycle: "maintained", confidence: "high", basis: "Public source verifies scrapers, state tracking, summarization, delivery, scheduling, and bot control.", accent: "violet",
    description: "Pulls release notes for everything in my stack, has Claude read them, and sends the short version on Telegram.",
    story: "The same bot can drive a headless coding-agent session from a phone, turning release monitoring and remote maintenance into one quiet background loop.",
    stack: ["Python", "Claude CLI", "Telegram", "GitHub API", "cron"],
    highlights: ["Multi-source release monitoring", "LLM-compressed daily briefings", "Remote agent control"],
    links: [{ label: "github/tech-digest", href: "https://github.com/c2keesey/tech-digest" }],
  },
  {
    slug: "lightning", name: "Lightning Cloud", tagline: "Procedural lightning lamp", category: "hardware", lifecycle: "completed-artifact", confidence: "high", basis: "Public source contains the original Arduino implementation and exact strip geometry.", accent: "indigo",
    description: "A completed cloud lamp whose Arduino/FastLED code generates branching bolts across four LED strips totaling 221 pixels, then flashes and fades them without animation files.",
    story: "Four strips—95, 27, 61, and 38 pixels—become one storm surface. Generic Arduino code creates a primary bolt and branching forks, then layers a four-flash and fade sequence so deterministic code still feels organic.",
    stack: ["C++", "Arduino", "FastLED", "WS2812"],
    highlights: ["Four strips totaling 221 pixels", "Runtime primary bolts and branching forks", "Four-flash procedural fade sequence"],
    links: [{ label: "github/LightningCloud", href: "https://github.com/c2keesey/LightningCloud" }],
  },
  {
    slug: "propeller", name: "Propeller Scrape", tagline: "Concert ticket monitor", category: "utility", lifecycle: "maintained", confidence: "medium", basis: "Public source and recent repository activity verify implementation; current scheduler health was not probed.", accent: "orange",
    description: "Watches Propeller rewards for concert tickets in LA, SF, and Boulder and sends a Telegram alert when something good appears.",
    story: "It runs on cron and succeeds by being forgettable: a small watcher that turns a repetitive search into the occasional useful message.",
    stack: ["Python", "BeautifulSoup", "Telegram", "cron"],
    highlights: ["Three-city monitoring", "Change-aware alerts", "Unattended cron operation"],
    links: [{ label: "github/propeller-scrape", href: "https://github.com/c2keesey/propeller-scrape" }],
  },
  {
    slug: "panecmd", name: "Pane Skill", tagline: "Claude tmux side pane", category: "tooling", lifecycle: "maintained", confidence: "medium", basis: "Public standalone repository verifies the capability and its maintained plugin incarnation.", accent: "red",
    description: "A coding-agent skill that sends files, diffs, and command output to a managed tmux side pane instead of flooding the chat log.",
    story: "Each artifact is routed through Helix, delta, or less based on what it is. The result is a workspace where conversation and inspection each get the surface they deserve.",
    stack: ["Bash", "tmux", "Claude Code", "Helix"],
    highlights: ["Content-aware viewer routing", "Managed pane lifecycle", "Lower-noise agent sessions"],
    links: [{ label: "github/claude-pane-skill", href: "https://github.com/c2keesey/claude-pane-skill" }],
  },
  {
    slug: "playlistai", name: "Playlist AI", tagline: "ML playlist sorter", category: "machine learning", lifecycle: "historical", confidence: "high", basis: "Public repository and notebooks document the experiment; no recent product activity is claimed.", accent: "green",
    description: "The first attempt at auto-sorting liked songs, comparing random forests, gradient boosting, SVMs, and a small neural net on my playlists.",
    story: "It predates the current audio-embedding system and records the exploratory phase: several model families, personal ground truth, and a practical benchmark instead of a demo metric.",
    stack: ["Python", "scikit-learn", "Jupyter", "Spotify API"],
    highlights: ["Four model families compared", "Personal-playlist evaluation", "Precursor to Spotify Macro"],
    links: [{ label: "github/spotify-playlist-ai", href: "https://github.com/c2keesey/spotify-playlist-ai" }],
  },
  {
    slug: "djtrainer", name: "DJ Trainer", tagline: "Interactive DJ-controller learning prototype", category: "learning", lifecycle: "prototype", confidence: "high", basis: "Private source and project instructions make manual CSS hotspot positions authoritative.", accent: "pink",
    description: "A private vanilla-web prototype with manually authored hotspots that let learners click a DDJ-FLX4 control and read what it does.",
    story: "The runtime stays deliberately simple: HTML, CSS, JavaScript, and hand-positioned hotspots turn an unfamiliar control surface into a spatial learning tool. Separate SAM and CoreML scripts explore assisted authoring; they are experiments, not the application runtime.",
    stack: ["HTML", "CSS", "JavaScript", "live-server", "Python experiments", "SAM experiments", "CoreML experiments"],
    highlights: ["Manual interactive control map", "Spatial learning instead of a linear manual", "Separate, honestly labeled ML authoring experiments"],
  },
  {
    slug: "songsorter", name: "Song Sorter", tagline: "Keyboard-first Spotify triage", category: "web app", lifecycle: "prototype", confidence: "high", basis: "Public source implements triage and playlist recommendation; pairwise ranking is absent.", accent: "emerald",
    description: "A React app for reviewing the current Spotify track, ranking likely destination playlists by genre similarity, and preserving undo and history.",
    story: "The current track opens a keyboard-driven decision loop. Candidate playlists are ranked by explainable genre similarity, the choice is applied through Spotify, and undo/history keeps fast human triage recoverable.",
    stack: ["React 18", "TypeScript", "Vite", "Zustand", "Radix UI", "Tailwind CSS", "Spotify Web Playback SDK", "Spotify Web API"],
    highlights: ["Keyboard-first current-track triage", "Genre-similar playlist recommendations", "Undo and decision history"],
    links: [{ label: "github/song-sorter", href: "https://github.com/c2keesey/spotify-song-sorter" }],
  },
  {
    slug: "momentplayer", name: "Moment Player", tagline: "Podcast AI companion", category: "ios", lifecycle: "prototype", confidence: "low", basis: "The local implementation exists as uncommitted working files after an earlier removal.", accent: "indigo", workInProgress: true,
    description: "Pause on a podcast line you did not follow, ask about it, get an answer grounded in the transcript, then keep listening.",
    story: "The product treats confusion as a moment in playback rather than a separate research task, using the transcript window as precise context.",
    stack: ["Swift", "SwiftUI", "Python", "FastAPI", "LLM"],
    highlights: ["Transcript-grounded questions", "Playback-aware context", "Native iOS experience"],
  },
  {
    slug: "alldifferent", name: "All Look Different", tagline: "Face-quiz game", category: "game", lifecycle: "live-public", confidence: "high", basis: "Public repository, deployed site, and Worker source are reachable.", accent: "amber",
    description: "Guess the nationality from the face. Retro arcade styling, a global leaderboard, and Cloudflare Workers behind it.",
    story: "The game is deliberately uncomfortable in the useful way: intuition feels confident, the score disagrees, and the gap becomes the experience.",
    stack: ["JavaScript", "HTML/CSS", "Cloudflare Workers"],
    highlights: ["Fast arcade interaction", "Global leaderboard", "Edge-hosted backend"],
    links: [{ label: "github/all-look-different", href: "https://github.com/c2keesey/All-look-different" }],
  },
  {
    slug: "vibe", name: "Vibe Framework", tagline: "In-app agent, live reload", category: "tooling", lifecycle: "active-private", confidence: "high", basis: "Private source verifies the Astro, SSE, agent-harness, and hot-reload path; no public deployment is claimed.", accent: "violet", workInProgress: true,
    description: "A template with a chat panel on every page, wired to a coding-agent session on the host machine and live-reloaded as it edits.",
    story: "It works from a phone over Tailscale, collapsing the distance between describing a web change and watching that change compile on the actual machine.",
    stack: ["Astro", "TypeScript", "Bun", "Claude Code", "SSE"],
    highlights: ["In-context agent chat", "Live source refresh", "Private mobile access"],
  },
  {
    slug: "polymarket", name: "Polymarket Bot", tagline: "Behavioral edge research", category: "research", lifecycle: "research-monitoring", confidence: "high", basis: "Latest readiness documents require a forward paper gate before capital.", accent: "teal",
    description: "A backtest and paper-trade harness for behavioral biases on prediction markets using public read-only data and no wallet.",
    story: "Most hypotheses died in the gauntlet. The project is valuable because it makes that cheap: propose, backtest, replicate, and keep only what survives.",
    stack: ["Python", "pandas", "Polymarket API"],
    highlights: ["Read-only public data", "Replication-first harness", "No-wallet paper trading"],
  },
  {
    slug: "calsync", name: "Cal Sync", tagline: "Apple Note ↔ Calendar", category: "automation", lifecycle: "active-private", confidence: "medium", basis: "Private source verifies the sync and launchd setup; current runtime health was not probed.", accent: "lime",
    description: "Synchronizes plans from a shared Apple Note to Google Calendar in both directions.",
    story: "The calendar is identified by a durable marker rather than its display name, so a casual rename cannot quietly break the system.",
    stack: ["Python", "Google Calendar API", "AppleScript", "launchd"],
    highlights: ["Bidirectional synchronization", "Rename-safe identity marker", "Native Apple Notes workflow"],
  },
  {
    slug: "agent-console", name: "Agent Console", tagline: "Pocket control room for agent work", category: "private infrastructure", lifecycle: "active-private", confidence: "high", basis: "Current private default branch and the public-safe showcase specification define the product.", accent: "orange", featured: true,
    description: "A phone-first, local/private control plane for an always-on agent: durable chat, typed activity, machine status, automation lifecycle, and push notifications.",
    story: "Agent Console turns the OptiPlex into a system that can be understood and directed from a pocket without pretending the machine is public. A loopback-only Node service owns the agent process and durable session; an installable React PWA reconnects, hydrates, streams normalized events, and surfaces the work from request through worker, PR, CI, and exact-revision deployment. The live service remains private by design.",
    stack: ["Node.js", "React", "TypeScript", "Pi RPC", "systemd", "PWA"],
    highlights: ["Human and automation provenance", "Resource-aware isolated work lifecycle", "Tailnet-only interface with push notifications"],
  },
  {
    slug: "parley", name: "Parley", tagline: "Two-way voice for coding agents", category: "open source", lifecycle: "maintained", confidence: "high", basis: "Public v0.5.4 repository and base checkout verify the current voice, queue, provider, and tmux architecture.", accent: "blue", featured: true,
    description: "Turns terminal coding agents into a real voice loop: replies are spoken as they land, long jobs can narrate themselves, and a wake phrase lets me answer hands-free.",
    story: "One queue keeps every session from talking over the others. Parley is built for actual parallel agent work: voice output, dictation, wake-phrase control, and local tuning that survives the messy reality of a workstation.",
    stack: ["Python", "Claude Code", "Codex", "OpenAI", "whisper.cpp", "tmux"],
    highlights: ["Cross-agent speech queue", "Hands-free wake phrase", "Local trigger tuning and backup"],
    links: [{ label: "github/parley", href: "https://github.com/c2keesey/parley" }],
  },
] as const;

export const projectConnections = [
  ["maia", "dotfiles", "primary workspace"], ["maia", "c2k", "showcase piece"],
  ["c2k", "dotfiles", "co-hosted on OptiPlex"], ["c2k", "corne", "interactive keymap"],
  ["dotfiles", "corne", "keyboard config"], ["dotfiles", "secretgate", "coding-agent plugin"],
  ["dotfiles", "propeller", "cron on OptiPlex"], ["corne", "flux", "hand-soldered"],
  ["corne", "lightning", "hand-soldered"], ["flux", "lightning", "ESP32 + FastLED"],
  ["corne", "spotify", "hotkey macros"], ["spotify", "propeller", "background automation"],
  ["secretgate", "propeller", "Telegram bots"], ["techdigest", "secretgate", "Telegram bots"],
  ["techdigest", "dotfiles", "cron on OptiPlex"], ["dashboard", "c2k", "co-hosted on OptiPlex"],
  ["dashboard", "dotfiles", "monitored services"], ["dashboard", "techdigest", "monitors crons"],
  ["panecmd", "dotfiles", "coding-agent skill"], ["panecmd", "secretgate", "agent tools"],
  ["playlistai", "spotify", "Spotify API"], ["songsorter", "spotify", "Spotify API"],
  ["songsorter", "playlistai", "library sorting"], ["djtrainer", "playlistai", "on-device ML"],
  ["djtrainer", "songsorter", "React web apps"], ["momentplayer", "maia", "LLM backend"],
  ["momentplayer", "c2k", "hand-built UI"], ["alldifferent", "c2k", "Cloudflare"],
  ["alldifferent", "songsorter", "browser frontends"], ["vibe", "c2k", "web + Bun stack"],
  ["vibe", "dotfiles", "coding-agent harness"], ["polymarket", "techdigest", "agent-driven Python"],
  ["polymarket", "propeller", "public API scrapers"], ["calsync", "dotfiles", "launchd config"],
  ["calsync", "spotify", "launchd on the Mac"], ["parley", "dotfiles", "agent skills + hooks"],
  ["parley", "panecmd", "terminal agent tools"], ["agent-console", "c2k", "co-hosted on OptiPlex"],
  ["agent-console", "dotfiles", "agent tooling"], ["agent-console", "dashboard", "service monitoring"],
].map(([from, to, label]) => ({ from, to, label })) as readonly ProjectConnection[];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getConnectedProjects(slug: string) {
  return projectConnections.flatMap((connection) => {
    if (connection.from === slug) return [{ project: getProject(connection.to)!, label: connection.label }];
    if (connection.to === slug) return [{ project: getProject(connection.from)!, label: connection.label }];
    return [];
  });
}

export const projectCategories = [...new Set(projects.map((project) => project.category))].sort();
