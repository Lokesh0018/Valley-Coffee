import { memo } from "react";
import { C, crest, f1, hillPath, leafPath, rng } from "./art";

// The still part of the harvest scene, painted once: warm morning sky, misty Eastern Ghats ridges, a plantation
// hill with rows of coffee bushes under silver oaks, the terracotta path the women stand on, grass, ferns'
// neighbours (small flowers, fallen leaves, dropped cherries) and soft shadows. Watercolour look: edges wobble
// (displacement) and the far washes vary in strength (noise in the alpha), like pigment on paper.
// Also holds the shared <defs> (weave, saree patterns, border motif) used by the other harvest SVGs.

const ridgeFar = crest(3, 470, 55, 1.6);
const ridgeMid = crest(9, 545, 46, 2.3);
const ridgeNear = crest(17, 615, 38, 2.9);
const plantation = crest(29, 694, 26, 1.3);
const groundY = (x: number) => 872 + Math.sin(x / 260) * 6 + Math.sin(x / 90 + 1) * 2.5;

function rows() {
  const r = rng(101);
  const out: { x: number; y: number; rx: number; ry: number; c: string; h: string }[] = [];
  for (let k = 0; k < 10; k++) {
    const off = 14 + k * (13 + k * 3.4);
    const step = 26 + k * 4.5;
    for (let x = -120 + r() * step; x < 2060; x += step * (0.82 + r() * 0.36)) {
      const y = plantation(x) + off;
      if (y > groundY(x) - 4) continue;
      const rx = (9 + k * 2.3) * (0.85 + r() * 0.3);
      out.push({ x, y, rx, ry: rx * (0.58 + r() * 0.1), c: k % 2 ? "#4f7446" : "#587d4b", h: k < 4 ? "#86a46a" : "#7e9d5f" });
    }
  }
  return out;
}
const ROWS = rows();

function oaks() {
  const r = rng(211);
  const out: { x: number; y: number; h: number; s: number }[] = [];
  for (let x = -60 + r() * 120; x < 2000; x += 170 + r() * 160) {
    const o = { x, y: plantation(x) + 26 + r() * 30, h: 170 + r() * 90, s: 0.8 + r() * 0.5 };
    if (x > 940) out.push(o); // tall oaks only on the right: the left of the painting stays calm behind the words
  }
  for (let x = 40 + r() * 200; x < 2000; x += 260 + r() * 220) out.push({ x, y: ridgeNear(x) + 8, h: 70 + r() * 30, s: 0.45 });
  return out;
}
const OAKS = oaks();

function crestShrubs(y: (x: number) => number, seed: number, step: number, size: number) {
  const r = rng(seed);
  let d = "";
  for (let x = -120; x < 2060; x += step * (0.7 + r() * 0.6)) {
    const rx = size * (0.7 + r() * 0.6);
    const ry = rx * (0.6 + r() * 0.3);
    d += `M${f1(x - rx)} ${f1(y(x) + 3)}a${f1(rx)} ${f1(ry)} 0 1 1 ${f1(rx * 2)} 0Z`;
  }
  return d;
}

function groundBits() {
  const r = rng(307);
  const flowers: { x: number; y: number; c: string; s: number }[] = [];
  const tufts: string[] = [];
  const leaves: { x: number; y: number; a: number; l: number; c: string; k: number }[] = [];
  const cherries: { x: number; y: number; r: number; c: string }[] = [];
  for (let x = -100; x < 2040; x += 14 + r() * 22) {
    const y = groundY(x);
    const h = 8 + r() * 14;
    tufts.push(`M${f1(x)} ${f1(y + 3)}q${f1(-2 - r() * 3)} ${f1(-h * 0.6)} ${f1(-4 - r() * 4)} ${f1(-h)}M${f1(x + 3)} ${f1(y + 3)}q${f1(1)} ${f1(-h * 0.7)} ${f1(3 + r() * 3)} ${f1(-h * 0.9)}`);
    if (r() < 0.28) flowers.push({ x: x + r() * 8, y: y - 4 - r() * 8, c: r() < 0.6 ? "#f4ecd8" : "#e8c34a", s: 2 + r() * 1.6 });
  }
  for (let i = 0; i < 26; i++) {
    const x = 960 + r() * 820;
    leaves.push({ x, y: groundY(x) + 22 + r() * 120, a: r() * 360, l: 14 + r() * 10, c: r() < 0.5 ? "#a3893f" : "#7d8d45", k: r() });
  }
  const tones = [C.red, C.burgundy, C.ripe, C.turning];
  for (let i = 0; i < 22; i++) {
    const x = 1040 + r() * 680;
    cherries.push({ x, y: groundY(x) + 30 + r() * 110, r: 3.4 + r() * 1.4, c: tones[i % 4] });
  }
  return { flowers, tufts: tufts.join(""), leaves, cherries };
}
const BITS = groundBits();

