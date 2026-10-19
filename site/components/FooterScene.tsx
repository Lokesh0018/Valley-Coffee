// The footer mural: a Warli-inspired Indian folk-art village landscape, drawn after the client's reference.
// One panoramic SVG (1440 × 480): a terracotta sun with triangular rays and black birds; hills (near-black at the
// edges, forest green in the middle) with cream gaps and ivory plants; two great arch systems (thick black bands,
// curved triangle bands that follow the arc, fields of fine curved furrows), the right one edged in terracotta;
// a terracotta path winding through the right field; women walking, carrying baskets and pots, bending to gather;
// folk plants and grass along the slopes; patterned half-arches in the bottom corners.
// Palette: cream, forest green, near-black, terracotta, pale ivory. Flat fills, crisp outlines.

export const CREAM = "#f5eedc";
export const GREEN = "#15542d";
export const INK = "#171715";
export const TERRA = "#c65a22";
export const IVORY = "#fff8e9";

const f1 = (n: number) => Math.round(n * 10) / 10;
const pt = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;

/** Ring of triangles between rOut and rIn around (cx, cy), from angle a0 to a1: black triangles (base on the outer
 *  edge, apex inward), each with a nested ivory and a small black triangle; outlined by thin arcs. */
function TriangleRing({ cx, cy, rOut, rIn, a0, a1, n, edge = INK }: { cx: number; cy: number; rOut: number; rIn: number; a0: number; a1: number; n: number; edge?: string }) {
  const tris: string[] = [];
  const inner: string[] = [];
  const dots: string[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = a0 + ((a1 - a0) * i) / n;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / n;
    const tm = (t0 + t1) / 2;
    const A = pt(cx, cy, rOut, t0);
    const B = pt(cx, cy, rOut, t1);
    const C = pt(cx, cy, rIn, tm);
    tris.push(`M${f1(A[0])} ${f1(A[1])}L${f1(B[0])} ${f1(B[1])}L${f1(C[0])} ${f1(C[1])}Z`);
    const g = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    const sh = (P: readonly number[], k: number) => [g[0] + (P[0] - g[0]) * k, g[1] + (P[1] - g[1]) * k];
    const [a2, b2, c2] = [sh(A, 0.56), sh(B, 0.56), sh(C, 0.56)];
    inner.push(`M${f1(a2[0])} ${f1(a2[1])}L${f1(b2[0])} ${f1(b2[1])}L${f1(c2[0])} ${f1(c2[1])}Z`);
    const [a3, b3, c3] = [sh(A, 0.2), sh(B, 0.2), sh(C, 0.2)];
    dots.push(`M${f1(a3[0])} ${f1(a3[1])}L${f1(b3[0])} ${f1(b3[1])}L${f1(c3[0])} ${f1(c3[1])}Z`);
  }
  const mid = (rOut + rIn) / 2;
  return (
    <g>
      <circle cx={cx} cy={cy} r={mid} fill="none" stroke={IVORY} strokeWidth={rOut - rIn} />
      <path d={tris.join("")} fill={INK} />
      <path d={inner.join("")} fill={IVORY} />
      <path d={dots.join("")} fill={INK} />
      <circle cx={cx} cy={cy} r={rOut} fill="none" stroke={edge} strokeWidth="2.4" />
      <circle cx={cx} cy={cy} r={rIn} fill="none" stroke={edge} strokeWidth="2.4" />
    </g>
  );
}

/** Concentric furrow lines (a cultivated field) between rFrom and rTo. */
function Furrows({ cx, cy, rFrom, rTo, step = 8, w = 1.5 }: { cx: number; cy: number; rFrom: number; rTo: number; step?: number; w?: number }) {
  const rings: number[] = [];
  for (let r = rFrom; r >= rTo; r -= step) rings.push(r);
  return (
    <g fill="none" stroke={INK} strokeWidth={w}>
      {rings.map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r} />
      ))}
    </g>
  );
}

// ---------- figures ----------

const TORSO = "M-6 -36H6L0 -24Z";
const SKIRT = "M0 -24L-10.5 -6H10.5Z";

