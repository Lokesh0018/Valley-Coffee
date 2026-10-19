import { memo, type ReactNode } from "react";
import { branchBox, C, f1, leafPath, type Cherry, type Lateral, type Leaf, type Tree } from "./art";
import type { Rig } from "./rig";

// One coffee tree, placed in scene coordinates. The stem is a still SVG; every pair of laterals (branches) is its
// own small SVG in a GPU layer that the rig turns with a CSS rotation about the point where it leaves the stem
// (the breeze). Painted once, then only moved: no repainting while it sways.

export const LeafShape = memo(function LeafShape({ l }: { l: Leaf }) {
  return (
    <g transform={`translate(${f1(l.x)} ${f1(l.y)}) rotate(${f1(l.a)})`}>
      <path d={leafPath(l.l, l.w, l.k)} fill={l.c} stroke={C.leafLine} strokeWidth="1" strokeLinejoin="round" />
      <path d={`M${f1(l.l * 0.06)} 0Q${f1(l.l * 0.5)} ${f1(-l.w * 0.12)} ${f1(l.l * 0.9)} 0`} fill="none" stroke={C.vein} strokeWidth="0.9" opacity="0.6" />
    </g>
  );
});

export function CherryDot({ c, className }: { c: Cherry; className?: string }) {
  return (
    <g className={className}>
      <circle cx={f1(c.x)} cy={f1(c.y)} r={f1(c.r)} fill={c.c} stroke={C.cherryLine} strokeWidth="0.8" />
      <circle cx={f1(c.x - c.r * 0.35)} cy={f1(c.y - c.r * 0.38)} r={f1(c.r * 0.3)} fill="#fff2df" opacity="0.55" />
    </g>
  );
}

/** A piece of art in its own layer at scene box [x, y, w, h], turning about (ox, oy). */
export function Piece({
  box,
  ox,
  oy,
  refFn,
  children,
}: {
  box: [number, number, number, number];
  ox: number;
  oy: number;
  refFn?: (el: HTMLDivElement | null) => void;
  children: ReactNode;
}) {
  const [x, y, w, h] = box;
  return (
    <div ref={refFn} className="hv-layer hv-piece" style={{ left: x, top: y, width: w, height: h, transformOrigin: `${f1(ox - x)}px ${f1(oy - y)}px` }}>
      <svg viewBox={`${x} ${y} ${w} ${h}`} width={w} height={h} aria-hidden>
        {children}
      </svg>
    </div>
  );
}

export function BranchArt({ lat, width }: { lat: { d: string; leaves: Leaf[]; cherries: Cherry[] }; width: number }) {
  return (
    <>
      <path d={lat.d} fill="none" stroke={C.branch} strokeWidth={width} strokeLinecap="round" />
      {lat.leaves.map((l, j) => (
        <LeafShape key={j} l={l} />
      ))}
      {lat.cherries.map((c, j) => (
        <CherryDot key={j} c={c} />
      ))}
    </>
  );
}

function pairs(lats: Lateral[]) {
  const out: Lateral[][] = [];
  for (let i = 0; i < lats.length; i += 2) out.push(lats.slice(i, i + 2));
  return out;
}

export default function TreeArt({ tree, rig, id }: { tree: Tree; rig: Rig; id: string }) {
  const [x, y, w, h] = tree.box;
  return (
    <>
      <svg className="hv-layer hv-still" style={{ left: x, top: y, width: w, height: h }} viewBox={`${x} ${y} ${w} ${h}`} aria-hidden>
        <path d={tree.stem} fill={C.branch} stroke="#3f2e20" strokeWidth="0.8" strokeLinejoin="round" />
      </svg>
      {pairs(tree.laterals).map((pair, i) => {
        const a = pair[0];
        return (
          <Piece key={i} box={branchBox(pair)} ox={a.ox} oy={a.oy} refFn={(el) => rig.sway(`${id}-${i}`, el, a.amp, a.period, a.phase)}>
            {pair.map((lat, j) => (
              <BranchArt key={j} lat={lat} width={lat.width} />
            ))}
          </Piece>
        );
      })}
    </>
  );
}
