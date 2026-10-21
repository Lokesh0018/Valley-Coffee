"use client";

import { useEffect } from "react";

// Ambient CSS animations (footer sun and rays, menu rays, the reviews lamp, the bake ping…) would otherwise run
// forever, even for sections far off screen. Every top-level section gets an "off-screen" class while it is out of
// view (with a margin, so nothing is still paused when it scrolls in); site.css pauses animations inside it.
// The hero pauses its own rig the same way. Renders nothing.

export default function AmbientPause() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("main > section, footer, body > section"));
    if (!targets.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.target as HTMLElement).classList.toggle("off-screen", !e.isIntersecting)),
      { rootMargin: "30% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => {
      io.disconnect();
      targets.forEach((t) => t.classList.remove("off-screen"));
    };
  }, []);
  return null;
}
