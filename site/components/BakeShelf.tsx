"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { bakes } from "../content";
import Lines from "./Lines";
import SwipeHint from "./SwipeHint";
import { useTilt } from "./useTilt";
import { useCart } from "../cart";

// Fresh bakes (Motion map M13 scale-down inside mask): four arch-top bake cards on the cream band that continues
// from the menu. As each card scrolls in, its arch opens from a smaller arch to full size while the photo inside
// settles from zoomed-in (scrubbed, each card a beat after the last). Phone: sideways swipe, scale only.
// Beside the title, the day's oven as a small timeline; under the cards, a tray that sums what you've added.

const INK = "#24683c";

// a faint wheat sprig, drawn behind the header (decorative)
function Wheat({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 300" aria-hidden className={className} fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M60 296C60 220 62 140 64 30" />
      {[40, 70, 100, 130, 160, 190].map((y, i) => (
        <g key={y}>
          <path d={`M${62 - i * 0.2} ${y + 26}C${44} ${y + 18} ${38} ${y + 2} ${40} ${y - 8}C${52} ${y - 2} ${60} ${y + 10} ${62 - i * 0.2} ${y + 26}Z`} />
          <path d={`M${62 - i * 0.2} ${y + 26}C${80} ${y + 18} ${86} ${y + 2} ${84} ${y - 8}C${72} ${y - 2} ${64} ${y + 10} ${62 - i * 0.2} ${y + 26}Z`} />
        </g>
      ))}
      <path d="M64 30C62 18 63 8 66 0" />
    </svg>
  );
}

