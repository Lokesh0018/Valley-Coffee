// All text and data for Aura Roast (a concept site: brand, products and prices are samples).

export const nav = {
  // in page order; the logo takes you back to the top
  links: [
    { label: "The roast", href: "#roast" },
    { label: "Our beans", href: "#origins" },
    { label: "Menu", href: "#menu" },
    { label: "Bakes", href: "#bakes" },
    { label: "Visit", href: "#visit" },
  ],
  cta: { label: "Shop beans", href: "#beans" },
  // opening hours in Visakhapatnam, 24 h clock (7.5 = 7:30). The live "Open now" status and the menu panel both read these.
  hours: [
    { days: "Mon–Fri", weekdays: [1, 2, 3, 4, 5], open: 7.5, close: 23 },
    { days: "Sat–Sun", weekdays: [0, 6], open: 8, close: 24 },
  ],
  address: "Beach Road, Visakhapatnam",
};


export type Origin = {
  name: string;
  estate: string;
  altitude: string;
  process: string;
  notes: string[];
  image: string;
  lon: number;
  lat: number;
};

export const origins = {
  eyebrow: "Our beans",
  title: ["Four hills.", "*One roaster.*"],
  text: "Every bag starts on a hillside in the south, picked ripe and shipped to our roaster in Visakhapatnam, by the sea below the Araku hills.",
  stats: [
    ["4", "family estates"],
    ["1,100–1,700 m", "above the sea"],
    ["100%", "hand-picked"],
  ] as [string, string][],
  roastery: { name: "Aura Roastery, Visakhapatnam", lon: 83.22, lat: 17.69 },
  items: [
    { name: "Chikmagalur", estate: "Kalasa Ridge Estate", altitude: "1,450 m", process: "Washed", notes: ["Cocoa", "Orange peel", "Jaggery"], image: "/images/ember/origin-chikmagalur.webp", lon: 75.77, lat: 13.32 },
    { name: "Coorg", estate: "Misty Fold Estate", altitude: "1,150 m", process: "Honey", notes: ["Plum", "Brown sugar", "Clove"], image: "/images/ember/origin-coorg.webp", lon: 75.74, lat: 12.42 },
    { name: "Nilgiris", estate: "Blue Hill Estate", altitude: "1,700 m", process: "Anaerobic", notes: ["Red wine", "Cherry", "Cacao nib"], image: "/images/ember/origin-nilgiris.webp", lon: 76.7, lat: 11.41 },
    { name: "Araku Valley", estate: "Valley Co-op Farms", altitude: "1,100 m", process: "Washed", notes: ["Jasmine", "Stone fruit", "Honey"], image: "/images/ember/origin-araku.webp", lon: 82.87, lat: 18.33 },
  ] satisfies Origin[],
};

export const roast = {
  eyebrow: "The roast",
  title: ["How dark", "*do you like it?*"],
  stops: [
    { name: "Green", sub: "Before the fire", time: "0 min", temp: "24 °C", notes: "Grassy, raw and hard as a pebble. This is where every bean starts.", best: "Not for brewing yet", image: "/images/ember/roast-green.webp" },
    { name: "Light", sub: "First crack", time: "9 min", temp: "205 °C", notes: "Bright and floral: jasmine, citrus, tea-like body.", best: "Best for pour-over", image: "/images/ember/roast-light.webp" },
    { name: "Medium", sub: "Just after first crack", time: "11 min", temp: "218 °C", notes: "Round and sweet: caramel, cocoa, a little fruit.", best: "Best for espresso", image: "/images/ember/roast-medium.webp" },
    { name: "Ember", sub: "Our house dark", time: "13 min", temp: "228 °C", notes: "Deep and smoky: dark chocolate, molasses, toasted spice.", best: "Best with milk", image: "/images/ember/roast-dark.webp" },
  ],
};

