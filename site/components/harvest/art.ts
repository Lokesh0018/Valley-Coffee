// Harvest hero: palette + generators (hills, plantation rows, coffee trees). Everything is drawn in code in one
// 1920 × 1080 "scene" space (the stage in HarvestHero scales it to the screen). Deterministic: same art every load.

export const SCENE_W = 1920;
export const SCENE_H = 1080;

export const C = {
  // foliage
  forest: "#2f5233",
  forestDeep: "#24402a",
  leaf: "#3f6a3c",
  fresh: "#6f9a4a",
  freshLight: "#8db35a",
  leafLine: "#1d3420",
  vein: "#a9c77e",
  branch: "#5a4330",
  // cherries
  red: "#b8322a",
  ripe: "#9c2a2e",
  burgundy: "#7d1f2a",
  turning: "#c9692f",
  unripe: "#9aa548",
  cherryLine: "#5a1a1a",
  // earth + craft
  soil: "#a8683f",
  soilDark: "#8a4f30",
  soilLine: "#6e3d24",
  bamboo: "#d9b98a",
  bambooMid: "#c4a06c",
  bambooDark: "#9a7647",
  weaveLine: "#7a5a33",
  // people
  hair: "#2a1c16",
  gold: "#d4a63a",
};

export function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
export const f1 = (n: number) => Math.round(n * 10) / 10;

/** A rolling crest: y at x, from a sum of sine waves (soft Eastern Ghats hills). */
export function crest(seed: number, base: number, amp: number, waves: number) {
  const r = rng(seed);
  const parts = [1, 0.42, 0.18].map((a, i) => ({ a, f: (waves * (i * 1.9 + 1) * Math.PI * 2) / SCENE_W, p: r() * Math.PI * 2 }));
  const norm = parts.reduce((s, w) => s + w.a, 0);
  return (x: number) => base - (amp * parts.reduce((s, w) => s + w.a * Math.sin(x * w.f + w.p), 0)) / norm;
}

/** Closed hill path from a crest function, filled down to `bottom`. */
export function hillPath(y: (x: number) => number, bottom = 1120, x0 = -160, x1 = 2080) {
  let d = `M${x0} ${bottom} L${x0} ${f1(y(x0))}`;
  for (let x = x0 + 16; x <= x1; x += 16) d += ` L${x} ${f1(y(x))}`;
  return d + ` L${x1} ${bottom} Z`;
}

// ---------- coffee trees ----------

export type Leaf = { x: number; y: number; a: number; l: number; w: number; c: string; k: number };
export type Cherry = { x: number; y: number; r: number; c: string };
export type Lateral = { d: string; ox: number; oy: number; width: number; leaves: Leaf[]; cherries: Cherry[]; amp: number; period: number; phase: number };

/** Bounding box [x, y, w, h] of some branches (leaves reach out by their length). */
export function branchBox(lats: { ox: number; oy: number; leaves: Leaf[]; cherries: Cherry[] }[]): [number, number, number, number] {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const lat of lats) {
    const pts = [{ x: lat.ox, y: lat.oy, p: 6 }, ...lat.leaves.map((l) => ({ x: l.x, y: l.y, p: l.l + 2 })), ...lat.cherries.map((c) => ({ x: c.x, y: c.y, p: c.r + 2 }))];
    for (const q of pts) {
      x0 = Math.min(x0, q.x - q.p);
      y0 = Math.min(y0, q.y - q.p);
      x1 = Math.max(x1, q.x + q.p);
      y1 = Math.max(y1, q.y + q.p);
    }
  }
  return [Math.floor(x0), Math.floor(y0), Math.ceil(x1 - x0), Math.ceil(y1 - y0)];
}
export type Tree = { stem: string; stemWidth: number; laterals: Lateral[]; box: [number, number, number, number] };