/** Shared defs, referenced by every harvest SVG (ids are global in the document). */
export function HarvestDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <pattern id="hv-weave" width="12" height="10" patternUnits="userSpaceOnUse">
          <rect width="12" height="10" fill={C.bamboo} />
          <rect y="0" width="12" height="4.6" fill={C.bambooMid} />
          <path d="M0 4.8H12M0 9.8H12" stroke={C.weaveLine} strokeWidth="0.8" opacity="0.7" />
          <path d="M6 0V4.8M0 4.8V10M12 4.8V10" stroke={C.weaveLine} strokeWidth="1.2" opacity="0.75" />
          <path d="M1 2.2H5M7 7.2H11" stroke="#efd9ad" strokeWidth="0.8" opacity="0.7" />
        </pattern>
        <linearGradient id="hv-basket-shade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3a2410" stopOpacity="0.35" />
          <stop offset="0.35" stopColor="#3a2410" stopOpacity="0" />
          <stop offset="0.7" stopColor="#3a2410" stopOpacity="0" />
          <stop offset="1" stopColor="#3a2410" stopOpacity="0.4" />
        </linearGradient>
        <pattern id="hv-check" width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M0 0.5H9M0.5 0V9" stroke="#2a1608" strokeWidth="0.7" opacity="0.45" />
        </pattern>
        <pattern id="hv-buti" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1.1" fill="#efe2c4" />
          <circle cx="10.5" cy="10.5" r="1.1" fill="#efe2c4" />
        </pattern>
        <pattern id="hv-motif" width="10" height="16" patternUnits="userSpaceOnUse">
          <path d="M5 4L8 8L5 12L2 8Z" fill="#efe0bd" opacity="0.85" />
          <path d="M0 2.2H10M0 13.8H10" stroke="#efe0bd" strokeWidth="0.8" opacity="0.6" />
        </pattern>
        <linearGradient id="hv-sky" x1="0" x2="0" y1="-700" y2="720" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#dfece8" />
          <stop offset="0.45" stopColor="#f3f7f0" />
          <stop offset="0.75" stopColor="#eef4e8" />
          <stop offset="1" stopColor="#dde9da" />
        </linearGradient>
        <radialGradient id="hv-sun" cx="1480" cy="150" r="700" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fffdf0" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#fbf3d2" stopOpacity="0.45" />
          <stop offset="1" stopColor="#f6f0d0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hv-ground" x1="0" x2="0" y1="860" y2="1100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c4936a" />
          <stop offset="0.5" stopColor="#b17d55" />
          <stop offset="1" stopColor="#97663f" />
        </linearGradient>
        <linearGradient id="hv-plant" x1="0" x2="0" y1="660" y2="880" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#86a66c" />
          <stop offset="1" stopColor="#5f8450" />
        </linearGradient>
        {/* watercolour: wobbly edges + uneven pigment */}
        <filter id="hv-wash" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="4" result="edge" />
          <feDisplacementMap in="SourceGraphic" in2="edge" scale="8" xChannelSelector="R" yChannelSelector="G" result="wob" />
          <feTurbulence type="fractalNoise" baseFrequency="0.005 0.016" numOctaves="3" seed="11" result="pig" />
          <feColorMatrix in="pig" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0 0 0 0.42" result="pa" />
          <feComposite in="wob" in2="pa" operator="in" />
        </filter>
        <filter id="hv-wobble" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="edge" />
          <feDisplacementMap in="SourceGraphic" in2="edge" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

