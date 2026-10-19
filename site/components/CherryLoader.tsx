"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { loading } from "@/lib/loading";
import { atFromUrl, waitForClock } from "@/lib/atTime";
import { LogoMark } from "./Logo";

// Loader "Cherry to bean". On white paper with a soft leaf-green glow, a coffee branch (swaying gently the whole
// time) draws itself and its leaves unfold; a green cherry grows and ripens to red, pops open with a little spray
// and two raw (pale green) coffee beans come out; the name rises. While the heavy hero scene is built (onBuild),
// the beans slowly roast to brown, so the wait is part of the story; both the sway and the roast are CSS
// animations on their own layers, so they keep moving while the page is busy. Then the paper slides up with a
// leafy green edge trailing under it, and the farm is underneath.
// With &at=HH:MM:SS it holds its first frame (preloading every image) and plays at that time.

const DRAW = 1.65;
const OPEN = 0.95;
const HOLD_MAX = 3;
export const LOADER_SECONDS = DRAW + OPEN; // 2.6

let revealed = false;

/** Runs when the paper starts sliding off the site (immediately if it already has, or with ?static=1). */
export function onReveal(fn: () => void) {
  if (revealed) {
    fn();
    return () => {};
  }
  const h = () => fn();
  window.addEventListener("ember:reveal", h, { once: true });
  return () => window.removeEventListener("ember:reveal", h);
}

let built = false;

/** Runs when the page may build its heavy hero scene: while the loader holds its finished drawing, so the build
 *  never stalls the drawing (immediately with ?static=1, or with &at= so everything is ready before the clock). */
export function onBuild(fn: () => void) {
  if (built) {
    fn();
    return () => {};
  }
  const h = () => fn();
  window.addEventListener("ember:build", h, { once: true });
  return () => window.removeEventListener("ember:build", h);
}

function build() {
  if (built) return;
  built = true;
  window.dispatchEvent(new Event("ember:build"));
}

function reveal() {
  if (revealed) return;
  revealed = true;
  window.dispatchEvent(new Event("ember:reveal"));
}

const loadImage = (src: string) =>
  new Promise<void>((done) => {
    const img = new Image();
    img.onload = img.onerror = () => done();
    img.src = src;
  });

async function preloadAll() {
  const urls = [...new Set(Array.from(document.images).map((i) => i.currentSrc || i.src).filter(Boolean))];
  await Promise.all([...urls.map(loadImage), document.fonts.ready]);
}

const LEAF = "M0 0C14 -15 42 -17 62 0C42 17 14 15 0 0Z";
const LEAVES: [number, number, number, string][] = [
  [98, 186, 148, "#3f7a46"],
  [104, 182, -122, "#6fae5a"],
  [214, 84, -40, "#3f7a46"],
  [222, 80, 150, "#6fae5a"],
];
const BEANS: [number, number][] = [
  [138, -14],
  [162, 14],
];
const DROPS: [number, number, number][] = [
  [-1, -1, 3.2],
  [1, -1.2, 2.6],
  [-1.3, 0.4, 2.2],
  [1.2, 0.6, 2.8],
  [0, -1.5, 2],
];

function Beans({ fill, line, crease, shine }: { fill: string; line: string; crease: string; shine: number }) {
  return (
    <>
      {BEANS.map(([x, a], i) => (
        <g key={i} className="cl-bean" style={{ opacity: 0 }}>
          <g transform={`translate(${x} 164) rotate(${a})`}>
            <ellipse rx="15" ry="21" fill={fill} stroke={line} strokeWidth="1.6" />
            <path d="M0 -17C6 -6 -6 6 0 17" fill="none" stroke={crease} strokeWidth="2.2" strokeLinecap="round" />
            <ellipse cx="-6" cy="-8" rx="4" ry="7" fill="#fff" opacity={shine} />
          </g>
        </g>
      ))}
    </>
  );
}

