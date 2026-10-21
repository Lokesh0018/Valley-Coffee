"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { loading } from "@/lib/loading";
import { atFromUrl, waitForClock } from "@/lib/atTime";
import { BEAN, CREASE, CUP, FLAME, STEAM } from "./Logo";

// Loader "Brew the mark": the Aura Roast logo builds itself on white paper with a soft leaf-green glow. The cup's
// handle and outline draw, green coffee fills the cup with a moving surface, the bean drops in and carves its gap in
// the cup, its crease draws, and the two flames of steam rise; the name rises under it with a thin progress line.
// While the heavy hero scene is built (onBuild) the coffee surface keeps moving and the steam flickers (CSS
// animations, so they keep going while the page is busy). Then the paper slides up with a leafy green edge and the
// big mark flies into the navbar, landing exactly on the nav logo.
// With &at=HH:MM:SS it holds its first frame (preloading every image) and plays at that time.

const DRAW = 1.65;
const OPEN = 0.95;
const HOLD_MAX = 3;
export const LOADER_SECONDS = DRAW + OPEN; // 2.6

const INK = "#1f5a35"; // the nav logo's green, so the landing is seamless

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

/** Runs when the page may build its heavy hero scene: while the loader holds its finished mark, so the build
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
  // only the images that are not lazy (the first photos on the page); lazy ones arrive as you scroll
  const urls = [...new Set(Array.from(document.images).filter((i) => i.loading !== "lazy").map((i) => i.currentSrc || i.src).filter(Boolean))];
  await Promise.all([...urls.map(loadImage), document.fonts.ready]);
}

// the coffee: a wide wavy slab (one wave = 16 units, so sliding it 16 units left loops seamlessly)
const WAVE = "M-24 0Q-20 -1.6 -16 0T-8 0T0 0T8 0T16 0T24 0T32 0T40 0T48 0T56 0T64 0T72 0T80 0T88 0V40H-24Z";
const BEAN_T = `rotate(${BEAN.rot} ${BEAN.cx} ${BEAN.cy})`;

export default function BrewLoader({ name, tagline }: { name: string; tagline: string }) {
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
    const html = document.documentElement;
    html.classList.add("brand-loading"); // hides the nav logo until the flying mark lands on it

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
    const sheet = el.querySelector<HTMLElement>(".bl-sheet")!;
    const mark = el.querySelector<HTMLElement>(".bl-mark")!;

    // where the mark lands: the nav logo (centre + scale); without one it just rises away with the paper
    const flight = () => {
      const to = document.querySelector<HTMLElement>("header [data-brand-mark]")?.getBoundingClientRect();
      const from = mark.getBoundingClientRect();
      if (!to || !to.width || !from.width) return { x: 0, y: -(window.innerHeight + 110), scale: 1 };
      return {
        x: to.left + to.width / 2 - (from.left + from.width / 2),
        y: to.top + to.height / 2 - (from.top + from.height / 2),
        scale: to.width / from.width,
      };
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      // 1 · the handle and the cup's outline draw
      tl.set([".bl-handle", ".bl-outline"], { opacity: 1 }, 0.02)
        .to(".bl-handle", { strokeDashoffset: 0, duration: 0.5, ease: "power2.inOut" }, 0.04)
        .set(".bl-handle", { attr: { "stroke-dasharray": "none" } }, 0.56)
        .to(".bl-outline", { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, 0.1)
        // 2 · green coffee fills the cup; the outline melts into it
        .fromTo(".bl-level", { y: 54 }, { y: 25.4, duration: 0.62, ease: "power2.inOut" }, 0.42)
        .to(".bl-outline", { opacity: 0, duration: 0.25 }, 0.9)
        // 3 · the bean drops in, carving its gap in the cup as it lands; then its crease draws
        .fromTo(".bl-bean", { y: -44, rotation: -140, opacity: 0, svgOrigin: `${BEAN.cx} ${BEAN.cy}` }, { y: 0, rotation: 0, opacity: 1, duration: 0.5, ease: "back.out(1.3)" }, 0.72)
        .fromTo(".bl-gap", { attr: { rx: 0, ry: 0 } }, { attr: { rx: BEAN.rx + 2.8, ry: BEAN.ry + 2.8 }, duration: 0.3, ease: "power3.out" }, 1.0)
        .to(".bl-crease", { strokeDashoffset: 0, duration: 0.28, ease: "power2.out" }, 1.12)
        // 4 · two flames of steam rise
        .fromTo(".bl-flame", { scaleY: 0, scaleX: 0.6, opacity: 0, transformOrigin: "50% 100%" }, { scaleY: 1, scaleX: 1, opacity: 1, duration: 0.45, ease: "power3.out", stagger: 0.1 }, 1.1)
        // the name rises, the line of copy follows, the progress line runs
        .fromTo(".bl-letter", { y: 0, yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.03 }, 0.7)
        .fromTo(".bl-sub", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45 }, 1.08)
        .fromTo(".bl-progress", { scaleX: 0 }, { scaleX: 0.86, duration: DRAW - 0.3, ease: "power1.inOut" }, 0.2)
        // the mark is done: the steam keeps flickering while the page builds its hero (the hold below waits)
        .add(() => {
          el.classList.add("is-brewing");
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
        // 5 · the paper slides up with its leafy edge, and the mark flies into the navbar
        .add(() => {
          sheet.classList.remove("is-building");
          reveal();
        }, DRAW)
        .to(".bl-progress", { scaleX: 1, duration: 0.18, ease: "power1.out" }, DRAW)
        .to(sheet, { y: () => -(window.innerHeight + 110), duration: OPEN, ease: "power3.inOut" }, DRAW)
        .to(mark, { x: () => flight().x, y: () => flight().y, scale: () => flight().scale, duration: OPEN, ease: "power3.inOut" }, DRAW + 0.04)
        .add(() => html.classList.remove("brand-loading"), LOADER_SECONDS + 0.04)
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
      html.classList.remove("brand-loading");
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} data-loader aria-hidden className="fixed inset-0 z-[100] overflow-hidden">
      <div className="bl-sheet bl-paper absolute inset-0">
        <div className="absolute inset-x-0 top-[calc(40%+min(15vh,22vw)+18px)] flex flex-col items-center gap-3 text-[#133024]">
          <div className="font-display flex overflow-hidden pb-1 text-[clamp(32px,3.8vw,52px)] leading-none tracking-[-0.01em]">
            {name.split("").map((ch, i) => (
              <span key={i} className="bl-letter inline-block">
                {ch === " " ? " " : ch}
              </span>
            ))}
          </div>
          <span className="bl-sub px-4 text-center text-[12px] uppercase tracking-[0.2em] text-[#4f6657] sm:tracking-[0.32em]" style={{ opacity: 0 }}>
            {tagline}
          </span>
          <span className="mt-3 block h-px w-[clamp(96px,10vw,140px)] overflow-hidden bg-[#d5e2d3]">
            <span className="bl-progress block h-full w-full origin-left bg-[#2f7d4a]" style={{ transform: "scaleX(0)" }} />
          </span>
        </div>
        {/* a leafy green edge, hanging below the page; it trails into view as the page slides up */}
        <svg className="absolute left-0 top-full block h-[110px] w-full" viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden>
          <path d="M0 0H1440V46C1340 86 1240 30 1120 58S880 104 760 64 520 22 400 60 160 102 0 52Z" fill="#8fcf9f" />
          <path d="M0 0H1440V22C1320 60 1220 10 1100 36S860 80 740 44 500 4 380 40 140 78 0 30Z" fill="#2f7d4a" />
        </svg>
      </div>

      {/* the mark, above the paper so it can fly into the navbar */}
      <div className="absolute inset-x-0 top-[40%] flex -translate-y-1/2 justify-center">
        <div className="bl-mark aspect-square h-[min(30vh,44vw)] will-change-transform">
          <svg viewBox="0 0 64 64" fill="none" className="h-full w-full overflow-visible" style={{ color: INK }}>
            <defs>
              <clipPath id="bl-cup">
                <path d={CUP} />
              </clipPath>
              <mask id="bl-cut" maskUnits="userSpaceOnUse" x="-10" y="-10" width="84" height="84">
                <rect x="-10" y="-10" width="84" height="84" fill="#fff" />
                <ellipse className="bl-gap" cx={BEAN.cx} cy={BEAN.cy} rx="0" ry="0" transform={BEAN_T} fill="#000" />
              </mask>
              <mask id="bl-crease" maskUnits="userSpaceOnUse" x="-10" y="-10" width="84" height="84">
                <rect x="-10" y="-10" width="84" height="84" fill="#fff" />
                <path className="bl-crease" d={CREASE} transform={`translate(${BEAN.cx} ${BEAN.cy}) rotate(${BEAN.rot})`} stroke="#000" strokeWidth="3" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
              </mask>
            </defs>
            <g mask="url(#bl-cut)">
              <circle className="bl-handle" cx="9.5" cy="35.5" r="5.2" stroke="currentColor" strokeWidth="3.6" pathLength={1} strokeDasharray="1" strokeDashoffset="1" opacity="0" transform="rotate(-90 9.5 35.5)" />
              <path className="bl-outline" d={CUP} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" opacity="0" />
              <g clipPath="url(#bl-cup)">
                <g className="bl-level" transform="translate(0 54)">
                  <path className="bl-wave" d={WAVE} fill="currentColor" />
                </g>
              </g>
            </g>
            <g className="bl-bean" style={{ opacity: 0 }}>
              <g mask="url(#bl-crease)">
                <ellipse cx={BEAN.cx} cy={BEAN.cy} rx={BEAN.rx} ry={BEAN.ry} transform={BEAN_T} fill="currentColor" />
              </g>
            </g>
            {STEAM.map((f, i) => (
              <g key={f.x} transform={`translate(${f.x} ${f.y}) scale(${f.s})`}>
                <g className="bl-flicker" style={{ animationDelay: `${i * -0.7}s` }}>
                  <path className="bl-flame" d={FLAME} fill="currentColor" style={{ opacity: 0 }} />
                </g>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