const CHERRY_TONES: [string, number][] = [
  [C.red, 0.4],
  [C.ripe, 0.2],
  [C.burgundy, 0.24],
  [C.turning, 0.09],
  [C.unripe, 0.07],
];
function cherryTone(r: () => number) {
  let v = r();
  for (const [c, p] of CHERRY_TONES) {
    if ((v -= p) <= 0) return c;
  }
  return C.red;
}
function leafTone(r: () => number, t: number) {
  const v = r() + t * 0.35;
  return v > 1.05 ? C.freshLight : v > 0.78 ? C.fresh : v > 0.42 ? C.leaf : C.forest;
}

type Q = { sx: number; sy: number; cx: number; cy: number; ex: number; ey: number };
const qAt = (q: Q, u: number) => {
  const a = (1 - u) * (1 - u);
  const b = 2 * u * (1 - u);
  const c = u * u;
  return {
    x: a * q.sx + b * q.cx + c * q.ex,
    y: a * q.sy + b * q.cy + c * q.ey,
    ang: Math.atan2(2 * (1 - u) * (q.cy - q.sy) + 2 * u * (q.ey - q.cy), 2 * (1 - u) * (q.cx - q.sx) + 2 * u * (q.ex - q.cx)),
  };
};

/** Leaves (opposite pairs) and cherry clusters (at the nodes, hugging the branch) along one branch curve. */
export function dressBranch(q: Q, r: () => number, o: { leafScale: number; cherryR: number; t: number; cherries?: number }) {
  const len = Math.hypot(q.ex - q.sx, q.ey - q.sy);
  const nodes = Math.max(2, Math.floor(len / (19 * o.leafScale)));
  const leaves: Leaf[] = [];
  const cherries: Cherry[] = [];
  for (let k = 1; k <= nodes; k++) {
    const u = k / (nodes + 0.25);
    const p = qAt(q, u);
    for (const s of [-1, 1]) {
      let a = p.ang + s * ((52 + r() * 16) * Math.PI) / 180;
      a += (Math.PI / 2 - a) * 0.16; // a little droop
      const l = o.leafScale * (25 + r() * 11) * (1 - 0.32 * u);
      leaves.push({ x: p.x, y: p.y, a: (a * 180) / Math.PI, l, w: l * (0.34 + r() * 0.08), c: leafTone(r, o.t), k: r() });
    }
    const want = o.cherries ?? 0.8;
    if (u > 0.14 && u < 0.86 && k % 2 === 0 && r() < want) {
      const n = 3 + Math.floor(r() * 4);
      for (let j = 0; j < n; j++) {
        const phi = (j / n) * Math.PI * 2 + r();
        const cr = o.cherryR * (0.88 + r() * 0.24);
        cherries.push({
          x: p.x + Math.cos(phi) * o.cherryR * 1.25,
          y: p.y + Math.abs(Math.sin(phi)) * o.cherryR * 1.05 + o.cherryR * 0.35,
          r: cr,
          c: cherryTone(r),
        });
      }
    }
  }
  // a pair of young leaves at the tip
  const tip = qAt(q, 1);
  for (const s of [-1, 1]) {
    const l = o.leafScale * (16 + r() * 6);
    leaves.push({ x: tip.x, y: tip.y, a: ((tip.ang + (s * 22 * Math.PI) / 180) * 180) / Math.PI, l, w: l * 0.36, c: C.freshLight, k: r() });
  }
  return { leaves, cherries };
}

export type TreeOpts = {
  seed: number;
  x: number;
  base: number;
  height: number;
  spread: number;
  n: number;
  lean?: number;
  leafScale?: number;
  cherryR?: number;
  /** only grow laterals on this side (framing tree) */
  side?: -1 | 1;
  /** laterals only above this height fraction */
  minT?: number;
  sway?: number;
  /** share of nodes that carry a cherry cluster */
  cherries?: number;
  /** shorten the branches on the left side (keeps a tree clear of text beside it) */
  leftScale?: number;
};

/** A coffee tree: one stem, laterals in a cone (long low, short high), drooping a little, leaves in opposite
 *  pairs and cherries in clusters along the branches, as coffee really grows. */
