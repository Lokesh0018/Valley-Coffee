"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { onBuild, onReveal } from "./CherryLoader";
import { loading } from "@/lib/loading";
import { harvest } from "../content";
import Lines from "./Lines";
import { branchBox, C, coffeeTree, dressBranch, f1, leafPath, rng, SCENE_H, SCENE_W } from "./harvest/art";
import Backdrop, { HarvestDefs } from "./harvest/Backdrop";
import TreeArt, { BranchArt, CherryDot, Piece } from "./harvest/Tree";
import { POSES, WomanKneeling, WomanPicking, WomanReaching } from "./harvest/People";
import { Rig } from "./harvest/rig";

// Hero "Picked by hand" — a handmade, storybook-style animated illustration of the Araku coffee harvest, all
// drawn and animated in code (no images, no video). One screen, a seamless 10 s loop:
//   W1 reaches up, picks, drops the cherries in the basket at her waist (twice); W2 picks at waist height into
//   the tub on her hip (three times); W3 moves handfuls from her lap tub into the big bamboo basket (twice).
//   The baskets fill a little and quietly settle back as the loop closes. Branches sway in a mountain breeze,
//   saree ends move, mist drifts between the ridges, sun rays flicker through the canopy, pollen floats.
// The scene lives on a 1920 × 1080 stage, scaled to cover the screen (on portrait screens it frames the women and
// leaves the sky for the text). Paused off screen. ?static=1 / reduced motion: the still illustration.

const T1 = coffeeTree({ seed: 5, x: 1000, base: 882, height: 600, spread: 290, n: 22, lean: 10, leafScale: 1.2, sway: 0.9, cherries: 0.7 });
const T2 = coffeeTree({ seed: 12, x: 1200, base: 878, height: 560, spread: 270, n: 20, lean: -8, leafScale: 1.2, sway: 0.9, cherries: 0.7 });
const T3 = coffeeTree({ seed: 19, x: 1478, base: 870, height: 520, spread: 250, n: 18, lean: 12, leafScale: 1.15, sway: 0.9, cherries: 0.6 });
const T4 = coffeeTree({ seed: 27, x: 1740, base: 880, height: 560, spread: 270, n: 20, lean: -6, leafScale: 1.2, sway: 0.9, cherries: 0.6 });
const TL = coffeeTree({ seed: 33, x: 90, base: 1160, height: 300, spread: 300, n: 10, leafScale: 1.7, cherryR: 7.5, sway: 1.3, minT: 0.2, cherries: 0.35 });
const TF = coffeeTree({ seed: 41, x: 1880, base: 1150, height: 1060, spread: 760, n: 8, lean: -90, leafScale: 1.9, cherryR: 7.5, side: -1, minT: 0.7, sway: 0.8, cherries: 0.32 });

// The two branches the women pick from (each dips a little when a cherry is pulled)
function pickBranch(seed: number, sx: number, sy: number, cx: number, cy: number, ex: number, ey: number) {
  const q = { sx, sy, cx, cy, ex, ey };
  const { leaves } = dressBranch(q, rng(seed), { leafScale: 1, cherryR: 5.5, t: 0.6, cherries: 0 });
  return { d: `M${sx} ${sy}Q${cx} ${cy} ${ex} ${ey}`, leaves, ox: sx, oy: sy };
}
const PICK1 = pickBranch(61, 1004, 500, 1070, 470, 1140, 492);
const PICK2 = pickBranch(73, 1200, 660, 1250, 640, 1300, 668);
function cluster(seed: number, x: number, y: number, n: number, r = 5.6) {
  const g = rng(seed);
  const tones = [C.red, C.burgundy, C.ripe, C.red, C.turning, C.burgundy];
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + g();
    const d = i === 0 ? 0 : r * (1.3 + g() * 0.5);
    return { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * 0.85, r: r * (0.9 + g() * 0.2), c: tones[i % tones.length] };
  });
}
const CL1 = cluster(81, 1093, 484, 10);
const CL2 = cluster(91, 1255, 655, 9);

