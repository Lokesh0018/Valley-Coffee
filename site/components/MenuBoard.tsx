"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { menu } from "../content";
import Lines from "./Lines";
import TornEdge from "./TornEdge";
import MenuBackdrop from "./MenuBackdrop";
import { playOnceInView } from "./recordDemo";

// The menu board (Motion map M2 3D page flip): a printed café menu. All pages are stacked in one grid cell
// (so the card keeps the height of the tallest page). While the menu is on screen the pages flip by themselves
// every few seconds, like paper pages turning on their left edge; a tab click flips to that page and restarts
// the timer. The arch photo beside it swaps with the page. ?static=1: tabs switch instantly, no auto-flip.

const AUTO_MS = 3400;

export default function MenuBoard() {
  const [page, setPage] = useState(0);
  const root = useRef<HTMLElement>(null);
  const shown = useRef(0);
  const timer = useRef(0);
  const inView = useRef(false);
  // the reader is hovering or focusing the menu: the pages hold still
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  // bumps on every timer tick so the active tab's progress line restarts in step with the flip
  const [cycle, setCycle] = useState(0);
  pausedRef.current = paused;

  // flip from the page on show to the new one
  useEffect(() => {
    const el = root.current!;
    const pages = el.querySelectorAll<HTMLElement>(".menu-page");
    const from = pages[shown.current];
    const to = pages[page];
    if (from === to) return;
    shown.current = page;
    if (prefersReducedMotion()) {
      gsap.set(from, { visibility: "hidden" });
      gsap.set(to, { visibility: "visible", rotationY: 0, opacity: 1 });
      return;
    }
    gsap.killTweensOf(pages);
    pages.forEach((p) => p !== from && p !== to && gsap.set(p, { visibility: "hidden" }));
    gsap
      .timeline()
      .to(from, { rotationY: -80, opacity: 0, duration: 0.42, ease: "power2.in", transformOrigin: "0% 50%" })
      .set(from, { visibility: "hidden", rotationY: 0 })
      .fromTo(to, { visibility: "visible", rotationY: 80, opacity: 0, transformOrigin: "0% 50%" }, { rotationY: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.34)
      .fromTo(to.querySelectorAll("li"), { x: 14, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: "power2.out", stagger: 0.04 }, 0.5);
  }, [page]);

  // auto-flip while on screen (filming needs it to play by itself)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const tick = () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setCycle((c) => c + 1);
        if (inView.current && !pausedRef.current) setPage((p) => (p + 1) % menu.pages.length);
        tick();
      }, AUTO_MS);
    };
    const io = new IntersectionObserver(([e]) => {
      const was = inView.current;
      inView.current = e.intersectionRatio > 0.35;
      if (inView.current && !was) tick();
    }, { threshold: [0, 0.35, 0.6] });
    io.observe(el.querySelector(".menu-card-print")!);
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
  }, []);

  // record mode: the prices flip once, row by row, the first time the menu is on screen
  useEffect(() => {
    const el = root.current!;
    return playOnceInView(el.querySelector(".menu-card-print"), () => {
      el.querySelectorAll<HTMLElement>(".menu-page")[0].querySelectorAll("li").forEach((li, i) => {
        setTimeout(() => li.classList.add("flip-demo"), 600 + i * 160);
        setTimeout(() => li.classList.remove("flip-demo"), 1400 + i * 160);
      });
    }, 0.5);
  }, []);

  const choose = (i: number) => {
    setPage(i);
    window.clearTimeout(timer.current);
    setCycle((c) => c + 1);
    timer.current = window.setTimeout(function again() {
      setCycle((c) => c + 1);
      if (inView.current && !pausedRef.current) setPage((p) => (p + 1) % menu.pages.length);
      timer.current = window.setTimeout(again, AUTO_MS);
    }, AUTO_MS * 1.6);
  };

  return (
    <section ref={root} id="menu" data-cursor-demo="Flip" className="menu paper relative z-[2] pb-[clamp(60px,9vh,110px)] pt-[clamp(90px,13vh,160px)] md:flex md:min-h-[100svh] md:flex-col md:justify-center md:pb-[3.5vh] md:pt-[clamp(84px,11vh,120px)]">
      <TornEdge color="#edf4ea" seed={23} />
      <MenuBackdrop />
      <div className="container-x relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-7 uppercase md:mb-[1.6vh]">{menu.eyebrow}</p>
            <Lines lines={menu.title} className="menu-title text-[clamp(44px,5.6vw,96px)] md:text-[clamp(36px,min(4.4vw,8vh),68px)]" />
          </div>
        </div>

        <div className="mt-[clamp(36px,6vh,72px)] grid items-stretch gap-8 md:mt-[3vh] md:grid-cols-12">
          {/* the printed menu card (hovering or focusing it holds the page still) */}
          <div
            data-cursor="Flip"
            data-record-time="1.5"
            data-record-hold="1.6"
            data-record-align="center"
            data-record-label="Menu board"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className={`menu-card-print relative flex flex-col rounded-[28px] border border-line bg-surface p-[clamp(20px,3vw,44px)] md:p-[clamp(18px,3.2vh,36px)] shadow-[0_30px_60px_-30px_rgba(19,48,36,0.35)] md:col-span-7 ${paused ? "is-paused" : ""}`}
            style={{ perspective: "1600px" }}
          >
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Menu pages">
              {menu.pages.map((p, i) => (
                <button
                  key={p.tab}
                  type="button"
                  role="tab"
                  aria-selected={i === page}
                  onClick={() => choose(i)}
                  className={`menu-tab relative min-h-11 overflow-hidden rounded-full border px-4 py-2 text-[14px] font-medium transition-colors duration-300 ${
                    i === page ? "border-[#133024] bg-[#133024] text-white" : "border-line text-[#4f6657] hover:border-[#24683c] hover:text-[#133024]"
                  }`}
                >
                  {p.tab}
                  <span className={`ml-1.5 text-[12px] ${i === page ? "text-white/70" : "text-[#4f6657]/70"}`}>{p.items.length}</span>
                  {/* how long until the page turns */}
                  {i === page && <span key={`${page}-${cycle}`} aria-hidden className="menu-tab-progress absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#8fe3a8]" />}
                </button>
              ))}
            </div>

            <div className="mt-[clamp(20px,4vh,36px)] grid flex-1 [transform-style:preserve-3d] md:mt-[2vh]">
              {menu.pages.map((p, i) => (
                <ul
                  key={p.tab}
                  data-page={i}
                  className="menu-page col-start-1 row-start-1 [backface-visibility:hidden]"
                  style={{ visibility: i === 0 ? "visible" : "hidden" }}
                  aria-hidden={i !== page}
                >
                  {p.items.map((it) => (
                    <li key={it.name} className="menu-item -mx-3 rounded-2xl px-3 py-[clamp(7px,1.2vh,11px)] md:py-[0.7vh] transition-colors duration-200 hover:bg-[#edf4ea]">
                      <div className="menu-line">
                        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span className="font-display text-[clamp(21px,1.9vw,28px)] leading-tight md:text-[clamp(18px,min(1.8vw,3.1vh),27px)]">{it.name}</span>
                          {it.tag && <span className="rounded-full bg-[#24683c] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white max-md:text-[12px]">{it.tag}</span>}
                        </span>
                        <span className="leader" />
                        <span className="menu-price text-[clamp(16px,1.3vw,20px)] font-semibold text-accent">₹{it.price}</span>
                      </div>
                      <p className="mt-0.5 text-[14px] text-muted md:text-[clamp(12.5px,1.75vh,14px)]">{it.note}</p>
                    </li>
                  ))}
                </ul>
              ))}
            </div>

            {/* card footer: the small print + the next step */}
            <div className="mt-[clamp(18px,3vh,28px)] flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-[clamp(14px,2.4vh,22px)] md:mt-[1.8vh] md:pt-[1.4vh]">
              <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted max-md:text-[14px]">
                {["Prices include taxes", "Oat milk at no extra cost"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#24683c]">
                      <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
              <a href="#visit" className="group inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-[#24683c]">
                <span className="er-link">Order ahead</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* arch photo that swaps with the page, with a caption */}
          <div className="relative md:col-span-5 max-md:hidden">
            <div className="arch relative h-full min-h-[480px] md:min-h-0">
              {menu.pages.map((p, i) => (
                <img
                  key={p.tab}
                  src={p.image}
                  alt={p.tab}
                  loading="lazy" decoding="async"
                  data-page-img={i}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                  style={{ opacity: i === page ? 1 : 0 }}
                />
              ))}
              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(19,48,36,0.7),rgba(19,48,36,0))] px-6 pb-5 pt-16">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#cfe3d4]">On the page</p>
                <p className="mt-1 font-display text-[28px] leading-none text-white">{menu.pages[page].tab}</p>
              </div>
            </div>
            <div className="arch-line pointer-events-none absolute -inset-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
