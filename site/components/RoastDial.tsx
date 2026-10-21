"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { roast } from "../content";
import Lines from "./Lines";

// Roast dial (Motion map M30 dial rotate): pinned; the whole section roasts with the beans (background, text and
// dial colours run Green → Light → Medium → Ember with the needle; a glow, the stop's name and drifting beans behind);
// a half-circle dial sits over a round tray of beans.
// Scrolling turns the needle Green → Light → Medium → Ember (it rests at each stop), the copper arc fills behind
// it, and the bean photo + notes switch as the needle passes each stop. The pills jump to a stop.
// ?static=1: the last stop (Ember); the pills switch stops by hand.

const ANGLES = [-66, -22, 22, 66]; // needle angle per stop (0 = straight up)
const fillFor = (angle: number) => 100 - ((angle + 90) / 180) * 100; // arc dash offset for a needle angle
// scroll progress (0–1) where the needle arrives at / leaves each stop
const ARRIVE = [0, 0.3, 0.56, 0.82];
const LEAVE = [0.12, 0.38, 0.64];

// the whole section roasts with the beans: colours per stop (Green → Light → Medium → Ember). Every token the
// section uses (text, muted, accent, line, the dial) reads these, so contrast holds at every stop.
const STAGES = [
  { "--bg": "#eef5ea", "--text": "#133024", "--muted": "#4f6657", "--accent": "#2f7d4a", "--accent-text": "#ffffff", "--line": "#cfe0cc", "--glow": "rgba(111, 190, 120, 0.45)" },
  { "--bg": "#f5ecdc", "--text": "#2c2014", "--muted": "#6a5640", "--accent": "#8a5a1e", "--accent-text": "#ffffff", "--line": "#e3d3b8", "--glow": "rgba(230, 180, 110, 0.5)" },
  { "--bg": "#d9b993", "--text": "#2a1a0e", "--muted": "#55391f", "--accent": "#6b3410", "--accent-text": "#fff4e6", "--line": "#c29d74", "--glow": "rgba(170, 92, 40, 0.45)" },
  { "--bg": "#21150e", "--text": "#f6eadb", "--muted": "#cbb59b", "--accent": "#f0a35e", "--accent-text": "#21150e", "--line": "#4a3424", "--glow": "rgba(240, 120, 50, 0.42)" },
] as const;

// deterministic background beans (same every load)
const BEANS = Array.from({ length: 14 }, (_, i) => ({ x: (i * 37 + 7) % 96, y: (i * 53 + 11) % 92, s: 14 + ((i * 7) % 18), r: (i * 47) % 360, d: 9 + ((i * 5) % 8), delay: -((i * 1.7) % 9) }));

