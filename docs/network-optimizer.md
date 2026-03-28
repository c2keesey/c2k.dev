# Network Optimizer — Hidden Idle Game

## Concept

An invisible idle/incremental game layered onto the project dashboard. Users who never discover it see zero difference — the dashboard works exactly as before. Users who find it can optimize resource flow through the project network by upgrading nodes and connections.

"Resource flow optimization" not "tower defense." No enemies, no losing, no waves, no combat.

## Discovery

- Each node has a faint throughput counter near its status dot: `0.0/s` in monospace chrome style
- A small `[?]` badge on one node (c2k, the "core") hints at interactivity
- Right-clicking any node (or long-press on mobile) while the game is undiscovered shows a one-time tooltip:
  **"NETWORK OPTIMIZER — Right-click nodes to boost throughput."** with `[ACTIVATE]`
- Dismissable. No forced interruption.

## Mechanics

### Resources
- Single currency: **throughput (TP)**, measured in units/sec
- Each node generates base TP passively (0.1/s)
- TP flows along connections as visible particles (repurposing existing flow particles)
- Global TP pool accumulates over time

### Node Upgrades (4 levels: 0-3)
| Level | Generation | Visual | Cost |
|-------|-----------|--------|------|
| 0 | 0.1/s (base) | No change | — |
| 1 | 0.15/s (+50%) | Subtle inner glow ring | 10 TP |
| 2 | 0.2/s (+100%) | Brighter glow, faster particles | 30 TP |
| 3 | 0.3/s (+200%) | Active pulse, clear glow | 80 TP |

### Connection Upgrades (3 levels: 0-2)
| Level | Effect | Visual | Cost |
|-------|--------|--------|------|
| 0 | 1x flow | Normal dashed line | — |
| 1 | 2x flow speed | Slightly thicker/brighter line | 15 TP |
| 2 | 3x flow, 2x particle density | Solid line, brighter | 50 TP |

### Network Effect
- TP flowing into a node from connections gives a small bonus to that node's generation (+5% per incoming upgraded connection)
- This creates meaningful upgrade path decisions

### Score
- Total network throughput shown in dashboard header: `9 SYSTEMS NOMINAL — 4.7 TP/s`
- No win/loss. Just optimization. Number goes up.

## Interaction Model (Critical)

**Left-click is NEVER hijacked.** All existing dashboard behavior is preserved:

| Action | Result |
|--------|--------|
| Left-click compact node | Expand (State 2) — unchanged |
| Left-click expanded node | Showcase (State 3) — unchanged |
| Hover node | Highlight connections — unchanged |
| **Right-click node** | Game: show upgrade menu |
| **Right-click connection label** | Game: show connection upgrade menu |

### Upgrade Menu
- Small radial or tooltip popup near the node
- Shows: current level, next level cost, TP/s improvement
- Single click to confirm upgrade
- Disappears on click-away

## Persistence
- All state in `localStorage` under key `network-optimizer`
- Stores: node levels, connection levels, accumulated TP, total earned TP, activated flag
- TP accumulates even while away (calculated on load from timestamp delta, capped at 8h offline)

## Visual Integration
- Throughput counters: same monospace chrome as status labels
- Node glow: uses node's existing `--node-color` with varying `box-shadow` intensity
- Connection upgrades: modify existing edge opacity/thickness/dash pattern
- Game HUD: minimal frosted glass card, bottom-right corner, only visible when activated
- No screen shake, no enemies, no combat effects

## What Changes in Codebase

### New file: `src/game/optimizer.ts`
- Game state management (load/save/tick)
- Upgrade logic and costs
- TP calculation engine
- Offline accumulation

### Modified: `src/components/DesktopDashboard.astro`
- Import and initialize optimizer
- Add right-click handlers on nodes and edge labels
- Render throughput counters on nodes
- Render upgrade popup UI
- Add game HUD element (bottom-right)
- Modify particle system to reflect connection upgrade levels
- Add TP/s to dashboard header

### NOT modified
- Mobile layout (game is desktop-only for now)
- Showcase components
- API endpoints
- Any left-click behavior
