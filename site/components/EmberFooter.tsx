"use client";

import { useEffect, useRef } from "react";
import TornEdge from "./TornEdge";
import { prefersReducedMotion } from "@/lib/gsap";
import { footer, visit } from "../content";
import { playOnceInView } from "./recordDemo";
import Lines from "./Lines";
import { FolkBirds, FolkMural, FolkShoulder, FolkSunMark, GREEN, INK } from "./FooterScene";
import { LogoMark } from "./Logo";

// Visit (a plain section) + footer. The footer: logo, links and copyright on plain cream, then a Warli-inspired
// folk-art village mural (FooterScene.tsx) as its own layer. No arrival animation; the sun's rays turn slowly and
// the women bob gently (CSS, off for reduced motion).

export default function EmberFooter() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    // record mode: the footer links underline one after another, once
    const offDemo = playOnceInView(el.querySelector(".footer-link"), () => {
      el.querySelectorAll(".footer-link .er-link").forEach((a, i) => {
        setTimeout(() => a.classList.add("is-demo"), 200 + i * 140);
        setTimeout(() => a.classList.remove("is-demo"), 1300 + i * 140);
      });
    }, 1);
    return () => {
      offDemo();
    };
  }, []);

  return (
    <>
      {/* Visit: a plain section on the site's own background */}
      <section id="visit" className="visit relative py-[clamp(90px,13vh,150px)]">
        <TornEdge color="#fafcf7" side="bottom" seed={89} />
        <div className="container-x grid items-start gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-7 uppercase">{visit.eyebrow}</p>
            <Lines lines={visit.title} className="text-[clamp(56px,6vw,104px)]" />
            <p className="mt-6 text-[18px] text-muted">{visit.area}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={visit.buttons[0].href} className="btn btn-solid">
                {visit.buttons[0].label}
              </a>
              <a href={visit.buttons[1].href} className="btn btn-outline">
                {visit.buttons[1].label}
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <dl className="divide-y divide-line border-y border-line">
              {visit.hours.map(([d, h]) => (
                <div key={d} className="flex items-baseline justify-between gap-4 py-5">
                  <dt className="text-[15px] text-muted">{d}</dt>
                  <dd className="font-display text-right text-[clamp(20px,1.8vw,28px)]">{h}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-6 flex flex-wrap gap-2">
              {visit.extras.map((e) => (
                <li key={e} className="rounded-full border border-line px-4 py-2 text-[14px] text-muted">
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer: one composition in three layers. (1) a continuous cream surface; (2) the folk-art landscape, anchored
          to the bottom and rising up behind the text (its hill tops start just under the copyright row); (3) the
          content in normal flow, with the sun and birds placed in the open sky between the text. */}
      <footer ref={root} data-record-time="1.5" data-record-hold="1" data-record-align="bottom" data-record-label="Visit + footer" className="footer-folk relative isolate overflow-hidden">
        {/* layer 2: the landscape (same proportions everywhere; phones crop around the centre) */}
        <FolkMural className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 block h-[max(200px,20.84vw)] w-full" />
        {/* hill shoulders rising up the outer margins, framing the content (laptops; they merge into the edge hills) */}
        <FolkShoulder side="left" className="pointer-events-none absolute bottom-[12.64vw] left-0 -z-20 hidden h-[clamp(90px,9vw,200px)] w-[calc(max((100%-1440px)/2,0px)+clamp(20px,5vw,80px)-14px)] lg:block" />
        <FolkShoulder side="right" className="pointer-events-none absolute bottom-[13.9vw] right-0 -z-20 hidden h-[clamp(90px,9vw,200px)] w-[calc(max((100%-1440px)/2,0px)+clamp(20px,5vw,80px)-14px)] lg:block" />

        {/* layer 3: the content; its bottom padding lets the copyright row sit in the landscape's open sky */}
        <div className="container-x relative pb-[max(164px,16.95vw)] pt-[clamp(36px,5vh,56px)]">
          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="relative lg:col-span-4">
              <div className="flex items-center gap-3">
                <LogoMark className="h-10 w-10 text-[#15542d]" />
                <span className="font-display text-[26px] leading-none">{footer.wordmark}</span>
              </div>
              {/* birds in the open sky between the logo and the links */}
              <FolkBirds className="pointer-events-none absolute left-[60%] top-1 hidden h-[52px] w-[150px] lg:block" />
            </div>
            <div className="relative grid grid-cols-2 gap-x-10 gap-y-6 text-[15px] sm:grid-cols-3 lg:col-span-8">
              {footer.columns.map((c) => (
                <div key={c.title}>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ color: GREEN }}>
                    {c.title}
                  </p>
                  <ul className="mt-2.5 space-y-1 max-md:space-y-0" style={{ color: INK }}>
                    {c.links.map((l) => (
                      <li key={l}>
                        <a href="#top" className="footer-link inline-flex min-h-11 min-w-11 items-center md:min-h-0 md:min-w-0">
                          <span className="er-link">{l}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {/* the sun, in the open sky to the right of the Follow links */}
              <FolkSunMark className="pointer-events-none absolute right-0 top-[-6px] h-[72px] w-[72px] max-sm:right-[-6px] max-sm:top-[-60px] max-sm:h-[58px] max-sm:w-[58px]" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-[#171715]/15 pt-3 text-[13px] text-[#4a463c] max-md:text-[14px]">
            <span>© 2026 {footer.wordmark}</span>
            <span>{footer.note}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
