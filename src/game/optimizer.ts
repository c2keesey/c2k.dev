// Network Optimizer — hidden idle game engine
// Manages TP (throughput) generation, upgrades, and persistence

export interface NodeState {
  id: string;
  level: number; // 0-3
  baseRate: number; // TP/s at level 0
}

export interface EdgeState {
  index: number;
  fromId: string;
  toId: string;
  level: number; // 0-2
}

export interface GameState {
  activated: boolean;
  tp: number; // current accumulated TP
  totalEarned: number;
  nodes: Record<string, NodeState>;
  edges: EdgeState[];
  lastTick: number; // timestamp for offline accumulation
}

const STORAGE_KEY = 'network-optimizer';

// Upgrade costs
const NODE_COSTS = [0, 10, 30, 80]; // cost to reach level N
const EDGE_COSTS = [0, 15, 50];

// Generation multipliers per node level
const NODE_GEN = [0.1, 0.15, 0.2, 0.3]; // TP/s

// Flow speed multipliers per edge level
const EDGE_FLOW = [1, 2, 3];

// Particle density multipliers per edge level
const EDGE_DENSITY = [1, 1, 2];

// Network bonus: +5% per incoming upgraded connection
const NETWORK_BONUS = 0.05;

// Max offline accumulation: 8 hours
const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;

export class NetworkOptimizer {
  state: GameState;
  private nodeIds: string[];
  private edgeData: { fromId: string; toId: string }[];
  private listeners: Set<() => void> = new Set();

  constructor(nodeIds: string[], edgeData: { fromId: string; toId: string }[]) {
    this.nodeIds = nodeIds;
    this.edgeData = edgeData;
    this.state = this.load();
    this.processOfflineAccumulation();
  }

  private defaultState(): GameState {
    const nodes: Record<string, NodeState> = {};
    for (const id of this.nodeIds) {
      nodes[id] = { id, level: 0, baseRate: 0.1 };
    }
    const edges: EdgeState[] = this.edgeData.map((e, i) => ({
      index: i,
      fromId: e.fromId,
      toId: e.toId,
      level: 0,
    }));
    return {
      activated: false,
      tp: 0,
      totalEarned: 0,
      nodes,
      edges,
      lastTick: Date.now(),
    };
  }

  private load(): GameState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.defaultState();
      const saved = JSON.parse(raw) as Partial<GameState>;
      const def = this.defaultState();

      // Merge saved state with defaults (handles new nodes/edges added later)
      return {
        activated: saved.activated ?? false,
        tp: saved.tp ?? 0,
        totalEarned: saved.totalEarned ?? 0,
        nodes: { ...def.nodes, ...saved.nodes },
        edges: def.edges.map((de, i) => {
          const se = saved.edges?.[i];
          return se ? { ...de, level: se.level } : de;
        }),
        lastTick: saved.lastTick ?? Date.now(),
      };
    } catch {
      return this.defaultState();
    }
  }

  save(): void {
    this.state.lastTick = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  private processOfflineAccumulation(): void {
    if (!this.state.activated) return;
    const now = Date.now();
    const elapsed = Math.min(now - this.state.lastTick, MAX_OFFLINE_MS);
    if (elapsed > 5000) { // only accumulate if >5s away
      const rate = this.getTotalRate();
      const earned = rate * (elapsed / 1000);
      this.state.tp += earned;
      this.state.totalEarned += earned;
    }
    this.state.lastTick = now;
    this.save();
  }

  // Called every frame with dt in seconds
  tick(dt: number): void {
    if (!this.state.activated) return;
    const rate = this.getTotalRate();
    const earned = rate * dt;
    this.state.tp += earned;
    this.state.totalEarned += earned;
  }

  // Total network TP/s
  getTotalRate(): number {
    let total = 0;
    for (const id of this.nodeIds) {
      total += this.getNodeRate(id);
    }
    return total;
  }

  // Individual node TP/s (including network bonuses)
  getNodeRate(id: string): number {
    const node = this.state.nodes[id];
    if (!node) return 0;
    const base = NODE_GEN[node.level] ?? 0.1;

    // Count incoming upgraded connections
    let bonus = 0;
    for (const edge of this.state.edges) {
      if (edge.toId === id && edge.level > 0) {
        bonus += NETWORK_BONUS * edge.level;
      }
      if (edge.fromId === id && edge.level > 0) {
        bonus += NETWORK_BONUS * edge.level;
      }
    }

    return base * (1 + bonus);
  }

  // Upgrade a node. Returns true if successful.
  upgradeNode(id: string): boolean {
    const node = this.state.nodes[id];
    if (!node || node.level >= 3) return false;
    const cost = NODE_COSTS[node.level + 1];
    if (this.state.tp < cost) return false;
    this.state.tp -= cost;
    node.level++;
    this.save();
    this.notify();
    return true;
  }

  // Upgrade an edge. Returns true if successful.
  upgradeEdge(index: number): boolean {
    const edge = this.state.edges[index];
    if (!edge || edge.level >= 2) return false;
    const cost = EDGE_COSTS[edge.level + 1];
    if (this.state.tp < cost) return false;
    this.state.tp -= cost;
    edge.level++;
    this.save();
    this.notify();
    return true;
  }

  getNodeUpgradeCost(id: string): number | null {
    const node = this.state.nodes[id];
    if (!node || node.level >= 3) return null;
    return NODE_COSTS[node.level + 1];
  }

  getEdgeUpgradeCost(index: number): number | null {
    const edge = this.state.edges[index];
    if (!edge || edge.level >= 2) return null;
    return EDGE_COSTS[edge.level + 1];
  }

  getEdgeFlowMultiplier(index: number): number {
    const edge = this.state.edges[index];
    return EDGE_FLOW[edge?.level ?? 0] ?? 1;
  }

  getEdgeDensityMultiplier(index: number): number {
    const edge = this.state.edges[index];
    return EDGE_DENSITY[edge?.level ?? 0] ?? 1;
  }

  activate(): void {
    this.state.activated = true;
    this.state.lastTick = Date.now();
    this.save();
    this.notify();
  }

  reset(): void {
    this.state = this.defaultState();
    this.save();
    this.notify();
  }

  onChange(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    for (const fn of this.listeners) fn();
  }
}
