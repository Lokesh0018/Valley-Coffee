# Performance audit — Aura Roast (current site)

Date: 2026-10-21. Scope: the whole app as built (engine, site components, assets, build output).
Method: code reading plus build measurements. No browser profiling was possible in this session, so numbers marked
"estimate" should be confirmed in Chrome DevTools → Performance (see "How to measure" at the end).

Priority key: **P1** = do first, clearly felt on screen · **P2** = worth doing, moderate win · **P3** = polish.

**Status (same day):** P1 1–3, P2 4, 5, 7–10 and P3 12, 13, 15–18 are applied (details in the table below).
Still open: 6 (fonts), 11 (nav observer), 14 (shadow pseudo-element).

| Applied | Where | What changed |
|---|---|---|
| P1-1 animated grain | `src/index.css` | static texture, `inset: 0`; no 4× viewport recomposite |
| P1-2 nav blur | `site/components/MenuCardNav.tsx` | 12px → 4px on laptop, none on phones (bar a little more opaque) |
| P1-3 hero backdrop filters | `site/components/HarvestHero.tsx`, `harvest/Backdrop.tsx` | backdrop SVG + defs serialised once after build, rasterised to a WebP bitmap and swapped in; SVG stays as fallback |
| P2-4 loader preload | `site/components/BrewLoader.tsx` | only non-lazy images (the roast beans) are awaited |
| P2-5 pour frames | `public/frames/ember-pour*`, `lib/frames.ts`, `useFramePlayer.ts` | 120 frames, laptop 1600px: 21 → 13 MB; fetched at low priority, only after the site has revealed |
| P2-7 bundle | `vite.config.ts`, `site/Page.tsx`, `EmberFooter.tsx` | vendor chunk (React, GSAP, Lenis) 351 KB cached separately; app 175 KB; bag drawer and contact form are lazy chunks (10 KB each) |
| P2-8 stale dist | `vite.config.ts` | `emptyOutDir: true` |
| P2-9 roast photos | `site/components/RoastDial.tsx`, images | 1400 → 1000px (80 → 40 KB each); `will-change` only while pinned |
| P2-10 font swap | `components/engine/SmoothScroll.tsx` | `ScrollTrigger.refresh()` after `document.fonts.ready`; `syncTouch: false` explicit |
| P3-12 ambient animations | `site/components/AmbientPause.tsx`, `site/site.css` | sections get `off-screen` while out of view; CSS animations inside pause |
| P3-13 tilt layers | `site/site.css` | `will-change` only on `.is-lifted` |
| P3-15 reviews grain | `site/site.css` | plain 6 % grain, no blend mode |
| P3-16 image sizes | all `<img>` in `site/components` | `width`/`height` set |
| P3-17 index.html | `index.html` | `theme-color`, preload of the first pour frame (laptop) |
| P3-18 record flicker | — | grain is static now |

---

## Already fixed in this session

| What | Where | Why it lagged |
|---|---|---|
| Pour frames decoded on the main thread at draw time | `components/engine/useFramePlayer.ts`, `lib/frames.ts` | 160 full-HD frames drawn as `<img>` → sync decode on each scroll step, ~1.3 GB of decoded pixels evicted and re-decoded. Now a sliding window of frames is decoded off-thread into bitmaps scaled to the canvas, and the draw loop only runs while the canvas is on screen |
| Hero rig wrote DOM transforms 60×/s even when unchanged | `site/components/harvest/rig.ts` | Now 30×/s and skips unchanged values |
| Photos bigger than displayed | `public/images/ember/*.webp` | 1100px → 900px, re-encoded; 2.2 MB → 1.5 MB. `decoding="async"` on all `<img>` |
| Scroll felt "floaty" | `components/engine/SmoothScroll.tsx`, every `scrub:` | Lenis 1.25 s → 0.85 s; scrub lag 0.5–0.8 s → 0.3 s |
| Origins cards invisible on phone | `site/components/OriginArches.tsx` | Scrubbed reveal replaced by a one-shot reveal on phones |

---

## P1 — do next (felt on every scroll)

