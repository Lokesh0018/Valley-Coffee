import type { SiteMeta, Theme } from "@/lib/site";

// Settings for THIS site: Aura Roast, a specialty coffee café and roastery in Hyderabad.
// Direction + Motion map: site/DESIGN.md. White and botanical green theme; pale-green "paper" bands override these colours in site.css (.paper).

export const meta: SiteMeta = {
  name: "Aura Roast",
  title: "Aura Roast — Walk in. Slow down.",
  description:
    "A specialty coffee café and roastery in Hyderabad: single-origin Indian coffees roasted every morning, an espresso bar, hand-brewed pour-overs, fresh bakes and beans to take home.",
  loaderText: "Aura Roast",
  loader: false, // site/components/BrewLoader.tsx replaces the engine loader
  // ?record=1 uses the section timeline (data-record-* on the sections, docs/RECORDING.md): 36.4 s after the 2.5 s
  // loader (≈ 39 s in all), the same seconds on laptop and phone. duration is only the fallback for constant-speed mode.
  record: { duration: 36, delay: 2.6 },
};

export const theme: Theme = {
  bg: "#fafcf7", // fresh white with a hint of leaf
  surface: "#f0f5ee",
  text: "#133024", // deep forest-green ink
  muted: "#50685a",
  accent: "#2f7d4a", // leaf green
  accentText: "#ffffff",
  line: "#d5e2d3",
  fontDisplay: "'Fraunces Variable', 'Fraunces', Georgia, serif",
  fontBody: "'Outfit Variable', 'Outfit', system-ui, sans-serif",
  radius: 999,
  uppercaseHeadings: false,
  heroText: "#133024",
};