export const pour = {
  frames: "/frames/ember-pour",
  framesPhone: "/frames/ember-pour-m", // centre-cut frames (750 × 900) for phones
  eyebrow: "Signature · The pour",
  title: ["Brewed *by hand.*", "Three slow minutes."],
  recipe: ["18 g coffee", "250 g water", "93 °C", "medium-fine"],
  total: { seconds: 180, grams: 250 },
  steps: [
    { at: "0:00", name: "Bloom", detail: "50 g of water wakes the grounds up" },
    { at: "0:45", name: "First pour", detail: "Slow spirals up to 150 g" },
    { at: "1:30", name: "Second pour", detail: "Up to 250 g, keep it steady" },
    { at: "2:15", name: "Drawdown", detail: "Let the last drops fall through" },
    { at: "3:00", name: "Serve", detail: "Swirl, pour, slow down" },
  ],
};

export type MenuItem = { name: string; note: string; price: number; tag?: string };

export const menu = {
  eyebrow: "The menu",
  title: ["Something warm,", "*something slow.*"],
  pages: [
    {
      tab: "Espresso bar",
      image: "/images/ember/menu-espresso.webp",
      items: [
        { name: "Espresso", note: "Aura house blend, 36 g in 28 seconds", price: 160 },
        { name: "Cortado", note: "Equal parts espresso and warm milk", price: 200 },
        { name: "Flat white", note: "Double ristretto, silky milk", price: 230, tag: "Most loved" },
        { name: "Cappuccino", note: "Thick foam, a dust of cocoa", price: 220 },
        { name: "Honey cardamom latte", note: "Wild honey, green cardamom", price: 260 },
        { name: "Kerala cocoa mocha", note: "70% single-estate chocolate", price: 270 },
      ],
    },
    {
      tab: "Pour-over",
      image: "/images/ember/menu-pourover.webp",
      items: [
        { name: "Araku Valley", note: "Washed · jasmine, stone fruit", price: 290, tag: "Today's pour" },
        { name: "Chikmagalur", note: "Washed · cocoa, orange peel", price: 280 },
        { name: "Coorg", note: "Honey process · plum, brown sugar", price: 300 },
        { name: "Nilgiris", note: "Anaerobic · red wine, cherry", price: 340 },
        { name: "Flight of three", note: "Three small cups, side by side", price: 480 },
      ],
    },
    {
      tab: "Cold",
      image: "/images/ember/menu-cold.webp",
      items: [
        { name: "18-hour cold brew", note: "Chikmagalur, steeped overnight", price: 240 },
        { name: "Filter kaapi tonic", note: "Chicory brew, tonic, orange", price: 260, tag: "New" },
        { name: "Iced flat white", note: "Double shot over cold milk", price: 250 },
        { name: "Coconut cold brew", note: "Tender coconut water, cold brew", price: 270 },
        { name: "Espresso lemonade", note: "Fresh lime, a little sugar", price: 230 },
      ],
    },
    {
      tab: "Bakes",
      image: "/images/ember/bake-croissant.webp",
      items: [
        { name: "Cardamom bun", note: "Glazed, still warm at 8 am", price: 160, tag: "Most loved" },
        { name: "Brown-butter croissant", note: "72 layers, baked in-house", price: 210 },
        { name: "Jaggery banana bread", note: "With salted butter", price: 180 },
        { name: "Filter-coffee tiramisu", note: "Our decoction, mascarpone", price: 290 },
        { name: "Ghee-roast cookie", note: "Crisp edges, soft middle", price: 120 },
      ],
    },
  ] satisfies { tab: string; image: string; items: MenuItem[] }[],
};

export const bakes = {
  eyebrow: "Fresh bakes",
  title: ["Out of the oven", "*at 8.*"],
  text: "Baked in our own oven every morning, in small batches, until they run out.",
  // the day's oven, shown as a small timeline beside the title
  schedule: [
    { at: "7 am", label: "Oven on" },
    { at: "8 am", label: "First batch" },
    { at: "12 pm", label: "Second batch" },
    { at: "Till gone", label: "No reheats" },
  ],
  note: "Whole cakes and boxes of six with a day's notice",
  items: [
    { name: "Cardamom bun", note: "Soft, glazed, green cardamom", price: 160, out: "Out at 8 am", tag: "Most loved", pairs: "Cortado", image: "/images/ember/bake-bun.webp" },
    { name: "Brown-butter croissant", note: "Flaky, nutty, 72 layers", price: 210, out: "Out at 8 am", pairs: "Flat white", image: "/images/ember/bake-croissant.webp" },
    { name: "Jaggery banana bread", note: "Warm slice, salted butter", price: 180, out: "Out at 12 pm", tag: "Eggless", pairs: "Araku pour-over", image: "/images/ember/bake-bananabread.webp" },
    { name: "Filter-coffee tiramisu", note: "Made with our decoction", price: 290, out: "Out at 12 pm", pairs: "Espresso", image: "/images/ember/bake-tiramisu.webp" },
  ] as { name: string; note: string; price: number; out: string; tag?: string; pairs: string; image: string }[],
};

