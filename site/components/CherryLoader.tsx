"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { loading } from "@/lib/loading";
import { atFromUrl, waitForClock } from "@/lib/atTime";
import { LogoMark } from "./Logo";

// Loader "Cherry to bean" (replaces the latte cup; matches the hand-drawn harvest hero). On warm paper:
// a coffee branch draws itself and its leaves fill in, a green cherry ripens to red, splits open and two coffee
// beans come out, and the name rises. Then the paper slides up and away (a soft shadow under it) and the farm
// scene is underneath. The heavy hero scene is built while the finished drawing holds (onBuild), so the drawing
// itself never stutters; the hold waits for it (at most HOLD_MAX s) with a sliding copper line.
// With &at=HH:MM:SS it holds its first frame (preloading every image) and plays at that time.

const DRAW = 1.75;
const OPEN = 0.85;
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
    const ctx = gsap.context(() => {
      // start only once the first frame is on screen: the hero (a big drawing) is built in the same commit and
      // can hold the first paint back, and the branch must not finish drawing before anyone sees it
      const tl = gsap.timeline({ paused: true });
      gsap.set(".cl-sheet", { transformPerspective: 1800, transformOrigin: "50% 0%" });
      // the branch draws, the leaves follow it and fill in
      tl.to(".cl-stem", { strokeDashoffset: 0, duration: 0.65, ease: "power2.inOut" }, 0)
        .to(".cl-pedicel", { strokeDashoffset: 0, duration: 0.2, ease: "power1.out" }, 0.45)
        .to(".cl-leaf-line", { strokeDashoffset: 0, duration: 0.45, ease: "power2.out", stagger: 0.12 }, 0.25)
        .to(".cl-leaf-fill", { opacity: 1, duration: 0.35, stagger: 0.12 }, 0.5)
        // a green cherry grows, then ripens: green → yellow → red
        .fromTo(".cl-cherry", { scale: 0.2, opacity: 0, svgOrigin: "150 162" }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.6)" }, 0.5)
        .to(".cl-skin", { attr: { fill: "#c9a23a" }, duration: 0.22, ease: "none" }, 0.82)
        .to(".cl-skin", { attr: { fill: "#b8322a" }, duration: 0.25, ease: "none" }, 1.04)
        // it splits open and two beans come out
        .to(".cl-half-l", { x: -24, rotation: -16, svgOrigin: "150 162", duration: 0.35, ease: "power2.out" }, 1.3)
        .to(".cl-half-r", { x: 24, rotation: 16, svgOrigin: "150 162", duration: 0.35, ease: "power2.out" }, 1.3)
        .to([".cl-half-l", ".cl-half-r"], { opacity: 0, duration: 0.18 }, 1.44)
        .fromTo(".cl-bean", { scale: 0.55, opacity: 0, svgOrigin: "150 162" }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.8)", stagger: 0.05 }, 1.32)
        // the name rises
        .fromTo(".cl-letter", { y: 0, yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.03 }, 0.85)
        .fromTo(".cl-sub", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.25)
        // the drawing is nearly done: the page builds its hero now (the hold below waits for it)
        .to(".cl-wait", { opacity: 1, duration: 0.3 }, DRAW - 0.35)
        .add(() => {
          el.querySelector(".cl-sheet")?.classList.add("is-building");
          build();
        }, DRAW - 0.15)
        // hold here until anything the page registered (and with &at=, every image) is in
        .add(() => {
          const t0 = performance.now();
          const ok = () => imagesReady && (ready || (!target && performance.now() - t0 > HOLD_MAX * 1000));
          if (ok()) return;
          tl.pause();
          const wait = () => (ok() ? tl.play() : requestAnimationFrame(wait));
          wait();
        }, DRAW - 0.05)
        // the paper slides up and away; the farm is underneath
        .add(reveal, DRAW)
        .set(".cl-wait", { display: "none" }, DRAW)
        .add(() => el.querySelector(".cl-sheet")?.classList.remove("is-building"), DRAW)
        .to(".cl-sheet", { yPercent: -100, duration: OPEN, ease: "power3.inOut" }, DRAW)
        .to(".cl-drop", { opacity: 0, duration: OPEN, ease: "power1.in" }, DRAW)
        // the engine starts only after the paper is gone (heavy work never lands mid-reveal on slower phones)
        .add(() => {
          loading.markFinished();
          setGone(true);
        }, LOADER_SECONDS + 0.1);

      if (!target) requestAnimationFrame(() => requestAnimationFrame(() => tl.play(0)));
      if (target) {
        if (Date.now() < target.getTime()) console.log(`[record] loader frozen until ${target.toLocaleTimeString()}`);
        cancelClock = waitForClock(target, () => tl.play(0));
      }
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
      {/* a soft shadow under the lifting page */}
      <div className="cl-drop absolute inset-0 bg-[linear-gradient(180deg,rgba(42,26,16,0.35),rgba(42,26,16,0)_40%)]" />
      <div className="cl-sheet cl-paper absolute inset-0">
        <div className="cl-content absolute inset-0">
          <div className="absolute inset-x-0 top-[44%] flex -translate-y-1/2 justify-center">
            <svg viewBox="0 0 300 300" className="h-[min(48vh,72vw)] w-auto overflow-visible">
              <defs>
                <clipPath id="cl-left">
                  <rect x="0" y="0" width="150" height="300" />
                </clipPath>
                <clipPath id="cl-right">
                  <rect x="150" y="0" width="150" height="300" />
                </clipPath>
                <radialGradient id="cl-shine" cx="0.35" cy="0.3" r="0.6">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* branch */}
              <path className="cl-stem" d="M22 246C80 214 118 168 146 130S214 70 272 52" fill="none" stroke="#5a4330" strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
              {[
                [98, 186, 148],
                [104, 182, -122],
                [214, 84, -40],
                [222, 80, 150],
              ].map(([x, y, a], i) => (
                <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
                  <path className="cl-leaf-fill" d={LEAF} fill={i % 2 ? "#6f9a4a" : "#3f6a3c"} style={{ opacity: 0 }} />
                  <path className="cl-leaf-line" d={LEAF} fill="none" stroke="#1d3420" strokeWidth="1.6" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
                  <path className="cl-leaf-fill" d="M4 0Q31 -2 58 0" fill="none" stroke="#a9c77e" strokeWidth="1.2" style={{ opacity: 0 }} />
                </g>
              ))}
              <path className="cl-pedicel" d="M152 126Q153 132 151 138" fill="none" stroke="#5a4330" strokeWidth="3" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
              {/* the two beans inside */}
              {[
                [138, -14],
                [162, 14],
              ].map(([x, a], i) => (
                <g key={i} className="cl-bean" style={{ opacity: 0 }}>
                  <g transform={`translate(${x} 164) rotate(${a})`}>
                    <ellipse rx="15" ry="21" fill="#6b3c1f" stroke="#3a2010" strokeWidth="1.6" />
                    <path d="M0 -17C6 -6 -6 6 0 17" fill="none" stroke="#2a160a" strokeWidth="2.2" strokeLinecap="round" />
                    <ellipse cx="-6" cy="-8" rx="4" ry="7" fill="#fff" opacity="0.14" />
                  </g>
                </g>
              ))}
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
            </svg>
          </div>
          <div className="absolute inset-x-0 top-[calc(44%+min(24vh,36vw)+14px)] flex flex-col items-center gap-3 text-[#2a1a10]">
            <div className="font-display flex items-center gap-3 overflow-hidden pb-1 text-[clamp(28px,3.4vw,46px)]">
              <LogoMark className="cl-letter h-[0.9em] w-[0.9em] shrink-0 text-[#985018]" glow={false} />
              <span className="flex">
                {name.split("").map((ch, i) => (
                  <span key={i} className="cl-letter inline-block">
                    {ch === " " ? " " : ch}
                  </span>
                ))}
              </span>
            </div>
            <span className="cl-sub text-[12px] uppercase tracking-[0.32em] text-[#6d5744]" style={{ opacity: 0 }}>
              Picked by hand · Araku Valley
            </span>
            {/* while the farm is being built: a copper line slides (a CSS animation, so it keeps moving even while the
                page is busy) */}
            <span className="cl-wait mt-2 block h-px w-[140px] overflow-hidden bg-[#2a1a10]/15">
              <span className="cl-wait-bar block h-full w-1/3 bg-[#985018]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
