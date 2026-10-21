"use client";

import { useEffect } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { onSiteReady } from "@/lib/loading";

// Section transitions (X codes in docs/MOTION-MENU.md):
//   X3  every torn paper edge stretches tall as it comes up the screen and settles flat as it passes
//   X1  Beans stays pinned (and dims) while Stay a while slides up over it
// ?static=1: nothing (sections simply follow each other).

export default function Transitions() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let ctx: gsap.Context | undefined;
    // after the loader has fully gone (scroll positions are refreshed then anyway)
    const off = onSiteReady(() => {
      ctx = gsap.context(() => {
        // X3: torn edges
        gsap.utils.toArray<SVGElement>("[data-torn]").forEach((edge) => {
          gsap.fromTo(
            edge,
            { scaleY: 2.6, transformOrigin: "50% 100%" },
            { scaleY: 1, ease: "none", scrollTrigger: { trigger: edge, start: "top bottom", end: "top 45%", scrub: 0.3 } },
          );
        });

        // X1: overlap slides (the next section has a higher z-index and an opaque background)
        const overlap = (from: string) => {
          const el = document.querySelector<HTMLElement>(from);
          if (!el) return;
          ScrollTrigger.create({ trigger: el, start: "bottom bottom", end: "+=100%", pin: true, pinSpacing: false });
          const dim = el.querySelector(".x1-dim");
          if (dim) gsap.fromTo(dim, { opacity: 0 }, { opacity: 0.65, ease: "none", scrollTrigger: { trigger: el, start: "bottom bottom", end: "bottom top", scrub: true } });
        };
        overlap("#beans");
      });
      ScrollTrigger.refresh();
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return null;
}
