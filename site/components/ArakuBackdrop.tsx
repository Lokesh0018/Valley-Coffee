import { beans } from "../content";

// Backdrop for Take home (BeanBags.tsx): the Araku hills the beans come from. A soft morning wash, faint
// topographic contour rings (like a survey map of the valley) behind the headline, and three misty Eastern
// Ghats ridges along the bottom with a few silver oaks (the shade the coffee grows under). All drawn in code,
// deterministic so server and browser match; the ridges drift a little with the scroll (data-parallax).

// one contour ring: a circle with a gentle, seeded wobble
function ring(cx: number, cy: number, r: number, seed: number) {
  const pts: string[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = 1 + 0.09 * Math.sin(a * 3 + seed) + 0.05 * Math.sin(a * 5 + seed * 1.7) + 0.03 * Math.cos(a * 2 - seed);
    pts.push(`${(cx + Math.cos(a) * r * w * 1.25).toFixed(1)},${(cy + Math.sin(a) * r * w * 0.8).toFixed(1)}`);
  }
  return `M${pts.join(" L")}Z`;
}

const CONTOURS = [
  ...Array.from({ length: 9 }, (_, i) => ring(1120, 210, 28 + i * 34, 0.6 + i * 0.35)),
  ...Array.from({ length: 5 }, (_, i) => ring(300, 120, 24 + i * 30, 2.1 + i * 0.4)),
];

// a silver oak: a tall thin trunk and a light, airy crown
function Oak({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <g>
      <path d={`M${x},${y} L${x},${y - h}`} stroke="#9fbc9c" strokeWidth={2} />
      <ellipse cx={x} cy={y - h - h * 0.12} rx={h * 0.17} ry={h * 0.3} fill="#b4cdb0" />
      <ellipse cx={x - h * 0.08} cy={y - h * 0.72} rx={h * 0.12} ry={h * 0.16} fill="#bcd3b8" />
    </g>
  );
}

export default function ArakuBackdrop() {
  return (
    <div aria-hidden className="araku-bg pointer-events-none absolute inset-0 overflow-hidden">
      {/* morning wash + sun haze over the hills */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fafcf7_0%,#f3f8f0_45%,#e6f0e1_100%)]" />
      <div className="absolute right-[-10%] top-[-12%] h-[70%] w-[60%] bg-[radial-gradient(closest-side,rgba(255,236,196,0.55),transparent_75%)]" />

      {/* survey-map contour rings */}
      <svg className="absolute inset-x-0 top-0 h-[70%] w-full" viewBox="0 0 1440 560" preserveAspectRatio="xMidYMid slice" fill="none">
        {CONTOURS.map((d, i) => (
          <path key={i} d={d} stroke="#2f7d4a" strokeOpacity={i % 3 === 0 ? 0.13 : 0.07} strokeWidth={1} />
        ))}
      </svg>

      {/* the Eastern Ghats: far → near ridges, mist between them */}
      <div className="absolute inset-x-0 bottom-0 h-[46%]">
        <svg data-parallax="-0.04" className="absolute inset-x-0 bottom-[22%] h-[78%] w-full" viewBox="0 0 1440 300" preserveAspectRatio="none">
          <path d="M0,170 C120,120 210,90 330,118 C430,140 500,70 640,62 C760,56 830,120 960,104 C1080,90 1150,40 1270,52 C1350,60 1400,86 1440,96 L1440,300 L0,300 Z" fill="#e1ece0" />
        </svg>
        <svg data-parallax="-0.08" className="absolute inset-x-0 bottom-[8%] h-[70%] w-full" viewBox="0 0 1440 300" preserveAspectRatio="none">
          <path d="M0,150 C150,110 260,160 400,128 C540,96 610,150 760,140 C900,130 980,80 1120,96 C1240,110 1330,150 1440,128 L1440,300 L0,300 Z" fill="#d6e6d1" />
        </svg>
        {/* silver oaks along the middle ridge */}
        <svg data-parallax="-0.08" className="absolute inset-x-0 bottom-[8%] h-[70%] w-full" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax meet">
          <Oak x={210} y={152} h={58} />
          <Oak x={238} y={150} h={44} />
          <Oak x={690} y={146} h={52} />
          <Oak x={1060} y={104} h={62} />
          <Oak x={1092} y={102} h={46} />
          <Oak x={1330} y={146} h={50} />
        </svg>
        <div className="absolute inset-x-0 bottom-[18%] h-[30%] bg-[linear-gradient(180deg,transparent,rgba(250,252,247,0.75)_55%,transparent)]" />
        <svg className="absolute inset-x-0 bottom-0 h-[34%] w-full" viewBox="0 0 1440 140" preserveAspectRatio="none">
          <path d="M0,60 C180,30 330,74 520,52 C700,32 820,70 1000,58 C1180,46 1300,20 1440,40 L1440,140 L0,140 Z" fill="#d3e4cd" />
        </svg>
      </div>

      {/* map caption */}
      <div className="absolute bottom-[clamp(18px,3vh,32px)] left-[clamp(20px,4vw,64px)] text-[12px] uppercase leading-[1.7] tracking-[0.16em] text-[#3f5a49] max-md:hidden">
        <p className="font-semibold">{beans.place.name}</p>
        <p>
          {beans.place.coords} · {beans.place.range}
        </p>
      </div>
    </div>
  );
}