/** A woven basket (black, ivory weave), optionally heaped with terracotta cherries. Origin at the rim's middle. */
function Basket({ x = 0, y = 0, s = 1, full = false }: { x?: number; y?: number; s?: number; full?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {full && (
        <g fill={TERRA}>
          <circle cx="-4" cy="-1.4" r="2.2" />
          <circle cx="0" cy="-2.4" r="2.3" />
          <circle cx="4" cy="-1.4" r="2.2" />
        </g>
      )}
      <path d="M-9 0Q-8 9 0 9.5Q8 9 9 0Z" fill={INK} />
      <path d="M-7.4 2.4H7.4M-6 5.2H6M-4 0.4V8.4M0 0.4V9M4 0.4V8.4" stroke={IVORY} strokeWidth="0.7" />
      <path d="M-9.6 0H9.6" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

/** A clay pot: rounded body, narrow neck and rim, ivory bands. Origin at the bottom of the pot. */
function Pot({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-2.6 -15.5H2.6V-12.6C6.8 -11.6 8.6 -8 7.8 -4.4C7 -1.2 4 0 0 0S-7 -1.2 -7.8 -4.4C-8.6 -8 -6.8 -11.6 -2.6 -12.6Z" fill={INK} />
      <path d="M-4.4 -15.6H4.4" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M-6.6 -8.6H6.6M-7.2 -5H7.2" stroke={IVORY} strokeWidth="0.9" />
    </g>
  );
}

function Head({ y = -43 }: { y?: number }) {
  return (
    <g>
      <circle cx="0" cy={y} r="4.4" fill={INK} />
      <circle cx="3.6" cy={y - 2.6} r="2" fill={INK} />
    </g>
  );
}

const LIMB = { fill: "none", stroke: INK, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Walking with a basket (or pot) on her head, one hand up to steady it; mid-stride. Faces left unless flipped. */
function HeadCarrier({ x, y, s = 1, flip = false, pot = false, step = 0 }: { x: number; y: number; s?: number; flip?: boolean; pot?: boolean; step?: number }) {
  return (
    <g className="fs-figure" transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className="fs-walk" style={{ animationDelay: `${-step}s` }} transform="rotate(-5)">
        {pot ? <Pot y={-48.5} /> : <Basket y={-57} s={0.95} full />}
        <Head />
        <path d="M-4.5 -35L-10.5 -42L-7 -50M4.5 -35L9.5 -28L13.5 -24" {...LIMB} />
        <path d={TORSO} fill={INK} />
        <path d={SKIRT} fill={INK} />
        <path d="M-3 -6L-7 -2.5L-10.5 0.5M3 -6L4.5 -2L8.5 0.5" {...LIMB} />
      </g>
    </g>
  );
}

/** Walking with a basket held out in one hand (the other arm bent). Faces left unless flipped. */
function HandCarrier({ x, y, s = 1, flip = false, step = 0 }: { x: number; y: number; s?: number; flip?: boolean; step?: number }) {
  return (
    <g className="fs-figure" transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className="fs-walk" style={{ animationDelay: `${-step}s` }} transform="rotate(-6)">
        <Head />
        <path d="M-4.5 -35L-11 -30L-14 -24M4.5 -35L8 -42L5 -46" {...LIMB} />
        <Basket x={-15} y={-23} s={0.9} full />
        <path d={TORSO} fill={INK} />
        <path d={SKIRT} fill={INK} />
        <path d="M-3 -6L-6.5 -2L-9.5 0.5M3 -6L5 -2L8.5 0.5" {...LIMB} />
      </g>
    </g>
  );
}

/** Bending low to gather, both arms reaching down towards a basket on the ground. Faces left unless flipped. */
function Gatherer({ x, y, s = 1, flip = false, step = 0 }: { x: number; y: number; s?: number; flip?: boolean; step?: number }) {
  return (
    <g className="fs-figure" transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className="fs-walk" style={{ animationDelay: `${-step}s` }}>
        <g transform="rotate(-62 0 -22)">
          <Head />
          <path d="M-4.5 -35L-9 -27L-8 -20M4.5 -35L3 -26L6 -20" {...LIMB} />
          <path d={TORSO} fill={INK} />
        </g>
        <path d="M0 -24L-9.5 -6H9.5Z" fill={INK} />
        <path d="M-3 -6L-6 -2L-6 0.5M3 -6L7 -2L8 0.5" {...LIMB} />
        <Basket x={-26} y={-8} s={0.95} full />
      </g>
    </g>
  );
}

// ---------- plants ----------

const LEAF = "M0 0C3 -4 9 -4.6 12 0C9 4.6 3 4 0 0Z";
const SLIM = "M0 0C3.4 -2.6 11 -3 15 0C11 3 3.4 2.6 0 0Z";

/** A tall folk plant: a central stem with paired leaves angled upwards (fern-like). */
function FernPlant({ x, y, s = 1, color = IVORY, outline = false }: { x: number; y: number; s?: number; color?: string; outline?: boolean }) {
  const pairs = [0.15, 0.3, 0.45, 0.6, 0.74];
  const h = 54;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M0 0V${-h}`} stroke={outline ? INK : color} strokeWidth="1.8" strokeLinecap="round" />
      {pairs.map((t, i) => {
        const py = -h * t - 4;
        const k = 1 - t * 0.55;
        return (
          <g key={i}>
            <path d={SLIM} transform={`translate(0 ${py}) rotate(-150) scale(${k})`} fill={color} stroke={outline ? INK : "none"} strokeWidth="0.7" />
            <path d={SLIM} transform={`translate(0 ${py}) rotate(-30) scale(${k})`} fill={color} stroke={outline ? INK : "none"} strokeWidth="0.7" />
          </g>
        );
      })}
      <path d={SLIM} transform={`translate(0 ${-h}) rotate(-90) scale(0.55)`} fill={color} stroke={outline ? INK : "none"} strokeWidth="0.7" />
    </g>
  );
}

/** A branching plant with alternating, individually outlined leaves (the prominent central plant). */
function BranchPlant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const leaves: [number, number, number, number][] = [
    [0, -12, -150, 1.1], [0, -18, -30, 1.1], [0, -30, -160, 1], [0, -36, -20, 1],
    [-12, -34, -130, 0.95], [-17, -42, -100, 0.85], [-9, -40, -55, 0.8],
    [12, -38, -50, 0.95], [17, -46, -80, 0.85], [9, -44, -125, 0.8],
    [0, -50, -145, 0.9], [0, -54, -35, 0.9], [0, -62, -90, 0.95],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0C-1 -20 1 -40 0 -60M0 -28C-6 -31 -12 -33 -17 -42M0 -32C6 -35 12 -37 17 -46" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      {leaves.map(([lx, ly, a, k], i) => (
        <path key={i} d={LEAF} transform={`translate(${lx} ${ly}) rotate(${a}) scale(${k})`} fill={GREEN} stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
      ))}
    </g>
  );
}

/** A small seedling / sprig with alternating leaves. */
function Sprig({ x, y, s = 1, color = GREEN }: { x: number; y: number; s?: number; color?: string }) {
  const nodes: [number, number][] = [
    [-6, -150],
    [-11, -30],
    [-16, -150],
    [-21, -30],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0V-24" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
      {nodes.map(([py, a], i) => (
        <path key={i} d={LEAF} transform={`translate(0 ${py}) rotate(${a}) scale(0.75)`} fill={color} stroke={INK} strokeWidth="0.6" />
      ))}
      <path d={LEAF} transform="translate(0 -24) rotate(-90) scale(0.65)" fill={color} stroke={INK} strokeWidth="0.6" />
    </g>
  );
}

/** A tuft of pointed grass blades (green or terracotta). */
function Tuft({ x, y, s = 1, color = GREEN }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <path d="M-1 0L-9 -10L-2 -3Z" />
      <path d="M-1.5 0L-3 -15L1 -1Z" />
      <path d="M0 0L5 -13L2 -1Z" />
      <path d="M1 0L10 -8L2 -2Z" />
    </g>
  );
}

/** A folk bird in flight: a small body, curved swept wings, a forked tail. */
function Bird({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={INK}>
      <path d="M-9 1C-5 -1.4 3 -1.6 8 0C10 0.6 11.5 0.4 13 -0.6C12 1.6 10 2.4 8 2.4C2 3.6 -4 3.4 -9 1Z" />
      <path d="M-3 0.6C-6 -5 -11 -9 -17 -10C-12 -6 -9 -2 -6 1.6Z" />
      <path d="M1 0.4C2 -6 6 -11 12 -13C8 -8 6 -3 4 1.2Z" />
      <path d="M-9 1L-15 -1.6L-13 1.6L-15 4.4Z" />
    </g>
  );
}

/** A distant bird: a pair of curved wings. */
function FarBird({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <path d={`M${x - 9 * s} ${y}Q${x - 4 * s} ${y - 5 * s} ${x} ${y}Q${x + 4 * s} ${y - 5 * s} ${x + 9 * s} ${y}`} fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />;
}

/** The terracotta sun: a solid disc, a thin cream ring, triangular rays (the rays turn slowly, CSS). */
function Sun({ x, y, r = 24 }: { x: number; y: number; r?: number }) {
  const rays = Array.from({ length: 16 }, (_, i) => (i / 16) * 360);
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="fm-rays">
        {rays.map((a) => (
          <path key={a} d={`M-4.4 ${-r - 4}L0 ${-r - 15}L4.4 ${-r - 4}Z`} fill={TERRA} transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r={r + 2.2} fill={CREAM} />
      <circle r={r} fill={TERRA} />
    </g>
  );
}

// ---------- the mural ----------

// A footer-specific composition at its natural proportions (1440 × 300, nothing squeezed): sky with the sun and
// birds right under the footer text (same cream, so there is no seam), hills, two arch systems sized to sweep down
// onto the bottom border, the village between them, and a complete triangle border anchored to the bottom edge.
const LA = { cx: 300, cy: 640 }; // left arch centre (below the picture)
const RA = { cx: 1180, cy: 660 }; // right arch centre
const BORDER_TOP = 268;

export function FolkMural({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <defs>
        <clipPath id="fm-clip">
          <rect x="0" y="0" width="1440" height="300" />
        </clipPath>
        {/* the bottom border: small nested triangles */}
        <pattern id="fm-tri" x="0" y={BORDER_TOP + 9} width="18" height="15" patternUnits="userSpaceOnUse">
          <rect width="18" height="15" fill={IVORY} />
          <path d="M1 15L9 0.6L17 15Z" fill={INK} />
          <path d="M5 15L9 7.8L13 15Z" fill={IVORY} />
          <path d="M7.4 15L9 12L10.6 15Z" fill={INK} />
        </pattern>
      </defs>
      <g clipPath="url(#fm-clip)">
        {/* no sky fill: the footer's cream shows through, so the margin shoulders behind can rise into the sky */}


        {/* hills: near-black at the edges, forest green in the middle; cream gaps between */}
        <path d="M-20 112C40 86 110 68 170 70C240 74 300 100 380 134C420 152 450 178 460 206V300H-20Z" fill={INK} />
        <path d="M900 150C960 118 1040 88 1130 78C1210 72 1290 82 1360 68C1400 62 1430 62 1460 64V300H900Z" fill={INK} />
        <path d="M1060 106C1120 92 1180 88 1250 90" fill="none" stroke={CREAM} strokeWidth="4" strokeLinecap="round" />
        <path d="M600 152C680 106 750 88 820 90C890 92 950 112 1030 142V300H600Z" fill={GREEN} />
        <path d="M600 152C680 106 750 88 820 90C890 92 950 112 1030 142" fill="none" stroke={CREAM} strokeWidth="4" />
        <path d="M230 192C320 120 420 72 500 68C570 66 660 112 790 162V300H230Z" fill={GREEN} />
        <path d="M230 192C320 120 420 72 500 68C570 66 660 112 790 162" fill="none" stroke={CREAM} strokeWidth="4" />
        {/* ivory plants on the left black hill */}
        <FernPlant x={238} y={128} s={0.6} />
        <FernPlant x={88} y={118} s={0.5} />
        <FernPlant x={140} y={116} s={0.66} />
        <FernPlant x={190} y={120} s={0.44} />

        {/* the cream ridge on the right, where women walk among plants */}
        <path d="M690 300C676 240 696 190 740 168C880 138 1060 116 1460 100V300Z" fill={CREAM} />
        <path d="M690 300C676 240 696 190 740 168C880 138 1060 116 1460 100" fill="none" stroke={INK} strokeWidth="2" />
        {[1020, 1090, 1170, 1250, 1320, 1390].map((px, i) => (
          <Sprig key={px} x={px} y={Math.round(140 - (px - 1000) * 0.07)} s={i % 2 ? 0.8 : 0.95} />
        ))}

        {/* the left arch: a thick black band, a curved triangle band, a field of furrows */}
        <circle cx={LA.cx} cy={LA.cy} r={506} fill={CREAM} />
        <circle cx={LA.cx} cy={LA.cy} r={522} fill="none" stroke={INK} strokeWidth="26" />
        <circle cx={LA.cx} cy={LA.cy} r={506} fill="none" stroke={CREAM} strokeWidth="4" />
        <TriangleRing cx={LA.cx} cy={LA.cy} rOut={503} rIn={476} a0={-Math.PI * 1.08} a1={-Math.PI * 0.18} n={86} />
        <circle cx={LA.cx} cy={LA.cy} r={471} fill="none" stroke={INK} strokeWidth="1.8" />
        <Furrows cx={LA.cx} cy={LA.cy} rFrom={464} rTo={360} step={7} w={1.3} />

        {/* the right arch: black and terracotta bands, a curved triangle band, furrows */}
        <circle cx={RA.cx} cy={RA.cy} r={530} fill={CREAM} />
        <circle cx={RA.cx} cy={RA.cy} r={530} fill="none" stroke={INK} strokeWidth="10" />
        <circle cx={RA.cx} cy={RA.cy} r={518} fill="none" stroke={TERRA} strokeWidth="8" />
        <TriangleRing cx={RA.cx} cy={RA.cy} rOut={511} rIn={484} a0={-Math.PI * 0.98} a1={-Math.PI * 0.02} n={88} />
        <circle cx={RA.cx} cy={RA.cy} r={479} fill="none" stroke={TERRA} strokeWidth="4" />
        <Furrows cx={RA.cx} cy={RA.cy} rFrom={471} rTo={380} step={7} w={1.3} />

        {/* green slopes, bottom left and bottom right */}
        <path d="M-20 186C80 178 190 196 280 236C310 250 330 260 344 268H-20Z" fill={GREEN} />
        <path d="M-20 186C80 178 190 196 280 236C310 250 330 260 344 268" fill="none" stroke={INK} strokeWidth="2" />
        <path d="M1300 268C1340 248 1390 234 1460 228V268Z" fill={GREEN} />
        <path d="M1300 268C1340 248 1390 234 1460 228" fill="none" stroke={INK} strokeWidth="2" />

        {/* plants */}
        <Tuft x={52} y={192} s={0.9} color={TERRA} />
        <Tuft x={96} y={190} s={0.85} color={TERRA} />
        <Tuft x={250} y={224} s={0.9} color={TERRA} />
        <Tuft x={300} y={246} s={0.85} color={TERRA} />
        <FernPlant x={24} y={186} s={0.48} color={GREEN} outline />
        <BranchPlant x={236} y={216} s={0.55} />
        <BranchPlant x={722} y={262} s={0.95} />
        <Tuft x={1360} y={248} s={0.9} />
        <Tuft x={1416} y={236} s={0.85} color={TERRA} />

        {/* the women: two on the cream ridge, two gathering on the left */}
        <HandCarrier x={848} y={184} s={0.86} step={0} />
        <HeadCarrier x={910} y={176} s={0.9} flip step={0.4} />
        <Gatherer x={132} y={196} s={0.78} flip step={0.1} />
        <Gatherer x={190} y={206} s={0.78} step={0.5} />

        {/* the bottom border, complete and anchored to the bottom edge */}
        <rect x="0" y={BORDER_TOP} width="1440" height={300 - BORDER_TOP} fill={IVORY} />
        <path d={`M0 ${BORDER_TOP + 1.5}H1440M0 ${BORDER_TOP + 6}H1440`} stroke={INK} strokeWidth="2" />
        <rect x="0" y={BORDER_TOP + 9} width="1440" height="15" fill="url(#fm-tri)" />
        <path d={`M0 ${BORDER_TOP + 26}H1440`} stroke={INK} strokeWidth="2.4" />
        <path d={`M0 ${BORDER_TOP + 30}H1440`} stroke={INK} strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/** The terracotta sun on its own, for the open sky beside the footer text (its rays turn slowly, CSS). */
export function FolkSunMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-36 -36 72 72" className={className} aria-hidden>
      <Sun x={0} y={0} r={18} />
    </svg>
  );
}

/** A few folk birds, for the open sky between the footer logo and the links. */
export function FolkBirds({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 60" className={className} aria-hidden>
      <Bird x={70} y={36} s={0.75} />
      <Bird x={150} y={20} s={0.68} flip />
      <FarBird x={20} y={24} s={0.75} />
      <FarBird x={186} y={44} s={0.6} />
    </svg>
  );
}

/** A hill shoulder that rises from the mural's black edge hill up the footer's outer margin, framing the content.
 *  Same near-black as the hill below it, so the two merge without a seam; a thin cream contour echoes the hills.
 *  Simple silhouette, so it is drawn to fill its box (the box is sized to the margin). */
export function FolkShoulder({ side, className = "" }: { side: "left" | "right"; className?: string }) {
  const flip = side === "right" ? "translate(100 0) scale(-1 1)" : undefined;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className} aria-hidden>
      <g transform={flip}>
        <path d="M0 100V6C26 0 48 14 66 44C78 64 88 84 100 100Z" fill={INK} />
        <path d="M0 30C22 26 40 38 54 58" fill="none" stroke={CREAM} strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}
