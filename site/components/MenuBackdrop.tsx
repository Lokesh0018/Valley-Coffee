// The menu section's background: a soft light behind the card, a fine dotted "card stock" texture, and faint
// hand-drawn coffee line art (a branch with leaves and cherries top-right, a few scattered beans).
// Decorative only: sits behind the content and ignores the pointer.

const INK = "#24683c";

function Bean({ x, y, r, s = 1 }: { x: number; y: number; r: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round">
      <ellipse rx="9" ry="13" />
      <path d="M0 -10C4 -4 -4 4 0 10" />
    </g>
  );
}

function Leaf({ x, y, a, s = 1 }: { x: number; y: number; a: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} fill="none" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
      <path d="M0 0C12 -14 38 -16 56 0C38 16 12 14 0 0Z" />
      <path d="M4 0Q28 -2 52 0" />
    </g>
  );
}

export default function MenuBackdrop() {
  return (
    <div aria-hidden className="menu-backdrop pointer-events-none absolute inset-0 overflow-hidden">
      {/* fine dotted texture, like menu card stock; fades out towards the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(36,104,60,0.11)_1px,transparent_1.3px)] bg-[length:18px_18px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_80%)]" />
      {/* soft light behind the card and the photo */}
      <div className="absolute left-1/2 top-[55%] h-[80%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.75),rgba(255,255,255,0))]" />

      {/* a coffee branch, top right */}
      <svg viewBox="0 0 360 260" className="absolute right-[-30px] top-[clamp(40px,8vh,90px)] w-[clamp(220px,24vw,360px)] opacity-[0.16]">
        <path d="M350 20C290 40 230 70 170 110S70 190 10 240" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        <Leaf x={300} y={36} a={150} />
        <Leaf x={300} y={36} a={-40} s={0.9} />
        <Leaf x={225} y={78} a={160} s={1.05} />
        <Leaf x={225} y={78} a={-30} s={0.95} />
        <Leaf x={150} y={126} a={170} s={1.1} />
        <Leaf x={150} y={126} a={-20} />
        <Leaf x={80} y={182} a={175} s={0.9} />
        {[
          [262, 64],
          [276, 74],
          [188, 108],
          [200, 120],
          [114, 160],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" fill="none" stroke={INK} strokeWidth="1.6" />
        ))}
      </svg>

      {/* a few beans */}
      {[
        ["39%", "12%", 30, 1],
        ["82%", "93%", -20, 1.1],
        ["2%", "48%", 60, 0.9],
        ["53%", "96%", 15, 0.85],
      ].map(([l, t, r, s]) => (
        <svg key={`${l}-${t}`} viewBox="-16 -16 32 32" className="absolute h-8 w-8 opacity-[0.15]" style={{ left: l as string, top: t as string }}>
          <Bean x={0} y={0} r={r as number} s={s as number} />
        </svg>
      ))}
    </div>
  );
}