export default function RoastDial() {
  const outer = useRef<HTMLElement>(null);
  const [active, setActive] = useState(roast.stops.length - 1);
  const motion = useRef(false);

  useEffect(() => {
    const root = outer.current!;
    const needle = root.querySelector(".dial-needle");
    const fill = root.querySelector(".dial-fill");
    if (prefersReducedMotion()) {
      gsap.set(needle, { rotation: ANGLES[3], svgOrigin: "200 200" });
      gsap.set(root, { ...STAGES[3] });
      return;
    }
    motion.current = true;
    setActive(0);

    const ctx = gsap.context(() => {
      gsap.set(needle, { rotation: ANGLES[0], svgOrigin: "200 200" });
      gsap.set(fill, { strokeDashoffset: fillFor(ANGLES[0]) });
      gsap.set(root, { ...STAGES[0] });

      let last = 0;
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
          // the four bean photos get their own layers only while the dial is pinned
          onToggle: (st) => root.classList.toggle("is-pinned", st.isActive),
        },
        onUpdate() {
          // switch the stop when the needle is halfway to it
          const p = this.progress();
          let i = 0;
          for (let k = 1; k < ARRIVE.length; k++) if (p >= (LEAVE[k - 1] + ARRIVE[k]) / 2) i = k;
          if (i !== last) {
            last = i;
            setActive(i);
          }
        },
      });
      tl.to({}, { duration: 1 }, 0);
      for (let k = 1; k < ANGLES.length; k++) {
        const d = ARRIVE[k] - LEAVE[k - 1];
        tl.to(needle, { rotation: ANGLES[k], duration: d }, LEAVE[k - 1]);
        tl.to(fill, { strokeDashoffset: fillFor(ANGLES[k]), duration: d }, LEAVE[k - 1]);
        // the section roasts along with the needle
        tl.to(root, { ...STAGES[k], duration: d, ease: "sine.inOut" }, LEAVE[k - 1]);
      }
    }, root);
    return () => {
      motion.current = false;
      ctx.revert();
    };
  }, []);

  // without motion the pills switch stops by hand: the colours follow
  useEffect(() => {
    if (motion.current || !outer.current) return;
    gsap.to(outer.current, { ...STAGES[active], duration: 0.6, ease: "sine.inOut" });
  }, [active]);

  // pill: with motion, scroll to where the needle rests on that stop; without, just switch
  const go = (i: number) => {
    const root = outer.current;
    if (!motion.current || !root || !window.__lenis) return setActive(i);
    const travel = root.offsetHeight - window.innerHeight;
    const rest = i === 0 ? 0.05 : (ARRIVE[i] + (LEAVE[i] ?? 1)) / 2;
    window.__lenis.scrollTo(root.offsetTop + travel * rest, { duration: 1.4 });
  };

  return (
    <section ref={outer} id="roast" className="roast-outer pin-outer relative z-[3] bg-bg" style={{ height: "320vh" }} data-record-time="1.4" data-record-label="Roast dial">
      {/* record-mode stop: the needle has reached Ember (90% of the 220vh of scroll) */}
      <div aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: "198vh" }} data-record-time="3.4" data-record-label="Roast dial: Ember" />
      <div className="pin-stage flex items-center">
        {/* background: a soft glow behind the dial (green → ember heat), the stop's name huge and faint, drifting beans */}
        <div aria-hidden className="roast-bg pointer-events-none absolute inset-0 overflow-hidden">
          <div className="roast-glow absolute right-[-8%] top-1/2 aspect-square w-[min(78vw,1100px)] -translate-y-1/2 rounded-full max-lg:left-1/2 max-lg:right-auto max-lg:top-[32%] max-lg:w-[130vw] max-lg:-translate-x-1/2" />
          {roast.stops.map((s, i) => (
            <span
              key={s.name}
              className="roast-word font-display absolute bottom-[-0.12em] right-[-0.04em] whitespace-nowrap leading-none transition-opacity duration-700 max-lg:bottom-auto max-lg:right-auto max-lg:left-1/2 max-lg:top-[4%] max-lg:-translate-x-1/2"
              style={{ opacity: i === active ? 1 : 0 }}
            >
              {s.name}
            </span>
          ))}
          {BEANS.map((b, i) => (
            <svg
              key={i}
              viewBox="-10 -14 20 28"
              className="roast-bean absolute"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s * 1.4, animationDuration: `${b.d}s`, animationDelay: `${b.delay}s`, rotate: `${b.r}deg` }}
            >
              <ellipse rx="9" ry="13" fill="currentColor" />
              <path d="M0 -10C4 -4 -4 4 0 10" stroke="var(--bg)" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          ))}
        </div>
        {/* laptop: text left, dial right · below 1024px (phones, tablets): big dial on top, text below */}
        <div className="container-x relative z-[1] grid items-center gap-10 max-lg:flex max-lg:h-full max-lg:flex-col max-lg:justify-center max-lg:gap-[3vh] max-lg:pt-[9vh] lg:grid-cols-12">
          {/* text */}
          <div className="lg:col-span-5 max-lg:order-2 max-lg:w-full max-lg:max-w-[560px]">
            <p className="eyebrow mb-6 uppercase max-lg:mb-3">{roast.eyebrow}</p>
            <Lines lines={roast.title} className="text-[clamp(40px,5.2vw,92px)] max-lg:text-[clamp(32px,6vw,56px)]" />

            <div className="relative mt-[clamp(24px,5vh,56px)] grid max-lg:mt-[2vh]">
              {roast.stops.map((s, i) => (
                <div
                  key={s.name}
                  data-roast-panel={i}
                  className={`roast-panel col-start-1 row-start-1 ${i === active ? "is-on" : ""}`}
                  style={{ transform: `translateY(${i === active ? 0 : i < active ? -18 : 18}px)` }}
                  aria-hidden={i !== active}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-[clamp(34px,3.4vw,54px)] text-accent">{s.name}</span>
                    <span className="text-[14px] text-muted">{s.sub}</span>
                  </div>
                  <p className="mt-3 max-w-[420px] text-[17px] leading-relaxed">{s.notes}</p>
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-muted">
                    <span>{s.time} in the drum</span>
                    <span>{s.temp}</span>
                    <span className="text-fg">{s.best}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-[clamp(24px,5vh,48px)] flex flex-wrap gap-2 max-lg:mt-[2vh]">
              {roast.stops.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => go(i)}
                  className={`roast-pill min-h-11 rounded-full border px-4 py-2 text-[13px] max-md:text-[14px] transition-colors duration-300 ${i === active ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:text-fg"}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* dial + bean tray */}
          <div className="relative mx-auto aspect-square w-full max-w-[min(680px,78vh)] lg:col-span-7 max-lg:order-1 max-lg:w-[min(86vw,46vh)] max-lg:shrink-0">
            <div className="absolute inset-[13%] overflow-hidden rounded-full border border-line/40 shadow-md">
              <div className="roast-tray absolute inset-0">
                {roast.stops.map((s, i) => (
                  <img
                    key={s.name}
                    width={1000}
                    height={1000}
                    decoding="async"
                    src={s.image}
                    alt={`${s.name} roast coffee beans`}
                    data-roast-img={i}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                    style={{ opacity: i === active ? 1 : 0 }}
                  />
                ))}
              </div>
            </div>
            <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
              {/* the arc */}
              <path d="M 34 200 A 166 166 0 0 1 366 200" style={{ stroke: "var(--line)" }} strokeWidth="10" strokeLinecap="round" fill="none" />
              <path
                className="dial-fill"
                d="M 34 200 A 166 166 0 0 1 366 200"
                style={{ stroke: "var(--accent)" }}
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={fillFor(ANGLES[3])}
              />
              {/* ticks + labels */}
              {roast.stops.map((s, i) => {
                const a = ((ANGLES[i] - 90) * Math.PI) / 180;
                const x1 = 200 + Math.cos(a) * 178;
                const y1 = 200 + Math.sin(a) * 178;
                const x2 = 200 + Math.cos(a) * 190;
                const y2 = 200 + Math.sin(a) * 190;
                const lx = 200 + Math.cos(a) * 214;
                const ly = 200 + Math.sin(a) * 214;
                return (
                  <g key={s.name}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: "var(--muted)" }} strokeWidth="1.5" />
                    <text
                      x={lx}
                      y={ly + 5}
                      textAnchor="middle"
                      fontSize="14"
                      fontFamily="var(--font-body-family)"
                      fontWeight={i === active ? 600 : 400}
                      style={{ fill: i === active ? "var(--accent)" : "var(--muted)", transition: "fill .4s ease" }}
                    >
                      {s.name}
                    </text>
                  </g>
                );
              })}
              {/* needle (GSAP turns it around the dial centre) */}
              <g className="dial-needle">
                <path d="M200 26 L207 44 L193 44 Z" style={{ fill: "var(--accent)" }} />
                <circle cx="200" cy="18" r="3" style={{ fill: "var(--accent)" }} opacity=".6" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