function Backdrop() {
  return (
    <svg className="hv-layer" style={{ left: -200, top: -700, width: 2320, height: 1820 }} viewBox="-200 -700 2320 1820" aria-hidden>
      <rect x="-200" y="-700" width="2320" height="1820" fill="url(#hv-sky)" />
      <rect x="-200" y="-700" width="2320" height="1500" fill="url(#hv-sun)" />
      {/* soft streaks of high mist */}
      <g fill="#ffffff" opacity="0.6" filter="url(#hv-wash)">
        <ellipse cx="420" cy="250" rx="420" ry="26" />
        <ellipse cx="1180" cy="190" rx="360" ry="18" />
        <ellipse cx="760" cy="360" rx="520" ry="22" />
      </g>
      {/* the Eastern Ghats: three ridges fading into the haze */}
      <g filter="url(#hv-wash)">
        <path d={hillPath(ridgeFar)} fill="#c3d3c7" />
        <path d={hillPath(ridgeMid)} fill="#a8c1ae" />
        <path d={hillPath(ridgeNear)} fill="#8eac92" />
        <path d={crestShrubs(ridgeNear, 41, 22, 9)} fill="#7f9f84" />
      </g>
      {/* plantation hill: rows of coffee bushes under silver oaks */}
      <g filter="url(#hv-wobble)">
        <path d={hillPath(plantation)} fill="url(#hv-plant)" />
        {OAKS.map((o, i) => (
          <g key={i} opacity={o.s < 0.6 ? 0.55 : 0.9}>
            <path d={`M${f1(o.x)} ${f1(o.y)}L${f1(o.x + 3)} ${f1(o.y - o.h)}`} stroke="#8d8471" strokeWidth={f1(3.2 * o.s)} strokeLinecap="round" />
            {[0.55, 0.72, 0.88, 1].map((t, j) => (
              <ellipse key={j} cx={f1(o.x + 2 + (j % 2 ? 9 : -8) * o.s)} cy={f1(o.y - o.h * t)} rx={f1((15 - j * 2) * o.s)} ry={f1((9 - j) * o.s)} fill={j % 2 ? "#6c8a5b" : "#5d7c50"} />
            ))}
          </g>
        ))}
        {ROWS.map((b, i) => (
          <g key={i}>
            <ellipse cx={f1(b.x)} cy={f1(b.y)} rx={f1(b.rx)} ry={f1(b.ry)} fill={b.c} />
            <ellipse cx={f1(b.x - b.rx * 0.25)} cy={f1(b.y - b.ry * 0.35)} rx={f1(b.rx * 0.45)} ry={f1(b.ry * 0.38)} fill={b.h} opacity="0.75" />
          </g>
        ))}
      </g>
      {/* the path through the farm */}
      <g filter="url(#hv-wobble)">
        <path d={`M-200 1120L-200 ${groundY(-200)}${Array.from({ length: 70 }, (_, i) => -200 + i * 33).map((x) => ` L${x} ${f1(groundY(x))}`).join("")} L2120 ${f1(groundY(2120))} L2120 1120Z`} fill="url(#hv-ground)" />
        <path d="M-100 930C300 922 700 950 1100 940S1700 925 2080 945M-100 1000C400 990 900 1020 1300 1005S1800 995 2080 1015M200 1060C700 1050 1200 1075 1900 1060" fill="none" stroke={C.soilLine} strokeWidth="2" opacity="0.25" strokeLinecap="round" />
        <path d={BITS.tufts} fill="none" stroke="#6d8f4a" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* soft shadows where the women and baskets stand */}
      <g fill="#4a2414" opacity="0.22">
        <ellipse cx="1150" cy="908" rx="62" ry="9" />
        <ellipse cx="1365" cy="908" rx="64" ry="9" />
        <ellipse cx="1560" cy="920" rx="150" ry="11" />
      </g>
      {BITS.leaves.map((l, i) => (
        <path key={i} d={leafPath(l.l, l.l * 0.36, l.k)} transform={`translate(${f1(l.x)} ${f1(l.y)}) rotate(${f1(l.a)})`} fill={l.c} stroke="#5b4a26" strokeWidth="0.8" opacity="0.85" />
      ))}
      {BITS.cherries.map((c, i) => (
        <g key={i}>
          <circle cx={f1(c.x)} cy={f1(c.y)} r={f1(c.r)} fill={c.c} stroke={C.cherryLine} strokeWidth="0.6" />
          <circle cx={f1(c.x - c.r * 0.35)} cy={f1(c.y - c.r * 0.4)} r={f1(c.r * 0.3)} fill="#fff2df" opacity="0.5" />
        </g>
      ))}
      {BITS.flowers.map((f, i) => (
        <g key={i}>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={f1(f.x + Math.cos((a * Math.PI) / 180) * f.s)} cy={f1(f.y + Math.sin((a * Math.PI) / 180) * f.s)} r={f1(f.s * 0.62)} fill={f.c} />
          ))}
          <circle cx={f1(f.x)} cy={f1(f.y)} r={f1(f.s * 0.45)} fill="#d9a531" />
        </g>
      ))}
    </svg>
  );
}

export default memo(Backdrop);