### 1. Full-screen animated grain overlay (`src/index.css` `.grain::after`)
A `position: fixed` element at **200 vw × 200 vh**, `z-index: 60`, with a `steps(6)` transform animation running forever.
It is a compositor layer four times the viewport that is re-composited over *everything* (including the nav's
`backdrop-filter`) five times a second, on every device, even while nothing else moves. On phones this alone can
drop frames.
- Options, best first:
  1. Make it static: remove the `animation` (keep the texture). Nobody notices static grain on a scrolling page.
  2. Or keep the jitter but shrink it: `inset: 0` + `background-position` animation instead of `transform` of a 4× layer.
  3. Or pause it when the loader is gone and the page is scrolling (`html.is-scrolling .grain::after { animation-play-state: paused }`).
- Also add `will-change: transform` only if it stays animated; otherwise remove.

### 2. Nav bar `backdrop-filter: blur(12px)` over a moving page (`site/components/MenuCardNav.tsx`, `backdrop-blur-md`)
A fixed element with backdrop blur must re-blur the pixels under it on every frame of scroll. The bar is narrow, so it
is affordable on laptops, but combined with (1) above it is expensive on phones.
- Use `backdrop-blur-sm` (4px), or
- Drop the blur on phones: `max-md:backdrop-blur-none` with a slightly more opaque background.

### 3. Hero scene cost at first paint (`site/components/HarvestHero.tsx` + `harvest/*`)
~10 000 SVG nodes, two `feTurbulence + feDisplacementMap` filters on large groups (`Backdrop.tsx`), 26 pollen
particles with box-shadows, mist layers, ferns. It is built behind the loader and paused off screen (good), but:
- The filtered backdrop is rasterised at the stage scale; on a 2× screen that is a ~4600 × 3600 texture (estimate 60 MB GPU).
  **Render `Backdrop` once to a PNG/WebP** at build time (or at runtime to a canvas → `toDataURL`) and show it as an
  `<img>`; keep only the moving parts as SVG. Removes both filters from the live page.
- `.hv-paper` carries three background images incl. a 900px turbulence tile over the full stage; fine, but make sure it
  is **not** inside a transformed ancestor that changes every frame (it is on `.hv-stage`, which only changes on resize — OK).
- The scroll parallax on the backdrop SVG (`y: 90`, scrub) moves the filtered layer; after (a) it moves a plain image instead.

---

## P2 — worth doing

### 4. Loader waits for every image on the page (`site/components/BrewLoader.tsx` `preloadAll`)
It preloads all `document.images` (20 photos, ~1.5 MB) plus fonts before revealing. On slow networks the loader hangs.
- Preload only what is above the fold / in the first two sections; let the rest lazy-load (they already have `loading="lazy"`).

### 5. Pour frames download (`public/frames/ember-pour*`, 21 MB total)
160 frames at 1920 × 1080 (14 MB) + 160 phone frames (7 MB). The browser only fetches one set, but 14 MB starts
downloading right after the loader and competes with photos.
- Re-run `npm run frames` with `--max 120` (fewer frames, scrubs just as smoothly at 0.3 s lag) and `--width 1600`.
  Expected: ~8 MB laptop set.
- Fetch frames with `fetchPriority="low"` / after the hero has revealed (they are needed only from section 4).

### 6. Fonts (`site/fonts.ts`)
Fraunces "full" (all axes) normal + italic = 8 woff2 files, 121 KB + 150 KB for latin alone, plus latin-ext and
vietnamese subsets referenced by `unicode-range` (only downloaded if those glyphs appear, so mostly harmless).
- Add `<link rel="preload" as="font">` for the two latin files in `index.html` so the headline doesn't swap.
- If the `WONK`/`SOFT` axes are not visibly used at the sizes shown, switch to `@fontsource-variable/fraunces` (wght only, ~half the bytes).

### 7. JavaScript bundle: 540 KB (172 KB gzip), one chunk
React 19 + GSAP + ScrollTrigger + Lenis + the hero scene code in one file. Everything is needed on the home page, so
code-splitting gains little, but:
- The hero's generated art (`harvest/*`, ~1 000 lines) and `BagDrawer`/`WhatsAppNote` could be `React.lazy` after
  first paint; the drawer especially is never needed before a click.
- `build.chunkSizeWarningLimit` is just noise; set it or split vendor (`react`, `gsap`) into its own cached chunk via
  `rolldownOptions.output.codeSplitting` so repeat visits re-use it.

### 8. `dist/` accumulates stale builds (`vite.config.ts` `emptyOutDir: false`)
72 old `index-*.js` files, 78 MB. Harmless for visitors if only the latest `index.html` is served, but it hides
size regressions and bloats deploys. Set `emptyOutDir: true` (or clean `dist/` in the build script).

