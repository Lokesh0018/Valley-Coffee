"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { nav } from "../content";
import { Logo } from "./Logo";
import { useCart } from "../cart";

// The navbar: one light cream bar floating at the top.
// Laptop: logo · links in page order (a soft pill slides to the section you are in) · live status · "Shop beans" · bag.
// Phone/tablet: logo · bag · a Menu button that opens a panel under the bar (big tap targets, the live status, the
// hours, "Shop beans"); it closes on a link, Escape or a tap outside. The bar firms up once you leave the hero.
// Hours live once, in content.ts (nav.hours): the status and the panel both read them.

const fmt = (h: number) => (h === 24 ? "midnight" : h === 12 ? "noon" : `${h % 12 === 0 ? 12 : Math.floor(h % 12)}${h % 1 ? ":30" : ""} ${h < 12 ? "am" : "pm"}`);
const hoursOn = (weekday: number) => nav.hours.find((h) => h.weekdays.includes(weekday))!;

/** "Open now · till 11 pm" or "Closed · opens 7:30 am", from the real time in Visakhapatnam. */
function cafeStatus(now = new Date()): { open: boolean; text: string } {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const h = Number(get("hour")) + Number(get("minute")) / 60;
  const today = hoursOn(day);
  if (h >= today.open && h < today.close) return { open: true, text: `Open now · till ${fmt(today.close)}` };
  const next = h < today.open ? today.open : hoursOn((day + 1) % 7).open;
  return { open: false, text: `Closed · opens ${fmt(next)}` };
}

function StatusDot({ open }: { open: boolean }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      {open && <span className="nav-live-ping absolute inset-0 rounded-full bg-[#3f9a5c]" />}
      <span className={`relative h-2 w-2 rounded-full ${open ? "bg-[#3f9a5c]" : "bg-[#b9a27a]"}`} />
    </span>
  );
}