export function coffeeTree(o: TreeOpts): Tree {
  const r = rng(o.seed);
  const lean = o.lean ?? 0;
  const ls = o.leafScale ?? 1;
  const cr = o.cherryR ?? 5.5;
  const minT = o.minT ?? 0.1;
  const top = { x: o.x + lean, y: o.base - o.height };
  // The stem runs along exactly the line every lateral leaves from (x + lean·t², base − height·t), all the way to
  // the top lateral, so no branch ever floats; it tapers from a trunk at the ground to a thin leader at the top.
  const stemAt = (t: number) => ({ x: o.x + lean * t * t, y: o.base - o.height * t });
  const topT = 0.985;
  const sw = 7 * ls;
  const side: string[] = [];
  const back: string[] = [];
  for (let k = 0; k <= 24; k++) {
    const t = (topT * k) / 24;
    const p = stemAt(t);
    const w = (sw * (1 - 0.82 * t)) / 2;
    side.push(`${f1(p.x - w)} ${f1(p.y)}`);
    back.unshift(`${f1(p.x + w)} ${f1(p.y)}`);
  }
  const stem = `M${side.join(" L")} L${back.join(" L")} Z`;
  const laterals: Lateral[] = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < o.n; i++) {
    const t = minT + (0.97 - minT) * (i / Math.max(1, o.n - 1));
    const side = o.side ?? (i % 2 ? 1 : -1) * (r() < 0.12 ? -1 : 1);
    const sx = o.x + lean * t * t;
    const sy = o.base - o.height * t;
    const L = o.spread * (1 - 0.62 * t) * (0.78 + r() * 0.44) * (side < 0 ? (o.leftScale ?? 1) : 1);
    const q = {
      sx,
      sy,
      cx: sx + side * L * 0.5,
      cy: sy - L * (0.16 + r() * 0.1),
      ex: sx + side * L,
      ey: sy + L * (0.08 + r() * 0.12),
    };
    const { leaves, cherries } = dressBranch(q, r, { leafScale: ls * (1 - 0.15 * t), cherryR: cr, t, cherries: o.cherries });
    laterals.push({
      d: `M${f1(q.sx)} ${f1(q.sy)} Q${f1(q.cx)} ${f1(q.cy)} ${f1(q.ex)} ${f1(q.ey)}`,
      ox: q.sx,
      oy: q.sy,
      width: 2.6 * ls * (1 - 0.4 * t),
      leaves,
      cherries,
      amp: (o.sway ?? 1.2) * (0.6 + r() * 0.8) * (0.6 + t * 0.6),
      period: 3.6 + r() * 2.6,
      phase: r() * Math.PI * 2,
    });
    for (const p of [...leaves.map((l) => ({ x: l.x, y: l.y })), { x: q.ex, y: q.ey }]) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
  }
  const pad = 50 * ls;
  minX = Math.min(minX, o.x) - pad;
  maxX = Math.max(maxX, o.x) + pad;
  minY = Math.min(minY, top.y) - pad;
  maxY = Math.max(maxY, o.base) + 10;
  return { stem, stemWidth: sw, laterals, box: [Math.floor(minX), Math.floor(minY), Math.ceil(maxX - minX), Math.ceil(maxY - minY)] };
}

/** Leaf outline in local space (base at 0,0, tip at l,0); k varies the shape a little (hand-drawn). */
export function leafPath(l: number, w: number, k: number) {
  const a = 0.26 + k * 0.1;
  const b = 0.68 + k * 0.08;
  return `M0 0C${f1(l * a)} ${f1(-w * (1 + k * 0.15))} ${f1(l * b)} ${f1(-w * 0.92)} ${f1(l)} 0C${f1(l * (b + 0.04))} ${f1(w * 0.8)} ${f1(l * (a + 0.04))} ${f1(w * (1.05 - k * 0.1))} 0 0Z`;
}