### 9. Pinned sections: `position: sticky` stages (`.pin-outer`, RoastDial 320 vh, ThePour)
Sticky + large images that crossfade (`RoastDial`: four 1400 × 1400 bean photos stacked, opacity tweened).
- Give the four bean images `will-change: opacity` only while the section is pinned (add/remove a class in the
  ScrollTrigger `onToggle`) so they are not permanent layers.
- 1400px bean photos are shown at ~500px: resize to 1000px (same ffmpeg command used for the photos).

### 10. Lenis + ScrollTrigger plumbing (`components/engine/SmoothScroll.tsx`)
`lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker` driving `lenis.raf` is the correct wiring. Two refinements:
- Call `ScrollTrigger.refresh()` once after the frames manifest + fonts resolve (layout can shift when Fraunces swaps in).
- On phones, keep native touch scroll (already the default) and consider `syncTouch: false` explicitly for clarity.

---

## P3 — polish

11. **`MenuCardNav` scroll listener** runs `getBoundingClientRect` for every link on every scroll event (rAF-throttled,
    fine). Could switch to one `IntersectionObserver` per section and drop the scroll listener entirely.
12. **Ambient CSS animations** (17 `infinite` keyframes) all run even when their section is off screen except the hero.
    Add the same "paused off screen" class toggle used by the hero (`IntersectionObserver` → `animation-play-state`)
    to the footer sun/rays, menu rays, reviews lamp, bake ping.
13. **Tilt cards** (`useTilt`) add `pointermove` listeners per card and tween `rotationX/Y`; cheap, but each tilted
    card becomes a 3D layer. Keep `will-change` off until hover (`.is-lifted`), not permanent (`.tilt-card { will-change: transform }` today).
14. **`BakeShelf` / `OriginArches` card shadows** use 40–60px blur box-shadows that animate on hover (`transition: box-shadow`).
    Animate a pseudo-element's `opacity` instead of the shadow itself.
15. **Receipts section grain** (`.reviews-light::after`, `mix-blend-mode: overlay`) forces the whole section into its own
    compositing group. Pre-bake the grain into a PNG with the gradient, or drop the blend mode (use low-opacity normal).
16. **Images: add `width`/`height` attributes** on every `<img>` so arch cards reserve space before load (no layout jumps
    while scrolling the first time). Use the manifest dims (900 × 1205 for portrait photos).
17. **`index.html`**: add `<link rel="preconnect">` is not needed (no CDN), but add `<link rel="preload">` for
    `frame_0001.webp` of the pour and the two Fraunces latin woff2 files; set `<meta name="theme-color">`.
18. **Record mode** (`?record=1`) scrolls with `immediate: true` each frame; fine. Make sure the grain (1) is paused
    there too, it shows as flicker on camera.

---

## Expected impact (estimates, confirm with a profile)

| Change | Laptop (1440, 2×) | Phone (375) |
|---|---|---|
| Frames decoded off-thread (done) | big: removes 10–20 ms hitches per scrub step | big |
| Grain overlay static (P1-1) | medium: removes a 4× viewport recomposite 5×/s | big |
| Nav blur smaller / off on phone (P1-2) | small | medium |
| Backdrop rasterised to an image (P1-3) | medium at first paint, small after | medium |
| Lenis/scrub tightened (done) | perceived: large | perceived: n/a (native touch) |
| Frames trimmed to 120 × 1600px (P2-5) | network: 14 → ~8 MB | 7 → ~4 MB |

---

## How to measure (5 minutes)

1. `npm run build && npm start`, open in Chrome (not the dev server: React dev mode alone doubles script time).
2. DevTools → Performance → record while scrolling slowly from top to footer. Look for:
   - long purple (Layout/Style) or green (Paint) bars during scroll → usually filters, blur, box-shadow transitions;
   - "Image Decode" tasks → frames or photos decoded at draw time;
   - frames > 16 ms in the FPS strip and which section they land in.
3. DevTools → Rendering → tick **Paint flashing** and **Layer borders**: anything flashing constantly while idle is a
   candidate (the grain overlay will light up the whole screen).
4. DevTools → Memory → take a heap snapshot after scrolling through the pour; `ImageBitmap` count should stay ≤ 30.
5. Lighthouse (mobile) for the network side: LCP should be the hero text, not an image; total transfer under ~6 MB
   before the frames start.