const STARS = (() => {
  const g = rng(17);
  return Array.from({ length: 26 }, () => ({ x: 940 + g() * 820, y: 170 + g() * 620, s: 3 + g() * 3.5, d: 7 + g() * 7, delay: -g() * 14 }));
})();

function Fern({ x, y, s, flip, dur }: { x: number; y: number; s: number; flip?: boolean; dur: number }) {
  const r = rng(Math.round(x));
  const fronds = [-38, -14, 8, 30].map((a) => ({ a: a + (r() - 0.5) * 10, l: 120 + r() * 70 }));
  return (
    <div className="hv-layer hv-fern hv-anim" style={{ left: x - 160 * s, top: y - 220 * s, width: 320 * s, height: 220 * s, animationDuration: `${dur}s` }}>
      <svg viewBox="-160 -220 320 220" width="100%" height="100%" style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
        {fronds.map((f, i) => {
          const rad = ((f.a - 90) * Math.PI) / 180;
          const ex = Math.cos(rad) * f.l;
          const ey = Math.sin(rad) * f.l;
          const cx = ex * 0.4 + (f.a > 0 ? 20 : -20);
          const cy = ey * 0.6;
          const pinnae = Array.from({ length: 11 }, (_, k) => {
            const u = (k + 1) / 12;
            const px = 2 * u * (1 - u) * cx + u * u * ex;
            const py = 2 * u * (1 - u) * cy + u * u * ey;
            return { px, py, l: 28 * (1 - u * 0.7) };
          });
          return (
            <g key={i}>
              <path d={`M0 0Q${f1(cx)} ${f1(cy)} ${f1(ex)} ${f1(ey)}`} fill="none" stroke="#3f5f33" strokeWidth="2" />
              {pinnae.map((p, k) =>
                [-1, 1].map((side) => (
                  <path
                    key={`${k}${side}`}
                    d={leafPath(p.l, p.l * 0.28, 0.4)}
                    transform={`translate(${f1(p.px)} ${f1(p.py)}) rotate(${f1(f.a - 90 + side * 62)})`}
                    fill={k % 2 ? "#5b8746" : "#4c773c"}
                    stroke="#2d4a26"
                    strokeWidth="0.7"
                  />
                )),
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function HarvestHero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rig = useMemo(() => new Rig(), []);
  // the scene (~10k SVG nodes) is built while the loader holds its finished drawing, never during it
  const [built, setBuilt] = useState(false);
  useEffect(() => onBuild(() => setBuilt(true)), []);
  useEffect(() => {
    if (!built) return;
    // tell the loader once the scene has been laid out and painted
    const id = requestAnimationFrame(() => requestAnimationFrame(() => loading.update("hero", 1)));
    return () => cancelAnimationFrame(id);
  }, [built]);

  // cover the screen with the 1920 × 1080 scene, ground at the bottom; portrait screens frame the women
  useLayoutEffect(() => {
    const el = root.current!;
    const fit = () => {
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      const portrait = vw / vh < 0.8;
      el.classList.toggle("hv-portrait", portrait);
      const R = portrait ? { x: 1000, y: -520, w: 720, h: 1600 } : { x: 0, y: 0, w: SCENE_W, h: SCENE_H };
      const s = Math.max(vw / R.w, vh / R.h);
      const tx = vw / 2 - (R.x + R.w / 2) * s;
      const ty = vh - (R.y + R.h) * s;
      stage.current!.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!built || prefersReducedMotion()) return;
    const el = root.current!;
    const q = gsap.utils.selector(el);
    let offReveal = () => {};

    const ctx = gsap.context(() => {
      // intro: the headline rises as the latte cup opens
      const lines = q(".hv-copy .line-inner");
      const rest = q(".hv-copy .eyebrow, .hv-copy p:not(.eyebrow), .hv-copy .hv-actions");
      gsap.set(lines, { yPercent: 110 });
      gsap.set(rest, { opacity: 0, y: 18 });
      offReveal = onReveal(() => {
        gsap.to(lines, { yPercent: 0, duration: 1.3, ease: "power4.out", stagger: 0.14, delay: 0.25 });
        gsap.to(rest, { opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.08, delay: 0.6 });
      });

      const P = rig.pose;
      const to = (tl: gsap.core.Timeline, id: "w1" | "w2" | "w3", p: { up: number; fore: number; hand: number; head: number }, at: number, dur: number) =>
        tl.to(P, { [`${id}-up`]: p.up, [`${id}-fore`]: p.fore, [`${id}-hand`]: p.hand, [`${id}-head`]: p.head, duration: dur, ease: "sine.inOut" }, at);
      const pluck = (tl: gsap.core.Timeline, id: string, base: number, at: number) =>
        tl
          .to(P, { [`${id}-hand`]: base - 16, duration: 0.18, ease: "sine.inOut" }, at)
          .to(P, { [`${id}-hand`]: base + 4, duration: 0.18, ease: "sine.inOut" }, at + 0.18)
          .to(P, { [`${id}-hand`]: base - 10, duration: 0.16, ease: "sine.inOut" }, at + 0.36)
          .to(P, { [`${id}-branch`]: 2.4, duration: 0.2, ease: "sine.out" }, at + 0.3)
          .to(P, { [`${id}-branch`]: 0, duration: 0.9, ease: "elastic.out(1, 0.5)" }, at + 0.5)
          .to(q(`.hv-hand-${id}`), { opacity: 1, duration: 0.12 }, at + 0.42);
      const drop = (tl: gsap.core.Timeline, id: string, fill: string, from: number, n: number, at: number) =>
        tl.to(q(`.hv-hand-${id}`), { opacity: 0, duration: 0.18 }, at).fromTo(
          q(`.hv-fill-${fill} .hv-fill-dot`).slice(from, from + n),
          { opacity: 0, y: -6 },
          { opacity: 1, y: 0, duration: 0.25, stagger: 0.07, ease: "power2.out" },
          at + 0.05,
        );

      const loop = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
      loop.to({}, { duration: 10 }, 0);

      // W1: reach up, pick, drop into the waist basket (twice), wait at the branch
      const w1 = POSES.w1;
      [0, 4].forEach((o, k) => {
        pluck(loop, "w1", w1.reach.hand, o + 0.1);
        loop.to(q(k ? ".hv-pickB" : ".hv-pickA"), { opacity: 0, duration: 0.12 }, o + 0.5);
        to(loop, "w1", w1.drop, o + 0.8, 1.4);
        drop(loop, "w1", "w1", k * 3, 3, o + 2.25);
        to(loop, "w1", w1.reach, o + 2.6, 1.4);
      });
      loop.to(q(".hv-pickA, .hv-pickB"), { opacity: 1, duration: 0.8, stagger: 0.1 }, 8.6);
      loop.to(q(".hv-fill-w1 .hv-fill-dot"), { opacity: 0, duration: 0.6, stagger: 0.05 }, 9.0);

      // W2: pick at waist height into the tub on her hip (three times)
      const w2 = POSES.w2;
      [0, 1, 2].forEach((k) => {
        const o = 0.35 + k * (10 / 3);
        pluck(loop, "w2", w2.reach.hand, o);
        to(loop, "w2", w2.drop, o + 0.6, 1.0);
        drop(loop, "w2", "w2", k * 2, 2, o + 1.65);
        to(loop, "w2", w2.reach, o + 1.95, 1.05);
      });
      loop.to(q(".hv-fill-w2 .hv-fill-dot"), { opacity: 0, duration: 0.5, stagger: 0.05 }, 9.35);

      // W3: a handful from the lap tub into the big basket (twice)
      const w3 = POSES.w3;
      [0.2, 5.2].forEach((o, k) => {
        loop
          .to(P, { "w3-hand": w3.scoop.hand - 14, "w3-up": w3.scoop.up - 4, duration: 0.35 }, o)
          .to(P, { "w3-hand": w3.scoop.hand, "w3-up": w3.scoop.up, duration: 0.35 }, o + 0.4)
          .to(q(".hv-hand-w3"), { opacity: 1, duration: 0.12 }, o + 0.5);
        to(loop, "w3", w3.drop, o + 0.85, 1.4);
        loop
          .to(q(".hv-hand-w3"), { opacity: 0, duration: 0.12 }, o + 2.3)
          .fromTo(q(".hv-fall-w3"), { opacity: 1, y: 0 }, { y: 26, duration: 0.32, ease: "power2.in", immediateRender: false }, o + 2.3)
          .to(q(".hv-fall-w3"), { opacity: 0, duration: 0.08 }, o + 2.6)
          .fromTo(q(".hv-fill-w3 .hv-fill-dot").slice(k * 4, k * 4 + 4), { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.06 }, o + 2.55);
        to(loop, "w3", w3.scoop, o + 2.9, 1.5);
      });
      loop.to(q(".hv-fill-w3 .hv-fill-dot"), { opacity: 0, duration: 0.5, stagger: 0.04 }, 9.3);

      // saree ends in the breeze (continuous, seamless)
      const ambient = gsap.timeline();
      [
        ["w1-pallu", 2.5, 0],
        ["w2-pallu", 2.1, 0.6],
        ["w3-pallu", 2.8, 1.1],
      ].forEach(([k, d, delay]) => {
        P[k as string] = -1.5;
        ambient.to(P, { [k as string]: 3, duration: d as number, ease: "sine.inOut", yoyo: true, repeat: -1 }, delay as number);
      });

      // one writer for every moving part
      const tick = () => rig.write(gsap.ticker.time);
      let running = false;
      const run = (on: boolean) => {
        if (on === running) return;
        running = on;
        el.classList.toggle("hv-paused", !on);
        if (on) {
          loop.resume();
          ambient.resume();
          gsap.ticker.add(tick);
        } else {
          loop.pause();
          ambient.pause();
          gsap.ticker.remove(tick);
        }
      };
      run(true);
      const io = new IntersectionObserver(([e]) => run(e.isIntersecting), { threshold: 0 });
      io.observe(el);
      return () => {
        io.disconnect();
        gsap.ticker.remove(tick);
      };
    }, el);

    return () => {
      offReveal();
      ctx.revert();
    };
  }, [rig, built]);

  return (
    <section ref={root} id="top" className="hv-hero relative h-[100svh] min-h-[620px] overflow-hidden" data-record-time="0" data-record-hold="3.6" data-record-label="Hero: the harvest">
      <HarvestDefs />
      <div ref={stage} className="hv-stage" aria-hidden>
        {built && (
          <>
        <Backdrop />

        {/* mist drifting between the ridges */}
        <div className="hv-layer hv-mist hv-anim" style={{ left: -150, top: 505, width: 1500, height: 110 }} />
        <div className="hv-layer hv-mist hv-anim" style={{ left: 380, top: 580, width: 1600, height: 90, animationDuration: "27s", animationDelay: "-9s" }} />
        <div className="hv-layer hv-mist hv-anim" style={{ left: -250, top: 650, width: 1300, height: 80, animationDuration: "31s", animationDelay: "-17s" }} />

        {/* the trees behind the women, with the two branches they pick from (each dips when a cherry is pulled) */}
        <TreeArt tree={T4} rig={rig} id="t4" />
        <TreeArt tree={T3} rig={rig} id="t3" />
        <TreeArt tree={T2} rig={rig} id="t2" />
        <Piece box={branchBox([{ ...PICK2, cherries: CL2 }])} ox={PICK2.ox} oy={PICK2.oy} refFn={(el) => rig.cssJoint("w2-branch", el)}>
          <BranchArt lat={{ ...PICK2, cherries: CL2 }} width={2.6} />
        </Piece>
        <TreeArt tree={T1} rig={rig} id="t1" />
        <Piece box={branchBox([{ ...PICK1, cherries: CL1 }])} ox={PICK1.ox} oy={PICK1.oy} refFn={(el) => rig.cssJoint("w1-branch", el)}>
          <BranchArt lat={{ ...PICK1, cherries: [] }} width={2.6} />
          {CL1.map((c, i) => (
            <CherryDot key={i} c={c} className={i >= 7 ? "hv-pickA" : i >= 4 ? "hv-pickB" : undefined} />
          ))}
        </Piece>

        {/* the harvest */}
        <WomanReaching rig={rig} />
        <WomanPicking rig={rig} />
        <WomanKneeling rig={rig} />

        {/* light through the canopy */}
        <div className="hv-layer hv-rays" style={{ left: 0, top: 0, width: SCENE_W, height: SCENE_H }}>
          {[
            [158, 1500, 120, 0],
            [150, 1400, 80, -3],
            [143, 1300, 150, -6],
            [165, 1600, 90, -1.5],
            [136, 1200, 70, -4.5],
          ].map(([a, l, h, d], i) => (
            <span key={i} className="hv-ray hv-anim" style={{ width: l, height: h, transform: `rotate(${a}deg)`, animationDelay: `${d}s` }} />
          ))}
          {[
            [1120, 940, 70],
            [1330, 952, 60],
            [1560, 945, 90],
            [930, 965, 55],
            [1250, 600, 45],
            [1050, 420, 40],
          ].map(([x, y, w], i) => (
            <span key={i} className="hv-dapple hv-anim" style={{ left: x - w, top: y - w * 0.3, width: w * 2, height: w * 0.6, animationDelay: `${-i * 1.3}s` }} />
          ))}
        </div>

        {/* the framing tree and the foreground plants */}
        <TreeArt tree={TL} rig={rig} id="tl" />
        <Fern x={60} y={1092} s={1.25} dur={6.5} />
        <Fern x={360} y={1100} s={0.9} flip dur={7.2} />
        <Fern x={940} y={1105} s={0.8} dur={5.8} />
        <Fern x={1690} y={1098} s={1.1} flip dur={6.9} />
        <div className="hv-frame">
          <TreeArt tree={TF} rig={rig} id="tf" />
        </div>

        {/* pollen in the sunbeams */}
        {STARS.map((p, i) => (
          <span key={i} className="hv-layer hv-pollen hv-anim" style={{ left: p.x, top: p.y, width: p.s, height: p.s, animationDuration: `${p.d}s`, animationDelay: `${p.delay}s` }} />
        ))}
          </>
        )}
      </div>

      {/* paper grain + the soft light behind the words (one still layer) */}
      <div className="hv-paper pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[9vh] bg-[linear-gradient(180deg,rgba(250,252,247,0)_0%,#fafcf7_100%)]" />

      {/* the words: real text over the calm left of the painting */}
      <div className="hv-copy container-x relative z-10 flex h-full flex-col justify-center pb-[6vh] max-md:justify-start max-md:pt-[13vh]">
        <div className="max-w-[640px] max-md:max-w-[340px]">
          <p className="eyebrow mb-6 uppercase">{harvest.eyebrow}</p>
          <Lines as="h1" lines={harvest.title} className="text-[clamp(46px,6.6vw,118px)]" />
          <p className="mt-6 max-w-[470px] text-[16px] leading-relaxed text-[color:var(--muted)] md:text-[18px]">{harvest.text}</p>
          <div className="hv-actions mt-8 flex flex-wrap items-center gap-3">
            <a href={harvest.buttons[0].href} className="btn btn-solid">
              {harvest.buttons[0].label}
            </a>
            <a href={harvest.buttons[1].href} className="btn btn-outline">
              {harvest.buttons[1].label}
            </a>
          </div>
          <p className="mt-7 text-[13px] font-medium tracking-[0.04em] text-[color:var(--muted)] max-md:hidden">{harvest.note}</p>
        </div>
      </div>
    </section>
  );
}