export default function CherryLoader({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setGone(true);
      build();
      reveal();
      loading.markFinished();
      return;
    }
    window.scrollTo(0, 0);

    const target = atFromUrl();
    if (target) build();
    let ready = false;
    let imagesReady = !target;
    loading.register("hero"); // HarvestHero marks it done once its scene is built
    const unsub = loading.subscribe((_, done) => {
      if (done) ready = true;
    });
    if (target) {
      const t0 = performance.now();
      Promise.all([preloadAll(), new Promise<void>((r) => { const w = () => (ready ? r() : requestAnimationFrame(w)); w(); })]).then(() => {
        imagesReady = true;
        console.log(`[record] loader: all images ready in ${((performance.now() - t0) / 1000).toFixed(1)} s`);
      });
    }
    let cancelClock = () => {};

    const el = root.current!;
    const sheet = el.querySelector<HTMLElement>(".cl-sheet")!;
    const ctx = gsap.context(() => {
      // start only once the first frame is on screen (the hero is built in the same commit and can hold the
      // first paint back; the branch must not finish drawing before anyone sees it)
      const tl = gsap.timeline({ paused: true });
      // the branch draws, the leaves unfold from it
      tl.set(".cl-stem", { opacity: 1 }, 0.02)
        .set(".cl-pedicel", { opacity: 1 }, 0.4)
        .to(".cl-stem", { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, 0.02)
        .fromTo(".cl-leaf", { scale: 0, rotation: -30, transformOrigin: "0% 50%" }, { scale: 1, rotation: 0, duration: 0.55, ease: "back.out(1.7)", stagger: 0.09 }, 0.2)
        .to(".cl-pedicel", { strokeDashoffset: 0, duration: 0.2, ease: "power1.out" }, 0.4)
        // a green cherry grows, then ripens: green → yellow → red
        .fromTo(".cl-cherry", { scale: 0.2, opacity: 0, svgOrigin: "150 162" }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.8)" }, 0.48)
        .to(".cl-skin", { attr: { fill: "#c9a23a" }, duration: 0.2, ease: "none" }, 0.78)
        .to(".cl-skin", { attr: { fill: "#c0362b" }, duration: 0.22, ease: "none" }, 0.98)
        // it swells, pops open with a little spray, and two raw beans come out
        .to(".cl-cherry", { scale: 1.12, svgOrigin: "150 162", duration: 0.12, ease: "power2.out" }, 1.2)
        .to(".cl-half-l", { x: -26, y: 4, rotation: -20, svgOrigin: "150 162", duration: 0.34, ease: "power2.out" }, 1.32)
        .to(".cl-half-r", { x: 26, y: 4, rotation: 20, svgOrigin: "150 162", duration: 0.34, ease: "power2.out" }, 1.32)
        .to([".cl-half-l", ".cl-half-r"], { opacity: 0, duration: 0.16 }, 1.42)
        .fromTo(".cl-bean", { scale: 0.5, opacity: 0, svgOrigin: "150 164" }, { scale: 1, opacity: 1, duration: 0.42, ease: "back.out(2)", stagger: 0.05 }, 1.33);
      gsap.utils.toArray<SVGCircleElement>(".cl-juice").forEach((d, i) => {
        const [dx, dy] = DROPS[i];
        tl.fromTo(d, { x: 0, y: 0, opacity: 0 }, { x: dx * 46, y: dy * 40, opacity: 1, duration: 0.2, ease: "power2.out" }, 1.32).to(d, { opacity: 0, y: dy * 40 + 14, duration: 0.18, ease: "power1.in" }, 1.4);
      });
      // the name rises
      tl.fromTo(".cl-letter", { y: 0, yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.03 }, 0.8)
        .fromTo(".cl-sub", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45 }, 1.15)
        // the drawing is done: the beans start to roast while the page builds its hero (the hold below waits)
        .add(() => {
          el.classList.add("is-roasting");
          sheet.classList.add("is-building");
          build();
        }, DRAW - 0.2)
        .add(() => {
          const t0 = performance.now();
          const ok = () => imagesReady && (ready || (!target && performance.now() - t0 > HOLD_MAX * 1000));
          if (ok()) return;
          tl.pause();
          const wait = () => (ok() ? tl.play() : requestAnimationFrame(wait));
          wait();
        }, DRAW - 0.05)
        // the paper slides up, a leafy green edge trailing under it; the farm is underneath
        .add(() => {
          sheet.classList.remove("is-building");
          reveal();
        }, DRAW)
        .to(sheet, { y: () => -(window.innerHeight + 110), duration: OPEN, ease: "power3.inOut" }, DRAW)
        // the engine starts only after the paper is gone (heavy work never lands mid-reveal on slower phones)
        .add(() => {
          loading.markFinished();
          setGone(true);
        }, LOADER_SECONDS + 0.1);

      if (target) {
        if (Date.now() < target.getTime()) console.log(`[record] loader frozen until ${target.toLocaleTimeString()}`);
        cancelClock = waitForClock(target, () => tl.play(0));
      } else requestAnimationFrame(() => requestAnimationFrame(() => tl.play(0)));
    }, el);

    return () => {
      unsub();
      cancelClock();
      ctx.revert();
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} data-loader aria-hidden className="fixed inset-0 z-[100] overflow-hidden">
      <div className="cl-sheet cl-paper absolute inset-0">
        <div className="absolute inset-x-0 top-[42%] flex -translate-y-1/2 justify-center">
          <div className="cl-sway relative aspect-square h-[min(48vh,72vw)]">
            <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <clipPath id="cl-left">
                  <rect x="0" y="0" width="150" height="300" />
                </clipPath>
                <clipPath id="cl-right">
                  <rect x="150" y="0" width="150" height="300" />
                </clipPath>
                <radialGradient id="cl-shine" cx="0.35" cy="0.3" r="0.6">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* branch */}
              <path className="cl-stem" d="M22 246C80 214 118 168 146 130S214 70 272 52" fill="none" stroke="#5a4330" strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" opacity="0" />
              {LEAVES.map(([x, y, a, c], i) => (
                <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
                  <g className="cl-leaf" style={{ transform: "scale(0)" }}>
                    <path d={LEAF} fill={c} stroke="#1d3a24" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M4 0Q31 -2 58 0" fill="none" stroke="#bfe0a8" strokeWidth="1.2" opacity="0.8" />
                  </g>
                </g>
              ))}
              <path className="cl-pedicel" d="M152 126Q153 132 151 138" fill="none" stroke="#5a4330" strokeWidth="3" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" opacity="0" />
              {/* raw beans (they roast in the layer above) */}
              <Beans fill="#bcc78c" line="#6f7c45" crease="#5f6b3a" shine={0.3} />
              {/* the cherry: two halves of one skin, so it can split */}
              <g className="cl-cherry" style={{ opacity: 0 }}>
                {[
                  ["cl-half-l", "cl-left"],
                  ["cl-half-r", "cl-right"],
                ].map(([cls, clip]) => (
                  <g key={cls} className={cls}>
                    <g clipPath={`url(#${clip})`}>
                      <circle className="cl-skin" cx="150" cy="162" r="28" fill="#8fa04a" stroke="#4a2a1a" strokeWidth="1.8" />
                      <circle cx="150" cy="162" r="28" fill="url(#cl-shine)" />
                      <circle cx="157" cy="170" r="2.6" fill="#3a1a12" opacity="0.6" />
                    </g>
                  </g>
                ))}
              </g>
              {DROPS.map(([, , r], i) => (
                <circle key={i} className="cl-juice" cx="150" cy="162" r={r} fill="#c0362b" style={{ opacity: 0 }} />
              ))}
            </svg>
            {/* roasted beans: a second layer that cross-fades in while the farm is built */}
            <div className="cl-roasted absolute inset-0">
              <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full overflow-visible">
                <Beans fill="#6b3c1f" line="#3a2010" crease="#2a160a" shine={0.16} />
              </svg>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 top-[calc(42%+min(24vh,36vw)+12px)] flex flex-col items-center gap-3 text-[#133024]">
          <div className="font-display flex items-center gap-3 overflow-hidden pb-1 text-[clamp(28px,3.4vw,46px)]">
            <LogoMark className="cl-letter h-[0.9em] w-[0.9em] shrink-0 text-[#2f7d4a]" glow={false} />
            <span className="flex">
              {name.split("").map((ch, i) => (
                <span key={i} className="cl-letter inline-block">
                  {ch === " " ? " " : ch}
                </span>
              ))}
            </span>
          </div>
          <span className="cl-sub text-[12px] uppercase tracking-[0.32em] text-[#4f6657]" style={{ opacity: 0 }}>
            From cherry to cup · Araku Valley
          </span>
        </div>
        {/* a leafy green edge, hanging below the page; it trails into view as the page slides up */}
        <svg className="absolute left-0 top-full block h-[110px] w-full" viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden>
          <path d="M0 0H1440V46C1340 86 1240 30 1120 58S880 104 760 64 520 22 400 60 160 102 0 52Z" fill="#8fcf9f" />
          <path d="M0 0H1440V22C1320 60 1220 10 1100 36S860 80 740 44 500 4 380 40 140 78 0 30Z" fill="#2f7d4a" />
        </svg>
      </div>
    </div>
  );
}
