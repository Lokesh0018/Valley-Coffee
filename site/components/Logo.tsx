import { useId } from "react";

// Brand mark (from the client's logo, redrawn as a clean vector): a coffee cup whose right side becomes a coffee
// bean, with two flames of steam rising above it. One colour (currentColor), so it works on cream, white and green.
// The gap around the bean and the bean's crease are real cut-outs (masks), not painted in a background colour.

export const CUP = "M14 27H40V39C40 46.5 34.5 52 27 52C19.5 52 14 46.5 14 39Z";
export const BEAN = { cx: 44, cy: 38, rx: 12.5, ry: 15.5, rot: 30 };
export const CREASE = "M0 -13.5C-5.5 -6 5.5 4 0 13.5";
// two flame-like wisps of steam (filled), rising above the bean
export const FLAME = "M0 0C-4.2 -3.6 -3.4 -8 0 -11.2C2.2 -13.2 1.8 -16.4 0 -18.6C5.4 -15.6 6.6 -10 3.4 -5.8C2.2 -4.2 1.1 -2.2 0 0Z";
export const STEAM = [
  { x: 35, y: 22, s: 0.95 },
  { x: 43.5, y: 21.5, s: 1.08 },
];

export function LogoMark({ className = "" }: { className?: string; glow?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <defs>
        {/* the cup is cut where the bean sits, leaving a thin gap around the bean */}
        <mask id={`cup-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="#fff" />
          <ellipse cx={BEAN.cx} cy={BEAN.cy} rx={BEAN.rx + 2.8} ry={BEAN.ry + 2.8} transform={`rotate(${BEAN.rot} ${BEAN.cx} ${BEAN.cy})`} fill="#000" />
        </mask>
        {/* the bean's crease */}
        <mask id={`bean-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="#fff" />
          <path d={CREASE} transform={`translate(${BEAN.cx} ${BEAN.cy}) rotate(${BEAN.rot})`} stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </mask>
      </defs>
      <g mask={`url(#cup-${id})`}>
        <circle cx="9.5" cy="35.5" r="5.2" stroke="currentColor" strokeWidth="3.6" />
        <path d={CUP} fill="currentColor" />
      </g>
      {/* the mask sits on an untransformed wrapper (a mask lives in the coordinate space of the element it is on,
          so on the rotated ellipse the crease would be rotated twice) */}
      <g mask={`url(#bean-${id})`}>
        <ellipse cx={BEAN.cx} cy={BEAN.cy} rx={BEAN.rx} ry={BEAN.ry} transform={`rotate(${BEAN.rot} ${BEAN.cx} ${BEAN.cy})`} fill="currentColor" />
      </g>
      {STEAM.map((f) => (
        <path key={f.x} d={FLAME} transform={`translate(${f.x} ${f.y}) scale(${f.s})`} fill="currentColor" />
      ))}
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span data-brand-mark className="inline-flex h-8 w-8 shrink-0">
        <LogoMark className="h-8 w-8 text-[#1f5a35]" />
      </span>
      <span className="font-display text-[21px] leading-none tracking-[-0.01em]">Aura Roast</span>
    </span>
  );
}

/** The same mark for the browser tab: green on a soft cream tile (the gaps are cream here). */
export const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#f4ebdd"/><g transform="translate(1 2)"><circle cx="9.5" cy="35.5" r="5.2" fill="none" stroke="#1f5a35" stroke-width="3.6"/><path d="${CUP}" fill="#1f5a35"/><ellipse cx="${BEAN.cx}" cy="${BEAN.cy}" rx="${BEAN.rx + 2.8}" ry="${BEAN.ry + 2.8}" transform="rotate(${BEAN.rot} ${BEAN.cx} ${BEAN.cy})" fill="#f4ebdd"/><ellipse cx="${BEAN.cx}" cy="${BEAN.cy}" rx="${BEAN.rx}" ry="${BEAN.ry}" transform="rotate(${BEAN.rot} ${BEAN.cx} ${BEAN.cy})" fill="#1f5a35"/><path d="${CREASE}" transform="translate(${BEAN.cx} ${BEAN.cy}) rotate(${BEAN.rot})" stroke="#f4ebdd" stroke-width="3" stroke-linecap="round" fill="none"/>${STEAM.map((f) => `<path d="${FLAME}" transform="translate(${f.x} ${f.y}) scale(${f.s})" fill="#1f5a35"/>`).join("")}</g></svg>`;
