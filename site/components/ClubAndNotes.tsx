"use client";

import { useEffect, useRef } from "react";
import TornEdge from "./TornEdge";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { reviews } from "../content";
import Lines from "./Lines";
import SwipeHint from "./SwipeHint";

// Reviews printed as café receipts (Motion map M9 print-out): each receipt feeds out of
// a printer slot downwards, one line at a time (stepped), torn edge last; the four print one after another when
// the row comes on screen (down or up): the printer light blinks on, the stars fill in, and each slip is torn
// off and settles at a slight angle. On leaving, it all plays back and the slips feed up into the printer.
// Phone: receipts become a sideways swipe. ?static=1: all printed.

// resting angle of each slip once torn off (?static=1 shows them straight)
const TILT = [-1.6, 1.2, -0.8, 1.5];

export default function ClubAndNotes() {
  const row = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = row.current!;
    const ctx = gsap.context(() => {
      // prints on arrival from either direction; on leaving, the timeline reverses so the receipts
      // un-tear, un-print line by line and feed back up into the printer (faster than printing)
      const tl = gsap.timeline({ paused: true });
      gsap.utils.toArray<HTMLElement>(".receipt-wrap").forEach((wrap, i) => {
        const drop = wrap.querySelector(".receipt-drop")!;
        const paper = wrap.querySelector(".receipt")!;
        const led = wrap.querySelector(".printer-led")!;
        const lines = wrap.querySelectorAll(".receipt-line");
        const stars = wrap.querySelectorAll(".receipt-star");
        const steps = lines.length + 2;
        const at = i * 0.3;
        const feed = 1.6;
        tl.fromTo(led, { opacity: 0.25, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.15 }, at);
        tl.fromTo(paper, { clipPath: "inset(0% 0% 100% 0%)", y: -24 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: feed, ease: `steps(${steps})` }, at);
        tl.fromTo(lines, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: feed / steps }, at + 0.05);
        tl.fromTo(stars, { opacity: 0.18, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out", stagger: 0.07 }, at + feed * 0.55);
        tl.to(led, { opacity: 0.25, scale: 0.8, duration: 0.2 }, at + feed);
        // torn off: the slip drops a touch and settles at its own slight angle
        tl.fromTo(drop, { rotate: 0, y: 0 }, { rotate: TILT[i % TILT.length], y: 10, duration: 0.7, ease: "power3.out" }, at + feed);
      });
      const print = () => tl.timeScale(1).play();
      const unprint = () => tl.timeScale(1.8).reverse();
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: print,
        onEnterBack: print,
        onLeave: unprint,
        onLeaveBack: unprint,
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section id="reviews" data-record-time="0.9" data-record-hold="1.3" data-record-label="Reviews" className="reviews band-forest relative z-[4] pb-[clamp(90px,13vh,160px)] pt-[clamp(56px,8vh,96px)]">
        <TornEdge color="#133024" seed={73} />
        <TornEdge color="#133024" side="bottom" seed={91} fiber="#0b1a13" />
        {/* café counter: pendant-lamp glow over the printers, a warm bounce from below, paper grain */}
        <div aria-hidden className="reviews-light pointer-events-none absolute inset-0 -z-[1]" />
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <p className="eyebrow mb-5 uppercase">{reviews.eyebrow}</p>
              <Lines lines={reviews.title} className="text-[clamp(38px,4.4vw,76px)]" />
            </div>
            <p className="text-[15px] text-muted">4.8 ★ from 2,300+ visits</p>
          </div>

          {/* bigger receipts: 3 across on laptop (the 4th shows on narrower screens), 2 across on tablet, a swipe on phone */}
          <div className="relative">
          <div ref={row} className="no-scrollbar -mx-[clamp(20px,5vw,80px)] mt-[clamp(28px,4vh,48px)] flex snap-x snap-mandatory scroll-px-[clamp(20px,5vw,80px)] items-start gap-5 overflow-x-auto px-[clamp(20px,5vw,80px)] pb-12 pt-1 min-[820px]:mx-0 min-[820px]:pb-0 min-[820px]:grid min-[820px]:grid-cols-2 min-[820px]:gap-7 min-[820px]:gap-y-12 min-[820px]:overflow-visible min-[820px]:px-0 lg:grid-cols-3">
            {reviews.items.map((r, i) => (
              <article key={r.name} className={`receipt-wrap w-[min(86vw,420px)] shrink-0 snap-start min-[820px]:w-auto ${i === 1 ? "lg:mt-10" : ""} ${i === 3 ? "lg:hidden" : ""}`} data-card={i}>
                {/* the printer slot the receipt feeds out of */}
                <div className="printer relative z-[1] -mx-3 flex h-5 items-center justify-end rounded-[10px] px-3">
                  <span className="printer-led h-1.5 w-1.5 rounded-full" />
                </div>
                <div className="receipt-drop origin-top -mt-2">
                <div className="receipt receipt-lg px-8 pt-9 text-[17px]">
                  <p className="receipt-line text-center text-[13px] font-semibold uppercase tracking-[0.28em]">Aura Roast · Beach Road</p>
                  <p className="receipt-line mt-1 text-center text-[13px] tracking-[0.12em] text-[#4f6657] max-md:text-[14px]">Order #{2041 + i * 17} · Table {3 + i * 2}</p>
                  <div className="receipt-rule my-5" />
                  {r.order.map(([item, price]) => (
                    <p key={item} className="receipt-line flex justify-between gap-3 text-[16px]">
                      <span>1 × {item}</span>
                      <span className="tabular-nums">₹{price}</span>
                    </p>
                  ))}
                  <div className="receipt-rule my-5" />
                  <p className="receipt-line text-[20px] text-[#24683c]" aria-label="5 stars">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <span key={s} aria-hidden className="receipt-star inline-block">★</span>
                    ))}
                  </p>
                  <p className="receipt-line font-display mt-3 text-[clamp(22px,1.9vw,27px)] leading-snug">“{r.text}”</p>
                  <p className="receipt-line mt-5 text-[16px] font-semibold">{r.name}</p>
                  <p className="receipt-line text-[14px] text-[#4f6657]">{r.who}</p>
                  <div className="receipt-rule my-5" />
                  <p className="receipt-line text-center text-[13px] uppercase tracking-[0.28em] text-[#4f6657]">Thank you · come back slow</p>
                </div>
                </div>
              </article>
            ))}
          </div>
          <SwipeHint />
          </div>
        </div>
      </section>
    </>
  );
}