export type Bag = {
  name: string; // the lot, printed big on the label
  process: string;
  village: string;
  altitude: string;
  roast: string;
  roastLevel: number;
  notes: string;
  price: number;
  label: string;
  ink: string;
};

// Every bag comes from Araku Valley (Eastern Ghats): four lots from small family farms, one per process / roast.
export const beans = {
  eyebrow: "Take home · Araku Valley",
  title: ["Straight from", "*Araku.*"],
  text: "Four lots from small family farms in the Araku hills, shade-grown under silver oaks. Roasted this week in Visakhapatnam, packed the same day. 250 g bags, ground the way you brew.",
  bagImage: "/images/ember/bag-kraft.webp",
  grinds: ["Whole bean", "Espresso", "Pour-over", "French press"],
  // the small "map" caption over the hills behind the bags
  place: { name: "Araku Valley, Andhra Pradesh", coords: "18.33° N · 82.87° E", range: "900 – 1,200 m · Eastern Ghats" },
  items: [
    { name: "Mist Line", process: "Washed", village: "Chompi", altitude: "1,100 m", roast: "Light", roastLevel: 1, notes: "Jasmine · stone fruit · honey", price: 790, label: "#f4e9d8", ink: "#2a1a10" },
    { name: "Sun Terrace", process: "Natural", village: "Madagada", altitude: "980 m", roast: "Medium-light", roastLevel: 2, notes: "Blueberry · cacao · red wine", price: 890, label: "#2f7d4a", ink: "#ffffff" },
    { name: "Silver Oak", process: "Honey", village: "Sunkarametta", altitude: "1,050 m", roast: "Medium", roastLevel: 3, notes: "Plum · jaggery · orange peel", price: 840, label: "#cdbd9c", ink: "#2a1a10" },
    { name: "Valley Dark", process: "Washed", village: "Galikonda slopes", altitude: "1,150 m", roast: "Dark", roastLevel: 4, notes: "Dark chocolate · molasses · clove", price: 690, label: "#1f4d33", ink: "#f4f8f1" },
  ] satisfies Bag[],
};

export const stay = {
  eyebrow: "Stay a while",
  title: ["Stay", "*a while.*"],
  text: "For laptops, first dates and long chats. Nobody will rush you.",
  photos: [
    { image: "/images/ember/stay-window.webp", label: "The window seat", note: "Quiet corner till noon" },
    { image: "/images/ember/stay-table.webp", label: "The long table", note: "Fast Wi-Fi · plugs at every seat" },
    { image: "/images/ember/stay-roaster.webp", label: "The roaster", note: "Roasting days: Tue & Fri" },
  ],
};

export const reviews = {
  eyebrow: "Notes from regulars",
  title: ["Kind words,", "*printed fresh.*"],
  items: [
    { order: [["Flat white", 230], ["Cardamom bun", 160]], text: "The flat white is balanced beautifully and the bun is still warm when it hits the table. I’ve started turning my Tuesday meetings into coffee dates here.", name: "Meera S.", who: "Brand designer" },
    { order: [["Pour-over, Araku", 290], ["Pour-over, Coorg", 300]], text: "The baristas actually remember our preference, and every pour-over tastes like a different little adventure. It’s become our slow Sunday ritual.", name: "Arjun & Sana", who: "Weekend regulars" },
    { order: [["Cold brew", 240], ["Banana bread", 180]], text: "The cold brew is smooth without being sweet, and the banana bread is the kind of thing you plan your next visit around. Perfect for study sessions.", name: "Karthik R.", who: "Architecture student" },
    { order: [["Beans, Valley Dark", 690]], text: "We brought home a bag after the roastery talk and it changed our morning routine. The roast is deep, clean, and really worth repeating.", name: "Farah N.", who: "Home brewer" },
  ] as { order: [string, number][]; text: string; name: string; who: string }[],
};

