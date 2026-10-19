"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useFramePlayer } from "@/components/engine/useFramePlayer";
import { pour } from "../content";
import Lines from "./Lines";

// THE SIGNATURE (Motion map M27 frame-sequence scrub): pinned; the pour-over video fills the jug as you scroll.
// On the left a café brew scale counts the timer and the grams, and the five recipe steps light up in turn.
// ?static=1: the finished brew (last frame, 3:00, 250 g, all steps lit).

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Water on the scale through the brew (seconds → grams): bloom to 50 g, rest, pour to 150 g, rest, pour to 250 g.
const WATER: [number, number][] = [
  [0, 0],
  [15, 50],
  [45, 50],
  [70, 150],
  [90, 150],
  [120, 250],
  [180, 250],
];
const gramsAt = (t: number) => {
  for (let i = 1; i < WATER.length; i++) {
    const [t1, g1] = WATER[i];
    const [t0, g0] = WATER[i - 1];
    if (t <= t1) return g0 + ((g1 - g0) * (t - t0)) / (t1 - t0);
  }
  return WATER[WATER.length - 1][1];
};
const stepSeconds = pour.steps.map((s) => {
  const [m, sec] = s.at.split(":").map(Number);
  return m * 60 + sec;
});

export default function ThePour() {
  const outer = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // phones get lighter centre-cut frames (the video only fills the top of a phone screen)
  const [frames] = useState(() => (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? pour.framesPhone : pour.frames));
  const player = useFramePlayer(frames, canvas);

  useEffect(() => {
    if (prefersReducedMotion()) {
      player.current.seek(1); // the finished brew
      return;
    }
    const root = outer.current!;
    const time = root.querySelector<HTMLElement>(".scale-time")!;
    const grams = root.querySelector<HTMLElement>(".scale-grams")!;
    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    const rail = root.querySelector<HTMLElement>(".pour-rail-fill")!;
    const bar = root.querySelector<HTMLElement>(".scale-bar")!;
    const now = root.querySelector<HTMLElement>(".scale-now")!;
    const nowN = root.querySelector<HTMLElement>(".scale-now-n")!;
    const detail = root.querySelector<HTMLElement>(".scale-detail")!;

    // M27: the frames, the scale and the steps all follow one scrubbed progress
    const render = (p: number) => {
      player.current.seek(p);
      const t = Math.min(pour.total.seconds, p * pour.total.seconds * 1.04); // reaches 3:00 just before the end
      time.textContent = fmtTime(t);
      grams.textContent = gramsAt(t).toFixed(1);
      let cur = 0;
      stepSeconds.forEach((s, i) => {
        if (t >= s) cur = i;
      });
      steps.forEach((el, i) => {
        el.classList.toggle("is-on", t >= stepSeconds[i]);
        el.classList.toggle("is-current", i === cur);
      });
      const k = t / pour.total.seconds;
      rail.style.transform = `scaleY(${k})`;
      bar.style.transform = `scaleX(${k})`;
      now.textContent = pour.steps[cur].name;
      nowN.textContent = `${cur + 1} of ${pour.steps.length}`;
      detail.textContent = pour.steps[cur].detail;
    };

    const ctx = gsap.context(() => {
      const state = { p: 0 };
      render(0);
      gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.7 },
        onUpdate: () => render(state.p),
      });

    }, root);
    return () => ctx.revert();
  }, [player]);

  return (
    <section ref={outer} id="pour" data-cursor="Pour" data-cursor-demo="Pour" className="pour-outer pin-outer" style={{ height: "380vh" }} data-record-time="1" data-record-label="The Pour">
      {/* record-mode stop: the jug is full (end of the pin) */}
      <div aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: "calc(100% - 100vh)" }} data-record-time="3.8" data-record-label="The Pour: full jug" />
      <div className="pin-stage">
        {/* phone: the video takes the top of the screen so the whole dripper + jug shows above the scale */}
        <canvas ref={canvas} className="absolute inset-0 h-full w-full max-md:bottom-auto max-md:h-[56%]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(250,252,247,0.95)_0%,rgba(250,252,247,0.82)_34%,transparent_60%),linear-gradient(0deg,rgba(250,252,247,0.8)_0%,transparent_22%)] max-md:bg-[linear-gradient(0deg,#fafcf7_0%,#fafcf7_50%,rgba(250,252,247,0)_60%)]" />

        <div className="container-x relative z-[2] flex h-full flex-col justify-center pt-[84px] max-md:justify-end max-md:pb-[5vh] max-md:pt-0">
          <div className="pour-copy max-w-[580px]">
            <p className="eyebrow mb-6 uppercase">{pour.eyebrow}</p>
            <Lines lines={pour.title} className="text-[clamp(38px,4.4vw,78px)]" />

            <ul className="mt-6 flex flex-wrap gap-2 max-md:hidden">
              {pour.recipe.map((r, i) => (
                <li key={r} className="inline-flex items-center gap-1.5 rounded-full border border-[#133024]/15 bg-[#fafcf7]/70 px-3 py-1.5 text-[13px] text-[#133024] backdrop-blur-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#24683c]">
                    {i === 0 && <path d="M12 3C7 3 5 8 5 12s2 9 7 9 7-5 7-9-2-9-7-9Zm0 0c-2 4 2 8 0 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
                    {i === 1 && <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />}
                    {i === 2 && <path d="M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0Zm2 1v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
                    {i === 3 && <path d="M5 7h14M7 12h10M9 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
                  </svg>
                  {r}
                </li>
              ))}
            </ul>

            {/* brew scale: time + water, the current step and the brew's progress */}
            <div className="brew-scale mt-[clamp(20px,4vh,36px)] inline-block rounded-[22px] bg-[#10261b] p-2 shadow-[0_24px_50px_-18px_rgba(16,38,27,0.7),inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="flex items-stretch gap-1.5">
                <div className="rounded-[15px] bg-[#163324] px-5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a9c4b1] max-md:text-[12px]">Time</p>
                  <p className="scale-time mt-1.5 font-mono text-[clamp(30px,2.8vw,44px)] leading-none tabular-nums text-[#8fe3a8] [text-shadow:0_0_18px_rgba(111,208,140,0.55)]">
                    {fmtTime(pour.total.seconds)}
                  </p>
                </div>
                <div className="rounded-[15px] bg-[#163324] px-5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a9c4b1] max-md:text-[12px]">Water</p>
                  <p className="mt-1.5 font-mono text-[clamp(30px,2.8vw,44px)] leading-none tabular-nums text-[#8fe3a8] [text-shadow:0_0_18px_rgba(111,208,140,0.55)]">
                    <span className="scale-grams">{pour.total.grams.toFixed(1)}</span>
                    <span className="ml-1 text-[0.45em] text-[#a9c4b1]">g</span>
                  </p>
                </div>
              </div>
              <div className="px-3 pb-1.5 pt-3">
                <div className="flex items-center justify-between text-[12px] text-[#cfe3d4] max-md:text-[13px]">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8fe3a8] shadow-[0_0_8px_#8fe3a8]" />
                    Now: <span className="scale-now font-semibold text-white">{pour.steps[pour.steps.length - 1].name}</span>
                  </span>
                  <span className="scale-now-n tabular-nums text-[#a9c4b1]">
                    {pour.steps.length} of {pour.steps.length}
                  </span>
                </div>
                {/* phones: the current step's description lives here instead of the timeline */}
                <p className="scale-detail mt-1.5 text-[13px] text-[#cfe3d4] md:hidden">{pour.steps[pour.steps.length - 1].detail}</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="scale-bar h-full origin-left rounded-full bg-[#8fe3a8]" />
                </div>
              </div>
            </div>

            {/* recipe steps as a brew timeline: the rail fills as the brew goes on */}
            <ol className="pour-steps relative mt-[clamp(20px,4vh,36px)] space-y-[clamp(4px,1vh,10px)] max-md:hidden">
              <span aria-hidden className="absolute bottom-3 left-[67px] top-3 w-px bg-[#133024]/15" />
              <span aria-hidden className="pour-rail-fill absolute bottom-3 left-[67px] top-3 w-px origin-top bg-[#24683c]" />
              {pour.steps.map((s, i) => (
                <li key={s.name} data-step={i} className={`pour-step is-on flex items-start gap-4 ${i === pour.steps.length - 1 ? "is-current" : ""}`}>
                  <span className="w-11 pt-[3px] font-mono text-[13px] tabular-nums text-muted max-md:text-[14px]">{s.at}</span>
                  <span className="step-dot relative z-[1] mt-[5px] grid h-[14px] w-[14px] shrink-0 place-items-center rounded-full">
                    <svg viewBox="0 0 12 12" className="step-tick h-2 w-2" aria-hidden>
                      <path d="M2.5 6.2l2.2 2.2L9.5 3.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="step-name block text-[clamp(15px,1.2vw,18px)] font-medium leading-snug">{s.name}</span>
                    <span className="step-detail block text-[14px] text-muted">{s.detail}</span>
                  </span>
                </li>
              ))}
            </ol>


          </div>
        </div>
      </div>
    </section>
  );
}