export default function BakeShelf() {
  const root = useRef<HTMLElement>(null);
  const cart = useCart();
  // the tray = the bakes in the bag (site/cart.tsx); the bar under the cards opens the bag drawer
  const tray = bakes.items.map((b, i) => (cart.has("bake", b.name, b.out) ? i : -1)).filter((i) => i >= 0);
  useTilt(root, ".bake-arch");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const phone = window.matchMedia("(max-width: 819px)").matches;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".bake-card").forEach((card, i) => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: card, start: `top ${98 - (i % 4) * 5}%`, end: `top ${48 - (i % 4) * 5}%`, scrub: 0.3 },
        });
        if (!phone) tl.fromTo(card.querySelector(".bake-mask"), { clipPath: "inset(10% 9% 0% 9% round 9999px 9999px 12px 12px)" }, { clipPath: "inset(0% 0% 0% 0% round 9999px 9999px 12px 12px)", duration: 1 }, 0);
        tl.fromTo(card.querySelector(".bake-img"), { scale: phone ? 1.2 : 1.35 }, { scale: 1, duration: 1 }, 0);
        tl.fromTo(card.querySelector(".bake-meta"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.5);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const toggle = (i: number) => {
    const b = bakes.items[i];
    if (tray.includes(i)) cart.remove(`bake:${b.name}:${b.out}`);
    else cart.add({ kind: "bake", name: b.name, variant: b.out, price: b.price, image: b.image });
  };
  const total = cart.items.filter((i) => i.kind === "bake").reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <section ref={root} id="bakes" className="bakes paper relative overflow-hidden pb-[clamp(110px,16vh,190px)] pt-[clamp(40px,6vh,80px)]">
      {/* background: a warm light behind the shelf and a faint wheat sprig */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[62%] h-[70%] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,250,236,0.85),rgba(255,250,236,0))]" />
        <Wheat className="absolute left-[44%] top-[clamp(20px,4vh,50px)] w-[clamp(60px,6vw,96px)] rotate-[14deg] opacity-[0.13] max-md:hidden" />
      </div>

      <div className="container-x relative">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div>
            <p className="eyebrow mb-7 uppercase">{bakes.eyebrow}</p>
            <Lines lines={bakes.title} className="text-[clamp(44px,5.6vw,96px)]" />
          </div>

          {/* the text + the day's oven */}
          <div className="w-full max-w-[460px]">
            <p className="text-[16px] leading-relaxed text-muted">{bakes.text}</p>
            <ol className="bake-oven relative mt-6 grid grid-cols-4 gap-2" aria-label="Today's oven">
              <span aria-hidden className="absolute left-[7px] right-[12%] top-[7px] h-px bg-[#24683c]/25" />
              {bakes.schedule.map((s, i) => (
                <li key={s.at} className="relative">
                  <span className={`relative z-[1] grid h-[15px] w-[15px] place-items-center rounded-full border-2 ${i === 1 ? "border-[#24683c] bg-[#24683c]" : "border-[#24683c]/45 bg-[#fafcf7]"}`}>
                    {i === 1 && <span className="bake-ping absolute inset-0 rounded-full bg-[#24683c]" />}
                  </span>
                  <span className="mt-2.5 block text-[13px] font-semibold text-[#133024]">{s.at}</span>
                  <span className="block text-[12px] leading-snug text-muted max-md:text-[12.5px]">{s.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="relative">
          <div
            data-record-time="1.2"
            data-record-hold="0.4"
            data-record-align="center"
            data-record-label="Bakes"
            className="bake-row no-scrollbar -mx-[clamp(20px,5vw,80px)] mt-[clamp(36px,6vh,64px)] flex snap-x snap-mandatory scroll-px-[clamp(20px,5vw,80px)] gap-4 overflow-x-auto px-[clamp(20px,5vw,80px)] pb-10 -mb-6 min-[820px]:pb-0 min-[820px]:mb-0 min-[820px]:mx-0 min-[820px]:grid min-[820px]:grid-cols-2 min-[820px]:gap-6 min-[820px]:overflow-visible min-[820px]:px-0 lg:grid-cols-4"
          >
            {bakes.items.map((b, i) => {
              const added = tray.includes(i);
              return (
                <article
                  key={b.name}
                  className={`bake-card group flex w-[min(74vw,340px)] shrink-0 snap-start flex-col rounded-[26px] border bg-[#fdfefb] p-3 shadow-[0_24px_48px_-30px_rgba(19,48,36,0.45)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-[0_34px_60px_-30px_rgba(19,48,36,0.55)] min-[820px]:w-auto ${added ? "border-[#24683c]" : "border-line"}`}
                  data-card={i}
                  data-cursor="Add"
                >
                  <div className="bake-mask">
                    <div className="arch bake-arch tilt-card relative aspect-[4/5] bg-[#dfe9dc]">
                      <img src={b.image} alt={b.name} loading="lazy" decoding="async" className="bake-img absolute inset-0 h-full w-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgba(19,48,36,0.45),rgba(19,48,36,0))]" />
                      <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#fafcf7]/90 px-3 py-1 text-[12px] font-medium text-[#133024] backdrop-blur max-md:text-[13px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2f9a55]" />
                        {b.out}
                      </span>
                      {b.tag && (
                        <span className="absolute bottom-3.5 right-3.5 rounded-full bg-[#24683c] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white max-md:text-[12px]">{b.tag}</span>
                      )}
                    </div>
                  </div>

                  <div className="bake-meta flex flex-1 flex-col px-2 pb-1 pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-[clamp(22px,1.75vw,28px)] leading-[1.08]">{b.name}</h3>
                      <span className="price-tag mt-0.5 shrink-0">₹{b.price}</span>
                    </div>
                    <p className="mt-1.5 text-[14px] text-muted">{b.note}</p>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-[#4f6657] max-md:text-[14px]">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#24683c]">
                        <path d="M4 9h12v4a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6V9Zm12 1h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M12 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Pairs with <span className="font-semibold text-[#133024]">{b.pairs}</span>
                    </p>
                    <span className="min-h-4 flex-1" />
                    <button
                      type="button"
                      onClick={() => toggle(i)}
                      aria-pressed={added}
                      aria-label={added ? `Remove ${b.name} from your tray` : `Add ${b.name} to your tray`}
                      className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border text-[14px] font-semibold transition-colors duration-200 ${
                        added ? "border-[#24683c] bg-[#24683c] text-white" : "border-[#24683c]/35 text-[#24683c] hover:border-[#24683c] hover:bg-[#edf4ea]"
                      }`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        {added ? (
                          <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        )}
                      </svg>
                      {added ? "In your tray" : "Add to tray"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <SwipeHint />
        </div>

        {/* the tray: what you've added, or the standing note */}
        <div className="mt-[clamp(20px,4vh,40px)] flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-full border border-line bg-[#fdfefb]/80 py-2 pl-6 pr-2 backdrop-blur-sm max-md:rounded-[22px] max-md:py-4 max-md:pr-4" aria-live="polite">
          <p className="inline-flex items-center gap-2.5 text-[14px] text-[#4f6657]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#24683c]">
              <path d="M3 10h18l-1.6 8.2a2 2 0 0 1-2 1.8H6.6a2 2 0 0 1-2-1.8L3 10Zm4 0 3-6m7 6-3-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {tray.length ? (
              <span>
                Your tray: <span className="font-semibold text-[#133024]">{tray.length} {tray.length === 1 ? "bake" : "bakes"}</span> · <span className="font-semibold text-[#133024]">₹{total}</span>
              </span>
            ) : (
              <span>{bakes.note}</span>
            )}
          </p>
          <button type="button" onClick={() => (tray.length ? cart.setOpen(true) : document.getElementById("visit")?.scrollIntoView({ behavior: "smooth" }))} className="group cursor-pointer inline-flex min-h-11 items-center gap-2 rounded-full bg-[#133024] px-5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#24683c]">
            {tray.length ? "Order ahead" : "Pre-order"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