export default function MenuCardNav() {
  const cart = useCart();
  const bag = cart.count;
  const prevBag = useRef(0);
  const ready = useRef(false);
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const bagIcon = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // live status, refreshed every minute
  useEffect(() => {
    const tick = () => setStatus(cafeStatus());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // the section you are in (the last linked section whose top has passed 45% of the screen; none over the hero),
  // and whether you have left the hero. Plain scroll position, so it also works with motion turned off.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      let current: string | null = null;
      for (const l of nav.links) {
        const el = document.querySelector(l.href);
        if (el && el.getBoundingClientRect().top <= line) current = l.href;
      }
      setActive(current);
      setScrolled(window.scrollY > window.innerHeight * 0.6);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // the sliding pill follows the active link
  useLayoutEffect(() => {
    const a = active ? linksRef.current?.querySelector<HTMLElement>(`a[href="${active}"]`) : null;
    setPill(a ? { x: a.offsetLeft, w: a.offsetWidth } : null);
  }, [active]);

  // something landed in the bag (count went up, or the flying bean arrived): the count bumps
  useEffect(() => {
    const bump = () => {
      const icon = bagIcon.current;
      if (!icon) return;
      gsap.fromTo(icon.querySelector(".bag-count"), { scale: 1.7 }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
      gsap.fromTo(icon, { rotation: -10 }, { rotation: 0, duration: 0.5, ease: "back.out(2)" });
    };
    // (no bump on the first paint after the saved bag loads)
    if (cart.hydrated && ready.current && bag > prevBag.current) bump();
    if (cart.hydrated) ready.current = true;
    prevBag.current = bag;
  }, [bag, cart.hydrated]);

  // phone/tablet panel: Escape or a tap outside closes it
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node) && !menuBtn.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const hoursText = nav.hours.map((h) => `${h.days} ${fmt(h.open)} – ${fmt(h.close)}`).join(" · ");

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-[clamp(10px,2vw,28px)] pt-[clamp(10px,1.6vw,20px)]">
      {/* outer radius = button radius (22) + bar padding (6), so the buttons sit concentric inside the bar */}
      <div
        className={`nav-bar relative mx-auto flex max-w-[1360px] items-center justify-between gap-3 rounded-[28px] border py-1.5 pl-4 pr-1.5 text-[#133024] backdrop-blur-sm max-md:backdrop-blur-none transition-[background-color,box-shadow,border-color] duration-300 md:pl-5 lg:grid lg:grid-cols-[1fr_auto_1fr] ${
          scrolled || open
            ? "border-[#133024]/12 bg-[#fafcf7]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_14px_34px_-18px_rgba(19,48,36,0.45)]"
            : "border-[#133024]/8 bg-[#fafcf7]/75 max-md:bg-[#fafcf7]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_28px_-20px_rgba(19,48,36,0.35)]"
        }`}
      >
        <a href="#top" className="flex min-h-11 shrink-0 items-center justify-self-start rounded-full" data-cursor="Home" aria-label="Aura Roast, back to top" onClick={() => setOpen(false)}>
          <Logo />
        </a>

        {/* laptop: links in page order, centred on a soft track; a raised white pill slides to the section you are in */}
        <nav aria-label="Primary" className="hidden lg:block">
          <div ref={linksRef} className="relative flex items-center rounded-full bg-[#133024]/[0.045] p-1">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-1 left-0 rounded-full bg-white shadow-[0_1px_2px_rgba(19,48,36,0.14),0_0_0_1px_rgba(19,48,36,0.06)] transition-[transform,width,opacity] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
              style={{ width: pill?.w ?? 0, transform: `translateX(${pill?.x ?? 0}px)`, opacity: pill ? 1 : 0 }}
            />
            {nav.links.map((l) => {
              const isActive = active === l.href;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium tracking-[0.01em] transition-colors duration-200 ${
                    isActive ? "text-[#1f5a35]" : "text-[#133024]/65 hover:text-[#133024]"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 rounded-full bg-[#2f7d4a] transition-[transform,opacity] duration-300 ${isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                  />
                  {l.label}
                </a>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          {status && (
            <span
              className="mr-1 hidden items-center gap-2 border-r border-[#133024]/12 pr-4 text-[13px] text-[#133024]/80 xl:inline-flex"
              title={hoursText}
            >
              <StatusDot open={status.open} />
              {status.text}
            </span>
          )}
          <a
            href={nav.cta.href}
            className="hv-cta hidden h-11 items-center gap-2 rounded-full bg-[#2f7d4a] pl-5 pr-4 text-[14px] font-semibold text-white md:inline-flex"
          >
            {nav.cta.label}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="hv-cta-arrow">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <button
            ref={bagIcon}
            type="button"
            onClick={() => {
              setOpen(false);
              cart.setOpen(true);
            }}
            aria-label={`Open your bag, ${bag} ${bag === 1 ? "item" : "items"}`}
            aria-haspopup="dialog"
            className="bag-icon relative grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-[#133024]/15 transition-colors duration-200 hover:border-[#2f7d4a] hover:bg-[#2f7d4a]/8"
            data-cursor="Bag"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 8h14l-1.2 12H6.2L5 8Z M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span
              aria-hidden
              className={`bag-count absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#2f7d4a] px-1 text-[11px] font-semibold text-white ring-2 ring-[#fafcf7] transition-opacity duration-200 ${
                bag ? "opacity-100" : "opacity-0"
              }`}
            >
              {bag}
            </span>
          </button>
          {/* phone/tablet: the menu button */}
          <button
            ref={menuBtn}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="nav-panel"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#133024]/20 px-4 text-[14px] font-semibold transition-colors duration-200 hover:border-[#2f7d4a] lg:hidden"
          >
            <span className="relative block h-3 w-4" aria-hidden>
              <span className={`absolute left-0 top-0 block h-[1.6px] w-4 rounded bg-current transition-transform duration-300 ${open ? "translate-y-[5.2px] rotate-45" : ""}`} />
              <span className={`absolute bottom-0 left-0 block h-[1.6px] w-4 rounded bg-current transition-transform duration-300 ${open ? "-translate-y-[5.2px] -rotate-45" : ""}`} />
            </span>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* phone/tablet panel */}
      <div
        id="nav-panel"
        ref={panel}
        aria-hidden={!open}
        className={`mx-auto mt-2 max-w-[1360px] origin-top rounded-[28px] border border-[#133024]/12 bg-[#fafcf7]/[0.97] p-3 text-[#133024] shadow-[0_24px_50px_-24px_rgba(19,48,36,0.5)] transition-[opacity,transform,visibility] duration-300 lg:hidden ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <nav aria-label="Sections">
          <ul>
            {nav.links.map((l, i) => (
              <li
                key={l.href}
                className={`border-b border-[#133024]/8 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] last:border-0 ${
                  open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${60 + i * 45}ms` : "0ms" }}
              >
                <a
                  href={l.href}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                  aria-current={active === l.href ? "location" : undefined}
                  className={`font-display group my-1 flex min-h-12 items-center gap-4 rounded-2xl px-4 text-[22px] transition-colors ${
                    active === l.href ? "bg-[#2f7d4a]/10 text-[#1f5a35]" : "hover:bg-[#133024]/5"
                  }`}
                >
                  <span className="w-6 [font-family:var(--font-body-family),sans-serif] text-[12px] tabular-nums tracking-[0.08em] text-[#50685a]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1">{l.label}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#2f7d4a] transition-transform duration-200 group-hover:translate-x-0.5">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-2 grid gap-3 rounded-2xl bg-[#edf4ea] p-4 text-[14px]">
          {status && (
            <p className="flex items-center gap-2 font-semibold">
              <StatusDot open={status.open} />
              {status.text}
            </p>
          )}
          <dl className="grid gap-1 text-[#4f6657]">
            {nav.hours.map((h) => (
              <div key={h.days} className="flex justify-between gap-4">
                <dt>{h.days}</dt>
                <dd>
                  {fmt(h.open)} – {fmt(h.close)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-[#4f6657]">{nav.address}</p>
          <a
            href={nav.cta.href}
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            className="mt-1 inline-flex h-12 items-center justify-center rounded-full bg-[#2f7d4a] text-[15px] font-semibold text-white transition-colors hover:bg-[#24683c]"
          >
            {nav.cta.label}
          </a>
        </div>
      </div>
    </header>
  );
}
