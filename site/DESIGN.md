# Design direction: Ember Roast (Day 5)

**Brief:** Ember Roast, a specialty coffee café and roastery in Hyderabad: single-origin Indian coffees, an espresso bar, pour-overs, fresh bakes and beans to take home. Audience: young professionals, students, couples, remote workers. Mood: warm, slow, cosy. Hero video: a fly-through, gliding through the café to the espresso bar, steam rising, no people. Reel hook: *"Walk into a café without leaving your chair."* All brand names invented, no real logos. Assets: none yet.

**The idea in one line:** *a slow morning at the café, told through the coffee itself.* You arrive at the café's window fogged with steam, wipe the glass clear with one sweep and glide inside to the espresso bar. Then the page slows down to follow one cup: where the beans grow, how dark they are roasted, and a **pour-over that brews as you scroll**, with a brew scale counting the seconds and grams. After that it is a real café: the menu board, fresh bakes, bags of beans, a table to stay at.

## Choices (codes from docs/DESIGN-MENU.md)

| | Choice | Why |
|---|---|---|
| Look | **L2 Warm editorial, "dark roast" version**: deep roasted-brown pages with warm cream "paper" sections that tear in like a kraft coffee bag, copper/amber light glowing from behind photos, soft film grain over everything | Feels like a café at 8 am: dark wood, cream walls, amber lamps. Slow and cosy, never flashy |
| Palette | **Roast & crema** (new). bg `#1b120c` (espresso) · surface `#271a11` · text `#f4e9d8` (crema) · muted `#c4ad92` · accent **copper-amber `#e0913f`** with espresso text on it. **Cream paper band** (on purpose, for the shop sections): bg `#f2e7d6` · text `#2a1a10` · muted `#6d5744`, same copper accent | One accent (copper: prices, buttons, the scale's numbers, the glow). The page alternates espresso ↔ cream like coffee and milk |
| Type pair | **T6 Fraunces + Outfit**. Fraunces uses its soft, "wonky" optical style at huge sizes, italic for one word per heading ("Slow *down*.", "Brewed *by hand*."). Outfit for body, small caps labels and prices | Fraunces is the characterful warm serif the brief asks for; Outfit keeps menus and prices clean and easy to read |
| Nav | **N4 Minimal + full-screen menu, "menu card" version**: top-left the ER ember mark + "Ember Roast", top-right "Open now · till 11 pm" and a round **Menu** button. It opens a full-screen cream menu card: big Fraunces links (The Café · Our Beans · The Menu · Bakes · Take Home · Visit) with a small "Today's pour: Araku Valley, washed" note | A café literally hands you a menu; it keeps the screen empty so the photos and the coffee take all the space |
| Hero | **Steamy window wipe** (new layout; the video is the fly-through from the plan). The page opens full screen on the café seen through a window fogged with steam: the first video frame blurred and a little dark, a soft condensation haze and water droplets, with the headline "Walk in. *Slow down.*" on the left. Scrolling wipes the fog away in one curved hand sweep (left to right) and the café comes into focus; then the camera glides to the espresso bar, steam rising. Two small captions: "Roasted in Hyderabad, every morning." → "Pull up a chair." | The brief's fly-through, opened by a gesture everyone knows from a café window on a cool morning. Not a shape growing into a portal |
| Section shape | **S4 torn paper, "kraft bag" version**: cream sections tear in and out with a rough paper edge (custom SVG edges, slightly different each time), plus arches as the frame shape for photos | A coffee bag and a paper menu: tactile, handmade, cosy |
| Cards | **C6 Arch-top**: every photo card (origins, bakes, spaces) is an arch like the café's tall windows, on cream with a hairline; prices sit on a small copper tag. The menu itself is **not cards**: it is set like a real printed menu (name · dotted leader · price) | Echoes the arched windows in the café photos, so the whole site feels like one place |
| Signature moment | **The Pour** (new, coffee itself): a pinned section where a **pour-over brews as you scroll**: water spirals into the dripper, the coffee blooms, drips, and the glass jug fills. Next to it a **brew scale** (a real café scale look) counts the timer `0:00 → 3:00` and weight `0 g → 250 g`, and the recipe steps light up in turn: *Bloom · First pour · Second pour · Drawdown · Serve*. Driven by scroll, so it plays by itself when filming. Supporting: **1. Roast dial**: a half-circle dial turns Light → Medium → Dark → "Ember" as you scroll, the bean photo darkens with it and tasting notes change; **2. Menu board that flips by itself** (Espresso bar · Pour-over · Cold · Bakes) | About the coffee, not the room, so it is a completely different moment from walking through rooms; and not a builder with a receipt |
| Loader | **I5 Circle expands, "latte cup" version**: a cup seen from above on espresso brown, a copper ring of crema draws round, a small latte-art heart forms, the ER mark sits in the middle, then the cup's circle grows and opens onto the arched window. Fixed ~2.5 s, supports `&at=` | Shows the brand as a cup of coffee before the café opens |

**Motion feel: slow and warm.** Long, soft eases (`power2.out`, 1–1.4 s), gentle fades and rises, steam wisps that drift. Nothing snaps or bounces. One thing moves at a time. The only "busy" moment is the pour.

## Section plan (12)

| # | Section | Kind | Starts from | How it's restyled |
|---|---|---|---|---|
| 1 | **Nav** | — | custom → `MenuCardNav` | Transparent over the page: ember mark + name left; "Open now" + round Menu button right. Full-screen cream menu card with big Fraunces links, today's pour, opening hours. Same on phone |
| 2 | **Hero: "Walk in. Slow down."** | cinematic | FrameHero → `SteamHero` | Full-screen fly-through behind fogged glass (pre-blurred first frame, haze, droplets); headline left, small line "Open today · 7:30 am – 11 pm", hint "Scroll to wipe the glass". Scroll: a curved wipe clears the fog, then the video glides to the espresso bar with 2 captions |
| 3 | **"From hill to cup"** statement | cinematic | Statement → `SlowStatement` | Big Fraunces on espresso, words warm from muted to crema as you scroll: "We buy from four Indian estates, roast every morning and brew every cup by hand." Thin steam lines rise from the last word |
| 4 | **Origins: "Four hills. One roaster."** | cinematic + shop | custom → `OriginArches` | Cream paper band tears in. Row of 4 arch-top photos (Chikmagalur, Coorg, Araku Valley, Nilgiris) + a hand-drawn south India map with dots that light up one by one. Each card: altitude, process, 3 tasting notes. Phone: sideways swipe |
| 5 | **Roast dial** | cinematic | custom → `RoastDial` | Pinned on espresso: a half-circle copper dial turns Light → Medium → Dark → Ember as you scroll; the bean photo crossfades from pale to dark; tasting notes and "best for" (pour-over / espresso / milk) change |
| 6 | **The Pour** (signature) | cinematic | FrameScrub → `ThePour` | Pinned: the pour-over video scrubs with scroll (jug fills). Left: brew scale (timer + grams in copper, counting with scroll) and the 5 recipe steps lighting up. Headline "Brewed *by hand.* Three slow minutes." |
| 7 | **The menu board** | shop | custom → `MenuBoard` | Cream paper band. A printed café menu: tabs Espresso bar · Pour-over · Cold · Bakes **flip by themselves**; each item is "Name ······ ₹" with a one-line note (e.g. "Filter Kaapi Tonic ······ ₹240"). One arch photo beside it swaps with the tab |
| 8 | **Fresh bakes: "Out of the oven at 8."** | shop | ProductGrid → `BakeShelf` | 4 arch-top bake cards (Cardamom bun ₹160, Brown-butter croissant ₹210, Jaggery banana bread ₹180, Filter-coffee tiramisu ₹290), copper price tag, a small "Out at 8 am / 12 pm" label. Hover: arch lifts, steam wisp |
| 9 | **Take home: beans** | shop | ProductGrid → `BeanBags` | Espresso band with torn kraft edge. 4 coffee bags (plain kraft bags, label set in code: origin, roast, notes), 250 g prices (₹650–₹890), grind chips (Whole · Espresso · Pour-over · French press) that **cycle by themselves**, "Add to bag" |
| 10 | **Stay a while** | cinematic | custom → `StayAWhile` | Editorial collage of 3 arch photos at different sizes (window seat, long work table, the roaster) with little notes: "Fast Wi-Fi · plugs at every table", "Quiet corner till noon", "Roasting days: Tue & Fri". For "laptops, dates and long chats" |
| 11 | **Ember Club + reviews** | shop | Testimonials → `ClubAndNotes` | Top: copper offer band "Ember Club · fresh beans every 2 weeks from ₹1,190/month · first cup on us · students 10% off". Below: reviews printed as **café receipts** (monospace-free, Outfit small caps, torn bottom edge), gently drifting in two rows: "Meera · UX designer, works here Tuesdays", "Arjun & Sana · Sunday regulars" |
| 12 | **Visit + footer** | shop | WordmarkFooter → `EmberFooter` | Hours, "Jubilee Hills, Hyderabad", "Roastery tours Sat 10 am", buttons "Order ahead" / "Get directions" (no real address or phone). Huge "Ember Roast" in Fraunces with a slow amber glow like a coal, link columns, "Concept website by SHM Technologies. Brand, products and prices are samples." |

Unchanged patterns imported: 0 planned (everything copied + restyled).

## Motion map (codes from docs/MOTION-MENU.md)

Every section has its own main move; no code is used twice; nothing is "just a fade". Feel: slow and warm (`power2.out` / `power3.inOut`, 1–1.4 s).

| # | Section | Motion | How it plays here | Phone | Record mode |
|---|---|---|---|---|---|
| 0 | Loader | **M5** circle wipe | Latte cup from above: crema ring draws, heart forms, then the cup's circle grows and opens onto the hero | same | fixed ~2.5 s |
| 1 | Nav | **M18** corner grow | The cream menu card unfolds from the Menu button's corner; links then slide up line by line | same, full screen | not opened on camera |
| 2 | Hero | **M19** focus pull | The café sits blurred behind steamy glass; a curved hand-wipe sweeps the fog away left to right and the café comes into sharp focus; the video then scrubs to the espresso machine (M27 frames as its content) | same wipe, lighter blur (8px) | scrub |
| 3 | "From hill to cup" | **M20** scroll-lit statement | Muted words warm to crema one by one; thin steam lines rise from the last word | smaller type, no pin | scrub |
| 4 | Origins | **M8** SVG line draw-on | A copper route draws across the south India map, estate dots light up in turn and each arch card rises as its dot lights | map above a sideways swipe of cards | scrub |
| 5 | Roast dial | **M30** dial rotate | Pinned: copper dial turns Light → Medium → Dark → Ember; bean photos crossfade, notes switch at each stop | smaller dial, same pin | scrub |
| 6 | The Pour (signature) | **M27** frame-sequence scrub | Pinned: jug fills with scroll; brew scale counts `0:00 → 3:00` and `0 g → 250 g`, steps light up | scale above the video, shorter pin | scrub |
| 7 | Menu board | **M2** 3D page flip | Menu pages flip like a paper menu: Espresso bar → Pour-over → Cold → Bakes, by themselves; the arch photo swaps with each page | flips on the X axis | auto while on screen |
| 8 | Fresh bakes | **M13** scale-down inside mask | Each bake photo settles from zoomed-in inside its arch as the arch opens slightly | scale only | scrub |
| 9 | Take home: beans | **M4** stack fan-out | The 4 bags start stacked in the centre and fan out into a row; grind chips then cycle | stack spreads into 2×2 | scrub |
| 10 | Stay a while | **M7** multi-speed parallax | 3 arch photos and 2 notes drift at different speeds, like a slow look around the room | 2 layers, half the amounts | scrub |
| 11 | Ember Club + reviews | **M9** print-out | Reviews feed out of the top like café receipts, line by line, torn edge last; the club band sits above | fewer lines | once on enter |
| 12 | Visit + footer | **M24** outline to fill | Huge "Ember Roast" outline fills with amber from the bottom like a coal catching; a few embers rise off it | same | scrub |

**Transitions:** 2→3 X2 colour wash (video fades into espresso brown) · 3→4 X3 torn cream edge stretches in · 4→5 X1 dial slides up over the origins · 5→6 X5 hard cut on beat · 6→7 X3 torn edge · 8→9 X3 kraft edge · 9→10 X1 overlap slide · 10→11 X2 wash to copper · 11→12 X5 hard cut.

**Details (Round 4):** magnetic Menu button · copper underline draws on links · arch lifts + steam wisp on bake hover (plays once by itself on screen) · grind chips' sliding pill · "Add to bag" count bump · cursor labels "Taste" (origins), "Order" (menu), "Take home" (bags).

## Uniqueness check

8 of 8 different from the last 3 sites, see the sites log.

## Assets needed

Nothing exists yet. Tool: **Google Flow**, images with **Nano Banana Pro**. No brand names or logos on cups, bags or machines: add `no text, no logos` to every prompt and regenerate if a label appears.

**Style words for every photo** (one mood): `warm cosy specialty coffee café, dark roasted-brown wood, cream plaster walls, copper and amber lamp light, soft morning window light, gentle film grain, warm brown colour grade, photorealistic, no people, no text, no logos`

Save everything in `raw/`. Order of importance: **A → B → C → the rest.**

### A. Hero video (fly-through, template C), 16:9, 8 s

- **Key image (start frame):** `Inside a warm specialty coffee café in the early morning, view from just inside the entrance looking down the room towards an espresso bar at the far end, dark wood tables and cane chairs, cream plaster walls, a tall arched window letting in soft golden light, copper pendant lamps glowing amber, a copper espresso machine on the bar in the distance, calm space on the left, + style words`
- **Video:** `Start from the reference image. Smooth drone-like camera glide forward through the café between the tables toward the espresso bar, steady slow speed, ending close to the copper espresso machine with gentle steam rising from its wand and a freshly pulled cup on the counter. Warm interior lighting, soft dust in the light beams, one continuous shot, no cuts, no camera shake, no people, no text, no logos`

Save as `raw/hero.mp4` → `npm run frames -- raw/hero.mp4 frames/ember-hero --zoom 1.2 --max 160`.

### B. The Pour video (signature), 16:9, 8 s, camera still, start + end frame

Make **two images** first (same shot, same light), then one video between them. **No kettle body and no hands anywhere in frame**: only a thin stream of hot water falling from above, with at most the tip of a copper spout at the very top edge.

- **Start image (jug empty):** `Close side view of a pour-over coffee setup on a dark walnut counter: a ceramic cone dripper with a paper filter full of ground coffee sitting on a clear glass coffee jug, the jug empty, a thin stream of hot water falling straight down from above into the dripper, only the tip of a copper spout just visible at the very top edge of the frame, no kettle body, no hands, dark warm brown background with soft amber back light, the setup on the right half of the frame, empty space on the left, + style words`
- **End image (jug full):** `The exact same shot, same angle, same light and framing: the glass jug now full of dark amber coffee, the grounds in the dripper wet and settled, the thin stream of water from above, only the tip of a copper spout at the very top edge, no kettle body, no hands, soft steam rising, + style words`
- **Video:** `Start frame to end frame. The camera stays completely still. A thin stream of hot water falls from above onto the coffee grounds, the grounds bloom and bubble, coffee drips steadily into the glass jug, and the jug slowly fills from empty to full with dark amber coffee, soft steam rising. Only the tip of a copper spout at the very top edge, no kettle body, no hands, no people. Slow and calm, one continuous shot, no cuts, no text, no logos`

Save as `raw/pour.mp4` → `npm run frames -- raw/pour.mp4 frames/ember-pour --zoom 1.2 --max 160`.

### C. Roast dial: 4 bean photos, same angle and light (crossfade)

Same prompt four times, only the roast changes: `Macro top view of a small heap of [green unroasted | light roasted cinnamon-brown | medium roasted chestnut-brown | very dark roasted almost black, oily] coffee beans on a dark slate surface, soft amber side light, centred, + style words`
→ `roast-green`, `roast-light`, `roast-medium`, `roast-dark`

### D. Origins: 4 arch photos (portrait 4:5)
`Misty coffee plantation on the hills of [Chikmagalur | Coorg | Araku Valley | the Nilgiris], India at sunrise, rows of coffee shrubs with red coffee cherries in front, silver oak shade trees, soft golden haze, + style words`

### E. Menu board: 4 photos (portrait 4:5)
`[a double espresso in a small ceramic cup with thick crema | a pour-over coffee in a glass server with a ceramic cup | an iced filter coffee tonic in a tall glass with ice | a flat white with latte-art heart] on a dark walnut counter, + style words`

### F. Bakes: 4 photos (portrait 4:5)
`[a glazed cardamom bun | a flaky brown-butter croissant | a slice of jaggery banana bread | a filter-coffee tiramisu in a glass] on a cream ceramic plate on a dark wood table, + style words`

### G. Coffee bags: 4 cut-outs (transparent PNG)
`A plain brown kraft paper coffee bag with a folded top and a blank cream paper label, standing upright, front view, centred, on a plain light grey background, soft studio light, no text, no logos, no printing` (one is enough; I'll make the 4 bags differ with code: label colour, origin, roast). Remove the background (remove.bg / Photoroom) → PNG.

### H. Stay a while: 3 photos
`[a cosy window seat with cushions by the arched window, a cup on the sill | a long wooden work table with small lamps and power sockets, an open notebook | a copper drum coffee roaster in the back of the café, fresh beans cooling in the tray]`, + style words

Everything else (loader, map, dial, scale, steam, torn edges, menu) I draw with code.

## Round 1 notes (built)

- **Assets in:** 20 photos → `public/images/ember/*.webp` (1100–1400 px). Frames: `frames/ember-hero` (160, 12 MB) and `frames/ember-pour` (160, trimmed at 6.9 s, `--quality 72` to stay under 15 MB: 13 MB).
- **Bag:** `bag-kraft.jpg` cut out to a transparent WebP (grey background and floor shadow removed). The 4 bags are the same photo with a label printed in code (colour, origin, roast dots, notes, and the chosen grind).
- **Light roast:** `roast-light.jpg` in `raw/` is still identical to `roast-green.jpg` (green beans), so `roast-light.webp` is a one-off re-coloured copy of the green photo (an image edit, no code in the site). Waiting for the real light-roast photo; swapping it in is one export.
- **Roast stops** are Green → Light → Medium → Ember (house dark), matching the 4 photos.
- **Unused:** `pour-start.jpg` / `pour-end.jpg` (the frames cover it) and one menu photo spare (flat white is used in the Ember Club band).

## Round 2 notes (big motion)

- **Loader (M5):** `LatteLoader.tsx` replaces the engine loader. Cup rim + saucer draw, coffee fills, copper crema ring, latte heart, name rises (1.7 s); then the coffee becomes a hole onto the site and grows to full screen (0.8 s). Waits for the hero frames (at most 3 s more); `&at=` holds the first frame, preloads everything, plays on the clock.
- **Hero (M19), replaced after review** (the first version, an arch that grew to full screen, was too close to an earlier site's opening): **500vh pin**. The fog is a pre-blurred, darkened copy of the first frame (`hero-fog.webp` 14px, `hero-fog-phone.webp` 8px) under a misty condensation film (denser at the bottom), 90 droplets and 7 drip trails. A 3-screen-wide mask with a soft curved edge slides at a steady speed from 3% to 42% of the scroll (edge on screen ≈125vh), and a wet edge line with 8 droplets running down it moves in step. The headline stays until the wipe is 60% done, then lifts away. The video then scrubs from its first frame to the machine; captions at 54–71% and 78–97% over a stronger dark wash, italic word in crema. `?static=1` shows the fogged glass with the headline.
- **The Pour (M27):** 380vh pin. One scrubbed progress drives the frames, the timer (0:00 → 3:00), the water (0 → 50 g bloom, 150 g, 250 g, with rests) and the steps lighting up. Phone: the video takes the top 56% so the whole jug shows.
- **Roast dial (M30):** 320vh pin. The needle rests at each stop and turns between them (arrives at 0 / 30 / 56 / 82%), the copper arc fills behind it, the bean tray slowly turns, and photo + notes switch halfway between stops. The pills scroll to a stop.

**Round 2 fixes (after the screen recordings):** hero wipe spread over ≈130vh with a visible edge; glass look (film, droplets, trails); crema caption word; The Pour's heading no longer fades in late (it arrived as a near-blank dark screen); the roast dial stacks below 1024px (big dial on top, text below) so its screen is full; origin, bake and review rows swipe sideways below 820px, 2 across from 820px, 4 across from 1024px; the loader's strokes stay invisible until they draw (no stray mark before the cup).

## Round 3 notes (section motion + transitions)

- **Roast dial fix:** stops swap cleanly: the old panel slides up and fades out (0.25 s), the new one slides in after it (0.4 s), never overlapping.
- **Nav (M18):** the menu card unfolds diagonally from the Menu button's corner (triangle → full card), links slide up one by one; closing folds it back.
- **Statement (M20):** words warm from dim to crema, scrubbed from "top 72%" to "bottom 45%"; steam lines drift.
- **Origins (M8):** outline and roastery appear, each estate dot lights, its dashed route draws to the roastery (a solid mask path reveals the dashes), then the 4 cards rise.
- **Menu board (M2):** pages turn on their left edge (out −80°, in from 80°, lines slide in) every 3.4 s while the card is ≥35% on screen; a tab click flips there and pauses the auto-flip a little longer.
- **Bakes (M13):** each arch opens from a smaller arch while the photo settles from 1.35× (phone: scale only), one card a beat after the other.
- **Beans (M4):** the 4 bags start as a fanned stack at the centre of the row (measured live, so it works for 4 across and 2 × 2) and spread to their places; names and prices follow. Grind chips cycle every 2.2 s while on screen until someone picks one.
- **Stay a while (M7):** photos and notes drift at their own speeds (data-speed × 520 px, half on phone).
- **Club + reviews (M9):** each receipt feeds out of a printer slot in steps, one line at a time, torn edge last; the four print one after another.
- **Footer (M24):** the amber fill rises through the wordmark over the whole footer scroll; embers drift up.
- **Transitions:** X2 hero → statement (the video fades into espresso) · X3 every torn edge stretches tall as it comes up and settles flat · X1 Origins pins and dims while the roast dial slides over it, and the same for Beans → Stay a while · X2 Stay a while washes cream → copper before the club band · X5 hard cuts roast → pour and reviews → footer (pour → menu and bakes → beans use the X3 torn edges).

### Motion map check (end of Round 3)

| Section | Code | Result |
|---|---|---|
| Loader | M5 | ✅ |
| Nav | M18 | ✅ |
| Hero | M19 | ✅ |
| Statement | M20 | ✅ |
| Origins | M8 | ✅ |
| Roast dial | M30 | ✅ (swap fixed) |
| The Pour | M27 | ✅ |
| Menu board | M2 | ✅ |
| Bakes | M13 | ✅ |
| Beans | M4 | ✅ |
| Stay a while | M7 | ✅ (steam wisp dropped from the plan: photos + notes only) |
| Club + reviews | M9 | ✅ |
| Footer | M24 | fixed (fill spread over the whole footer) |

**Round 3 fixes (after the recordings):**
- **Hero → statement:** the statement overlaps the last 110vh of the hero (negative margin, transparent box, text centred in a full screen). Video + captions finish by 76–84% of the hero scroll; the espresso wash runs slowly (76% → 95%) while the statement text rises over the darkening café, its first words already lit (lighting starts at "top 85%"). No empty frame at 1440, 820 or 390.
- **Stay a while → Club:** the cream → copper wash moved from Stay a while (it tinted the photos) to the Ember Club band itself: it arrives cream and warms to copper on its way up.
- **Reviews:** receipts ~1.5× bigger (type 13–27px, bigger zigzag); 3 across on laptop (the 4th shows on narrower screens), 2 across on tablet, a swipe on phone; tighter heading; printing starts as the section enters (top at 80%), one receipt every 0.35 s.

## Round 4 notes (details + phone pass)

**Details** (each also plays once by itself in `?record=1`, via `recordDemo.ts`):
- **Menu button:** outline pill that pulls towards the cursor (magnetic, `power3.out`, no bounce) and fills with copper from the left on hover. Record: one nudge + fill ~1.6 s after the cup opens.
- **Text links:** copper underline draws left → right (`.er-link`: footer links, menu-card links). Record: the footer links underline one after another.
- **Cursor:** the engine cursor restyled in `site.css`: a small copper dot; over The Pour, Origins and the Menu board it grows into a copper disc with "Pour", "Swipe", "Flip". Record (the real cursor is hidden while filming): `GhostCursor` glides a copper dot in and grows it into the same label, once per section.
- **Arch cards** (Origins, Bakes, Stay a while): lean up to ±7° towards the cursor, lift 10px with a soft shadow (`useTilt.ts`). Record: each card leans and settles once, a beat apart.
- **Menu board:** the price flips over when its row is hovered. Record: the first page's prices flip row by row.
- **Beans:** "Add to bag" throws a coffee bean in a curve into the bag icon in the nav; the count bumps. Record: one bag is added by itself after the fan-out.
- **Join the club:** slow breathing amber glow (always on).
- **Nav:** a pill in the middle of the header shows the current section's name, the new name sliding up into place (laptop/tablet).

**Phone pass (390px):**
- Automatic audit: every tap target ≥ 44 × 44 px (pills, tabs, grind chips, Add to bag, footer links), body text ≥ 14px, no text within 14px of the screen edge. Left under 14px on purpose: the bag-count badge, the "01–04" numbers on the origin photos and the labels printed on the bags (part of the artwork).
- Swipe rows (Origins, Bakes, Reviews): snap to each card; a "Swipe →" hint shows the first time and hides after the first swipe. Record: the row nudges one card over and back by itself.
- **Phone frames:** `frames/ember-hero-m` (centre-cut 560 × 1080, 3.3 MB, used when the screen is portrait and narrow enough for the fog image to line up) and `frames/ember-pour-m` (750 × 900, 7.1 MB).
- **Smoothness** (390 × 844, CPU slowed 4×, production build): hero 57 fps (3 frames > 34 ms), roast dial 58 fps (2), The Pour 56 fps (0). The loader's slow frames are the page starting up (before the cup draws); the engine start + scroll refresh now happen after the cup has fully opened, so the opening itself is smooth.

### Motion map check (end of Round 4, laptop + phone)

| Section | Code | Laptop | Phone |
|---|---|---|---|
| Loader | M5 | ✅ | ✅ (engine start moved after the opening) |
| Nav | M18 | ✅ | ✅ |
| Hero | M19 | ✅ | ✅ (phone frames) |
| Statement | M20 | ✅ | ✅ |
| Origins | M8 | ✅ | ✅ |
| Roast dial | M30 | ✅ | ✅ |
| The Pour | M27 | ✅ | ✅ (phone frames) |
| Menu board | M2 | ✅ | ✅ |
| Bakes | M13 | ✅ | ✅ |
| Beans | M4 | ✅ | ✅ |
| Stay a while | M7 | ✅ | ✅ |
| Club + reviews | M9 | ✅ | ✅ |
| Footer | M24 | ✅ | ✅ |

## Round 5 notes (polish, speed, record timeline)

**Round 4 fix:** the record-mode cursor demo (`GhostCursor`) runs only on laptops (mouse + at least 1024px wide); phones and tablets never show a cursor (they use the swipe hint). The demo pops up in the right-hand margin at mid-height, shows its label for ~1 s, then disappears: it never crosses the jug or the photos. The engine cursor already hides itself on touch screens.

**Record timeline** (section timeline, `docs/RECORDING.md`): 36.4 s after the 2.5 s loader (≈ 39 s in all), identical at 1440, 820 and 390 (checked from the console plan: done at 36.41 s on all three).

| Stop | Move (s) | Hold (s) | Arrives at |
|---|---|---|---|
| Hero (headline) | 0 | 1.0 | 0 |
| Hero: glass wiped (42%) | 3.2 | | 4.2 |
| Hero: café + captions (80%) | 3.4 | | 7.6 |
| Statement (centre) | 1.6 | 0.4 | 9.2 |
| Origins (bottom: map + cards) | 1.8 | 0.4 | 11.4 |
| Roast dial → Ember (90%) | 1.4 → 3.4 | | 13.2 → 16.6 |
| The Pour → full jug | 1.0 → 3.8 | | 17.6 → 21.4 |
| Menu board (centre) | 1.5 | 1.6 | 22.9 |
| Bakes (centre) | 1.2 | 0.4 | 25.7 |
| Beans (centre) | 1.3 | 1.4 | 27.4 |
| Stay a while (centre) | 1.3 | 0.3 | 30.1 |
| Ember Club (centre) | 1.0 | 0.3 | 31.4 |
| Reviews (top) | 0.9 | 1.3 | 32.6 |
| Visit + footer (bottom) | 1.5 | 1.0 | 35.4 → done 36.4 |

`meta.record.duration` = 36 (only used by constant-speed mode).

**Polish:** small text ≥ 12px on laptop (scale labels 11 → 12px); contrast: crema on espresso 15.4:1, muted on espresso 8.6:1, copper on espresso 7.3:1, ink on cream 13.7:1, muted on cream 5.5:1; the deep copper on cream was 4.1:1, now `#985018` (4.9:1).

**Speed** (production build, local): the page opens ~2.9 s after load (loader included) with all video frames in: 28 MB on laptop, 13 MB on phone (phone frames); a full-page scroll holds 60 fps with 0 slow frames at 1440 and at 390.

## Loader update: "Cherry to bean" (replaces the latte cup)

`CherryLoader.tsx`, code-drawn. On warm paper: a coffee branch draws itself and its leaves fill in, a green cherry grows and ripens (green → yellow → red), splits open and two coffee beans come out; "Ember Roast" rises with "Picked by hand · Araku Valley". The hero scene is built while this finished drawing holds (a thin copper line slides meanwhile, a CSS animation so it keeps moving while the page is busy); then the paper slides up and away with a soft shadow under it, and the hero headline rises. Same contract as before: `onReveal`, `&at=` support, the engine starts after the reveal. Motion code stays an intro (I-style), M5 retired with the cup. `?static=1`: no loader.

## Hero update: "Picked by hand", the Araku harvest (replaces the steamy-window hero)

`HarvestHero.tsx` + `components/harvest/` (art.ts generators, Backdrop, Tree, People, rig). A handmade, storybook-style animated illustration, **all drawn and animated in code** (no images, no video). One screen, not pinned; motion: a seamless 10 s character loop with layered ambient motion (the old M19 is retired with the old hero; M7 is still used by "Stay a while", so this loop is logged as a custom hero motion).

- **Scene (1920 × 1080 stage, scaled to cover):** warm morning sky, misty Eastern Ghats ridges (watercolour filter: wobbly edges, uneven pigment), a plantation hill with rows of coffee bushes under silver oaks, the terracotta path, grass, small flowers, fallen leaves and dropped cherries, paper grain over everything. Coffee trees are generated leaf by leaf with cherries in clusters along the branches; a large tree frames the top right.
- **The women:** W1 (mustard saree) reaches up, picks and drops the cherries into the basket at her waist, twice; W2 (indigo, white butis) picks at waist height into the cane tub on her hip, three times; W3 (earthy red) kneels with a tub on her lap and moves handfuls into the big bamboo basket, twice. Woven borders, glass bangles, flowers in the hair, bindi, gentle profiles.
- **Loop (10 s, seamless):** the baskets fill a little and quietly settle back as the loop closes; the picked cherries grow back behind W1's hand. Branches sway in a breeze (each pair of branches is its own GPU layer, only rotated), saree ends move, mist drifts, sun rays and dappled light flicker, pollen floats. Paused off screen.
- **Text:** real HTML over the calm left side on a soft morning light: "Picked by hand, *in the hills.*", the Araku line, Discover our coffee / Our story, today's pour.
- **Phone / portrait:** the stage frames the women and baskets at the bottom, the sky holds the text; the big framing tree is hidden.
- **`?static=1` / reduced motion:** the still illustration in its rest pose.
- **Record:** hold 3.6 s on the hero while the loop plays.
- "From hill to cup" no longer overlaps the hero (it follows it).
- `SteamHero.tsx`, `hero-fog*.webp` and `frames/ember-hero*` are no longer used (kept for now; the old hero is also in `archive/day-05-ember-roast/`).

## Theme update: white and green (replaces Roast & crema)

Same layout and content, new colours across the whole site. Theme (`site.ts`): bg `#fafcf7` (fresh white) · surface `#f0f5ee` · text `#133024` (deep forest ink) · muted `#50685a` · accent **leaf green `#2f7d4a`** with white text on it · line `#d5e2d3`. The old cream "paper" bands are pale green (`#edf4ea`, accent `#24683c`); the Ember Club band is solid leaf green with white text; the footer is a deep forest band (`.band-forest`: `#133024`, mint accent `#8fe3a8`, the wordmark fills green → mint). The Pour's text now sits on a white wash over the video; the brew scale stays a dark-green device with mint digits. Contrast: ink on white ≈ 14:1, muted ≈ 5.9:1, green accent ≈ 5:1. Photos and the harvest illustration keep their own colours.

**Loader (improved):** white paper with a soft green glow; the branch sways the whole time; leaves unfold, the cherry ripens and pops with a little spray, two raw (pale green) beans come out and roast to brown while the hero is built (CSS cross-fade, keeps moving while the page is busy), then the paper slides up with a leafy green edge. "From cherry to cup · Araku Valley". 2.6 s plus the build hold.

**Hero polish (white/green pass):** fresh morning palette (misty white-mint sky, paler sun, softer earth, neutral green-grey paper grain, white light behind the words) so the illustration matches the site; laptops frame the scene closer (scene x 230–1920, y 140–1080: the women ~15% larger); coffee stems end low in the bush (no poles); shorter copy; the "today's pour" line became a facts row (1,100 m up · Shade-grown · Picked Nov–Feb); the headline stays on one line from 768px up; a small scroll cue (mouse with a drifting dot) at the bottom centre.

**No glow behind the hero text:** the soft white light behind the words is removed. Instead the painting keeps the left side calm: the nearest coffee tree grows its branches mostly to the right (`leftScale`), tall silver oaks stand only on the right half, laptops frame the scene a little wider (scene x 120–1920, y 70–1080), the copy aligns to the left margin (not the centred container) so it never runs into the trees on wide screens, the headline is capped at 100px, "Our story" has a solid white fill and the facts row uses the ink colour.

**Hero + header upgrade:** headline 76–88px on laptops (44–56px phones), text column 560px, paragraph ~36–44 characters a line; a subtle warm-cream wash from the left (fades out before the centre; on portrait screens from the top); "Shop our coffee" (→ Take home) as the forest-green primary with a nudging arrow, hover darken, pressed and focus states; "Our story" as a quiet translucent secondary; proof points with small line icons (mountain, leaf, calendar). The header is now one light cream bar with blur (logo · current section · live status · bag · Menu) instead of three pills; the status is real (Hyderabad time against the café hours: "Open now · till 11 pm" / "Closed · opens 7:30 am"). Site-wide visible keyboard focus rings. The distant hills drift slightly slower as the hero scrolls away (gentle parallax). Portrait screens: words at the top, phones frame the women tightly, upright tablets a little wider, proof points hidden.

**Fix: branches + bottom fade.** Every coffee-tree stem now runs along the exact line its branches leave from, all the way to the top branch (a filled shape tapering from trunk to a thin leader), so no branch floats; the earlier "short stems" change had left upper branches hanging. Removed the white fade over the bottom of the hero and the pale light spots on the path; the cream wash behind the words is now a soft oval from the left edge that fades out above the ground, so the soil and plants keep their full colour to the bottom edge.

**Removed: "From hill to cup" statement** (section 3, motion M20 scroll-lit words + steam lines). Its component (`SlowStatement.tsx`), text, nav entry and static-mode rule are gone; the hero's "Our story" button now goes to Our beans (`#origins`). The hero is followed directly by the roast dial. The record timeline loses that stop (about 2 s shorter).

**Navbar rework:** links in page order (The roast · Our beans · Menu · Bakes · Visit) with one soft pill that slides to the section you're in (scroll-position based, works with motion off), a "Shop beans" button and the bag; the bar firms up once you leave the hero. Phones/tablets: a Menu button opens a panel (large tap targets, live status, hours, address, Shop beans), closing on a link, Escape or a tap outside. Hours live once in `content.ts` (`nav.hours`), read by the live status and the panel.

**Footer: Warli-inspired folk-art mural as the background** (client brief; three colours only: forest green #124D25, warm ivory #F7F1E3, near-black #171714). Layers in `FooterScene.tsx`, so no text sits on the art: `FolkHills` (overlapping green hills with ivory gaps, ending in a curved ivory valley with fine ink lines), the logo + links + copyright on plain ivory with `FolkScene` on the right on laptops (a folk tree with outlined green leaves, three women: two with pots on their heads, one with a basket), and `FolkBorder` at the bottom edge (two sweeping bands from the lower corners towards the middle: hatching and nested triangles, heavy + fine ink edges; then a full-width nested-triangle border). No arrival animation (removed at the client's request); the women still bob gently. Visit is its own plain section above it.

**Brand mark (client's logo, redrawn):** a coffee cup whose right side becomes a coffee bean, with two flames of steam above it (`Logo.tsx`: `LogoMark`, `Logo`, `faviconSvg`). One colour, drawn in code (sharp at any size); the gap around the bean and the crease are real cut-outs. Used in the navbar, the loader (beside the name), the browser-tab icon (green on a cream tile) and the footer base (cream on green). The source file is `logo.png` in the project root.

**Roast dial background:** the whole section roasts with the needle: background, text, accent, lines and the dial run Green (fresh pale green) → Light (warm cream) → Medium (toasted tan) → Ember (deep espresso with ember-orange accents), scrubbed with the scroll. Behind the content: a soft glow behind the dial (green → ember heat), the current stop's name huge and faint, and faint coffee beans drifting slowly. `?static=1` shows the Ember colours; without motion the pills switch the colours too.

## Loader update: "Brew the mark" (replaces Cherry to bean)

`BrewLoader.tsx`, code-drawn from the brand mark (geometry shared with `Logo.tsx`). On white paper with a soft leaf-green glow: the handle and the cup's outline draw, green coffee fills the cup with a moving surface, the bean drops in and carves its gap in the cup, its crease draws, the two flames of steam rise; "Aura Roast" rises letter by letter with "Roasted every morning · Hyderabad" and a thin progress line. While the hero is built the coffee surface keeps moving and the steam flickers (CSS animations). Exit: the paper slides up with the leafy green edge and the big mark flies into the navbar, landing exactly on the nav logo (`[data-brand-mark]`, hidden under `html.brand-loading` until it lands). Same contract and timing as before (2.6 s + build hold, `onBuild` / `onReveal`, `&at=`), so the record timeline is unchanged. `?static=1` / reduced motion: no loader.

**Footer compacted (~40% shorter: 840 → ~505px at 1440, ~1100 → ~730px on phones):** hills band cropped to ~85–124px (its curved valley kept), tighter spacing between logo, links and copyright, the folk scene scaled to ~400px wide and aligned beside the links, and the bottom border redrawn at 1440 × 110 (shown ~70–100px tall) with its patterns kept at a crisp size; phones show the link columns two across. Added a small folk sun (pale-gold disc, thin ivory rays) on the hills, top right: CSS only, rises a few px and settles (9 s) while the rays sway slowly (12 s); still for reduced motion and `?static=1`.

**Folk scene redrawn to match the reference:** the plant sits inside a thin circle (slender branching stem, ~15 small individually outlined leaves, slightly irregular); three Warli women with bent, lively poses: one bent forward from the waist picking, reaching into the plant with a basket held out; one walking mid-stride with a pot balanced on her head; one dancing home with a pot. The pots are proper clay vessels (rounded body, narrow neck and rim, ivory bands and a small zigzag). Torso/skirt triangles with ivory hem bands, thin angular limbs, round heads.
