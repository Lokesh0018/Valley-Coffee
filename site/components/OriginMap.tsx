import { origins } from "../content";

// South India map (Motion map M8: the routes draw from each estate to the roastery in Visakhapatnam).
// A softly filled peninsula with the two seas named; the western estates are labelled out in the Arabian Sea with
// leader lines, so no label crosses a route. `active` highlights one estate and its route (the cards drive it);
// hovering or focusing a dot calls `onActive`.

const K = 40;
const px = (lon: number, lat: number) => [(lon - 72.5) * K, (20 - lat) * K] as const;

const OUTLINE: [number, number][] = [
  [72.9, 19.6], [73.0, 18.0], [73.3, 17.0], [73.7, 16.0], [73.9, 15.3], [74.4, 14.0], [74.8, 12.9], [75.4, 11.8], [75.9, 11.0],
  [76.3, 9.9], [76.6, 9.0], [77.1, 8.3], [77.5, 8.1], [78.1, 8.8], [78.2, 9.3], [79.0, 9.4], [79.3, 10.3], [79.85, 10.8],
  [79.85, 11.9], [80.2, 13.0], [80.3, 13.6], [80.1, 15.0], [80.3, 15.7], [81.0, 16.0], [81.6, 16.4], [82.3, 16.7], [82.4, 17.2],
  [83.3, 17.7], [84.2, 18.4], [84.8, 19.2], [85.1, 19.6],
];
const path = (pts: (readonly [number, number])[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

// label placement per estate: where the pill sits (its anchor point) and which side it grows from
const LABELS: { x: number; y: number; anchor: "start" | "end" }[] = [
  { x: 40, y: 250, anchor: "end" }, // Chikmagalur → out in the Arabian Sea
  { x: 40, y: 306, anchor: "end" }, // Coorg
  { x: 60, y: 362, anchor: "end" }, // Nilgiris
  { x: 396, y: 44, anchor: "end" }, // Araku Valley → above, to the left
];

function Pill({ x, y, text, anchor, strong = false, on = false }: { x: number; y: number; text: string; anchor: "start" | "end" | "middle"; strong?: boolean; on?: boolean }) {
  const w = text.length * 7.6 + 22;
  const left = anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x;
  return (
    <g>
      <rect x={left} y={y - 14} width={w} height={28} rx={14} className="map-pill" fill={strong || on ? "#24683c" : "#fafcf7"} stroke={strong || on ? "none" : "#cfe0cc"} />
      <text x={left + w / 2} y={y + 5} textAnchor="middle" fontSize="14" fontFamily="var(--font-body-family)" fontWeight={strong || on ? 600 : 500} fill={strong || on ? "#ffffff" : "#133024"}>
        {text}
      </text>
    </g>
  );
}

export default function OriginMap({ className = "", active = -1, onActive }: { className?: string; active?: number; onActive?: (i: number) => void }) {
  const coast = OUTLINE.map(([lo, la]) => px(lo, la));
  const land = `${path(coast)} L${px(85.1, 20.6).join(",")} L${px(72.9, 20.6).join(",")} Z`;
  const [rx, ry] = px(origins.roastery.lon, origins.roastery.lat);
  return (
    <svg viewBox="-170 0 720 500" className={className} fill="none" role="img" aria-label="Map of south India: four coffee estates in Chikmagalur, Coorg, the Nilgiris and Araku Valley, with routes to the roastery in Visakhapatnam">
      <defs>
        {/* the land fades out to the north, so the map has no hard top edge */}
        <linearGradient id="map-north" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".2" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="map-fade-north" maskUnits="userSpaceOnUse" x="-170" y="0" width="720" height="500">
          <rect x="-170" y="0" width="720" height="500" fill="url(#map-north)" />
        </mask>
      </defs>
      {/* land, coast, seas */}
      <path className="map-outline" d={land} fill="#dfeadb" stroke="none" mask="url(#map-fade-north)" />
      <path className="map-outline" mask="url(#map-fade-north)" d={path(coast)} stroke="#4f6657" strokeOpacity=".6" strokeWidth="1.4" strokeLinejoin="round" />
      <text x={-150} y={430} fontSize="12" letterSpacing="3" fill="#4f6657" opacity=".7" fontFamily="var(--font-body-family)">
        ARABIAN SEA
      </text>
      <text x={330} y={344} fontSize="12" letterSpacing="3" fill="#4f6657" opacity=".7" fontFamily="var(--font-body-family)">
        BAY OF BENGAL
      </text>
      {/* the Eastern & Western Ghats as small hill marks */}
      {origins.items.map((o) => {
        const [x, y] = px(o.lon, o.lat);
        return <path key={`h-${o.name}`} d={`M${x - 14},${y + 6} l7,-9 l5,5 l6,-10 l10,14`} stroke="#4f6657" strokeOpacity=".5" strokeWidth="1.2" strokeLinejoin="round" />;
      })}

      {/* routes to the roastery: dashed, revealed by a solid mask path that draws from the estate (M8) */}
      {origins.items.map((o, i) => {
        const [x, y] = px(o.lon, o.lat);
        const cx = (x + rx) / 2 + (i === 3 ? 10 : -20 + i * 18);
        const cy = (y + ry) / 2 - (i === 3 ? 30 : 70 - i * 14);
        const d = `M${x},${y} Q${cx},${cy} ${rx},${ry}`;
        const on = active === i;
        return (
          <g key={`r-${o.name}`} style={{ opacity: active === -1 || on ? 1 : 0.25, transition: "opacity .35s ease" }}>
            <mask id={`route-mask-${i}`} maskUnits="userSpaceOnUse" x="-170" y="0" width="720" height="500">
              <path className="route-reveal" d={d} stroke="#fff" strokeWidth="8" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset="0" />
            </mask>
            <path className="map-route" d={d} stroke="#24683c" strokeWidth={on ? 2.6 : 1.8} strokeLinecap="round" strokeDasharray={on ? "none" : "5 6"} mask={`url(#route-mask-${i})`} />
          </g>
        );
      })}

      {/* estates: dot + leader line + pill label (hover/focus highlights the card) */}
      {origins.items.map((o, i) => {
        const [x, y] = px(o.lon, o.lat);
        const l = LABELS[i];
        const on = active === i;
        return (
          <g
            key={o.name}
            className="map-dot cursor-pointer"
            data-dot={i}
            tabIndex={0}
            role="button"
            aria-label={`${o.name}, ${o.altitude}, ${o.process}`}
            onMouseEnter={() => onActive?.(i)}
            onFocus={() => onActive?.(i)}
            onClick={() => onActive?.(i)}
          >
            <path className="map-pill-g" d={`M${x},${y} L${l.x + (l.anchor === "end" ? 6 : -6)},${l.y}`} stroke="#4f6657" strokeOpacity=".55" strokeWidth="1" />
            <circle cx={x} cy={y} r={on ? 13 : 9} fill="#24683c" fillOpacity=".18" style={{ transition: "r .3s ease" }} />
            <circle cx={x} cy={y} r={on ? 6 : 4.5} fill="#24683c" style={{ transition: "r .3s ease" }} />
            <g className="map-pill-g">
              <Pill x={l.x} y={l.y} text={`${String(i + 1).padStart(2, "0")}  ${o.name}`} anchor={l.anchor} on={on} />
            </g>
            {/* phones: a big number beside the dot instead (matches the card badges) */}
            <text className="map-num" x={i === 3 ? x - 16 : x - 18} y={i === 3 ? y - 10 : y + 9} textAnchor="end" fontSize="30" fontWeight="600" fill="#133024" fontFamily="var(--font-body-family)">
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        );
      })}

      {/* the roastery */}
      <g className="map-roastery">
        <circle cx={rx} cy={ry} r="18" fill="#2f7d4a" fillOpacity=".2" />
        <circle cx={rx} cy={ry} r="8" fill="#2f7d4a" stroke="#fafcf7" strokeWidth="2.5" />
        <path className="map-pill-g" d={`M${rx},${ry + 10} L${rx + 2},${ry + 26}`} stroke="#4f6657" strokeOpacity=".55" strokeWidth="1" />
        <g className="map-pill-g">
          <Pill x={rx + 6} y={ry + 40} text="Roastery · Visakhapatnam" anchor="middle" strong />
        </g>
        <text className="map-num" x={rx - 10} y={ry + 52} textAnchor="middle" fontSize="28" fontWeight="600" fill="#24683c" fontFamily="var(--font-body-family)">
          Roastery
        </text>
      </g>
    </svg>
  );
}