export const visit = {
  eyebrow: "Visit",
  title: ["Come in", "*slow.*"],
  area: "Beach Road, Visakhapatnam",
  hours: [
    ["Mon – Fri", "7:30 am – 11 pm"],
    ["Sat – Sun", "8 am – midnight"],
    ["Roastery tours", "Saturdays, 10 am"],
  ],
  extras: ["Window seats", "Work tables", "Pet friendly", "Beans to take home"],
  buttons: [
    { label: "Order ahead", href: "#menu" },
    { label: "Get directions", href: "#visit" },
  ],
};

export const contact = {
  eyebrow: "Write to us",
  title: ["Say hello,", "*we'll pour.*"],
  intro: "Book a table, order beans in bulk or plan a small event. Your note opens in WhatsApp, ready to send.",
  // the café's WhatsApp number in international format, digits only (e.g. country code + number).
  // Left empty for this concept: WhatsApp then opens with the message and lets you pick the chat.
  whatsapp: "",
  replies: "Usually replies within an hour, 7:30 am – 11 pm",
  topics: [
    { id: "table", label: "Book a table", placeholder: "Window seat if you have one, it's a birthday…" },
    { id: "beans", label: "Beans to take home", placeholder: "Which beans, how many bags, whole bean or ground…" },
    { id: "event", label: "Event or catering", placeholder: "The date, how many people, what you have in mind…" },
    { id: "hello", label: "Just saying hi", placeholder: "Tell us anything, we read every note." },
  ],
  times: ["8:00 am", "10:00 am", "12:30 pm", "4:00 pm", "6:30 pm", "8:30 pm"],
  sample: "Hi Aura Roast! A table for 2 this Saturday at 10 am, please. Window seat if you have one.",
  button: "Send on WhatsApp",
  fine: "Opens WhatsApp with your note. Nothing is sent until you press send there.",
};

export const footer = {
  wordmark: "Aura Roast",
  columns: [
    { title: "Café", links: ["The menu", "Fresh bakes", "Stay a while", "Visit"] },
    { title: "Beans", links: ["Single origins", "Aura Club", "Brew guides", "Gift a bag"] },
    { title: "Follow", links: ["Instagram", "Spotify playlist", "Newsletter"] },
  ],
  note: "Concept website by SHM Technologies. Aura Roast is an invented brand; products and prices are samples.",
};

// Hero "Picked by hand" (HarvestHero.tsx): the Araku Valley harvest, a handmade animated illustration
export const harvest = {
  eyebrow: "Araku Valley · Picked by hand",
  title: ["Picked by hand,", "*in the hills.*"],
  text: "Grown under silver oaks on small family farms in the Eastern Ghats, picked cherry by cherry when ripe, and roasted fresh in Visakhapatnam.",
  buttons: [
    { label: "Shop our coffee", href: "#beans" },
    { label: "Our story", href: "#origins" },
  ],
  facts: ["1,100 m up", "Shade-grown", "Picked Nov–Feb"],
};

// The bag drawer (BagDrawer.tsx): what you have picked, then the order goes out as a WhatsApp note
export const cart = {
  title: ["Your", "*bag.*"],
  empty: { title: "Nothing in the bag yet.", text: "Beans to take home and bakes to pick up both land here.", links: [{ label: "Shop beans", href: "#beans" }, { label: "See the bakes", href: "#bakes" }] },
  pickup: "Pick up at the cafe, Beach Road, ready in 20 min",
  free: 1500, // free delivery in Visakhapatnam from this amount
  button: "Order on WhatsApp",
  fine: "Opens WhatsApp with your order typed out. Nothing is sent until you press send there. Payment at pick-up.",
  clear: "Empty the bag",
};
