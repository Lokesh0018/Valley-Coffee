"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { nav } from "../content";
import { Logo } from "./Logo";

// The navbar: one light cream bar floating at the top.
// Laptop: logo · links in page order (a soft pill slides to the section you are in) · live status · "Shop beans" · bag.
// Phone/tablet: logo · bag · a Menu button that opens a panel under the bar (big tap targets, the live status, the
// hours, "Shop beans"); it closes on a link, Escape or a tap outside. The bar firms up once you leave the hero.
// Hours live once, in content.ts (nav.hours): the status and the panel both read them.

export const BAG_EVENT = "ember:bag";

const fmt = (h: number) => (h === 24 ? "midnight" : h === 12 ? "noon" : `${h % 12 === 0 ? 12 : Math.floor(h % 12)}${h % 1 ? ":30" : ""} ${h < 12 ? "am" : "pm"}`);
const hoursOn = (weekday: number) => nav.hours.find((h) => h.weekdays.includes(weekday))!;

/** "Open now · till 11 pm" or "Closed · opens 7:30 am", from the real time in Hyderabad. */
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
  const [bag, setBag] = useState(0);
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const bagIcon = useRef<HTMLAnchorElement>(null);
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

  // a bean landed in the bag: the count bumps
  useEffect(() => {
    const onBag = () => {
      setBag((n) => n + 1);
      const icon = bagIcon.current;
      if (icon) {
        gsap.fromTo(icon.querySelector(".bag-count"), { scale: 1.7 }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
        gsap.fromTo(icon, { rotation: -10 }, { rotation: 0, duration: 0.5, ease: "back.out(2)" });
      }
    };
    window.addEventListener(BAG_EVENT, onBag);
    return () => window.removeEventListener(BAG_EVENT, onBag);
  }, []);

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
      <div
        className={`nav-bar relative flex items-center justify-between gap-3 rounded-[22px] border py-1.5 pl-4 pr-1.5 text-[#133024] backdrop-blur-md transition-[background-color,box-shadow,border-color] duration-300 md:pl-5 ${
          scrolled || open
            ? "border-[#133024]/12 bg-[#fafcf7]/95 shadow-[0_14px_34px_-18px_rgba(19,48,36,0.45)]"
            : "border-[#133024]/8 bg-[#fafcf7]/75 shadow-[0_10px_28px_-20px_rgba(19,48,36,0.35)]"
        }`}
      >
        <a href="#top" className="flex min-h-11 shrink-0 items-center rounded-full" data-cursor="Home" aria-label="Aura Roast, back to top" onClick={() => setOpen(false)}>
          <Logo />
        </a>

        {/* laptop: links in page order; a soft pill slides to the section you are in */}
        <nav aria-label="Primary" className="hidden lg:block">
          <div ref={linksRef} className="relative flex items-center gap-0.5">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-[#2f7d4a]/12 transition-[transform,width,opacity] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
              style={{ width: pill?.w ?? 0, transform: `translateX(${pill?.x ?? 0}px)`, opacity: pill ? 1 : 0 }}
            />
            {nav.links.map((l) => {
              const isActive = active === l.href;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative inline-flex h-10 items-center rounded-full px-4 text-[14px] font-medium tracking-[0.01em] transition-colors duration-200 ${
                    isActive ? "text-[#133024]" : "text-[#133024]/70 hover:text-[#133024]"
                  }`}
                >
                  {l.label}
                </a>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          {status && (
            <span className="hidden items-center gap-2 pr-1 text-[13px] text-[#133024]/80 xl:inline-flex" title={hoursText}>
              <StatusDot open={status.open} />
              {status.text}
            </span>
          )}
          <a
            href={nav.cta.href}
            className="hidden h-11 items-center rounded-full bg-[#2f7d4a] px-5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#24683c] active:translate-y-px md:inline-flex"
          >
            {nav.cta.label}
          </a>
          <a
            ref={bagIcon}
            href={nav.cta.href}
            aria-label={`Bag, ${bag} ${bag === 1 ? "item" : "items"}`}
            className="bag-icon relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#133024]/15 transition-colors duration-200 hover:border-[#2f7d4a] hover:bg-[#2f7d4a]/8"
            data-cursor="Bag"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 8h14l-1.2 12H6.2L5 8Z M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span
              className={`bag-count absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-semibold transition-colors ${
                bag ? "bg-[#2f7d4a] text-white" : "bg-[#dfe9dc] text-[#133024]"
              }`}
            >
              {bag}
            </span>
          </a>
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
        className={`mt-2 origin-top rounded-[22px] border border-[#133024]/12 bg-[#fafcf7]/[0.97] p-3 text-[#133024] shadow-[0_24px_50px_-24px_rgba(19,48,36,0.5)] backdrop-blur-md transition-[opacity,transform,visibility] duration-300 lg:hidden ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <nav aria-label="Sections">
          <ul>
            {nav.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                  aria-current={active === l.href ? "location" : undefined}
                  className={`font-display flex min-h-12 items-center justify-between rounded-2xl px-4 text-[22px] transition-colors ${
                    active === l.href ? "bg-[#2f7d4a]/10" : "hover:bg-[#133024]/5"
                  }`}
                >
                  {l.label}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#2f7d4a]">
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
