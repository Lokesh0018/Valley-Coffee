"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { onSiteReady } from "@/lib/loading";
import { nav } from "../content";
import { Logo } from "./Logo";

// the section pill: section id → the name it shows
const SECTIONS: [string, string][] = [
  ["top", "The café"],
  ["story", "From hill to cup"],
  ["origins", "Our beans"],
  ["roast", "The roast"],
  ["pour", "The pour"],
  ["menu", "The menu"],
  ["bakes", "Fresh bakes"],
  ["beans", "Take home"],
  ["stay", "Stay a while"],
  ["club", "Ember Club"],
  ["reviews", "Kind words"],
  ["visit", "Visit"],
];

// The café's hours in Hyderabad (24 h clock): [opens, closes] per weekday, Sunday first (matches nav.hours).
const HOURS: [number, number][] = [
  [8, 24],
  [7.5, 23],
  [7.5, 23],
  [7.5, 23],
  [7.5, 23],
  [7.5, 23],
  [8, 24],
];
const fmt = (h: number) => (h === 24 ? "midnight" : `${h % 12 === 0 ? 12 : Math.floor(h % 12)}${h % 1 ? ":30" : ""} ${h < 12 ? "am" : "pm"}`);

/** "Open now · till 11 pm" or "Closed · opens 7:30 am", from the real time in Hyderabad. */
function cafeStatus(now = new Date()): { open: boolean; text: string } {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const h = Number(get("hour")) + Number(get("minute")) / 60;
  const [o, c] = HOURS[day];
  if (h >= o && h < c) return { open: true, text: `Open now · till ${fmt(c)}` };
  const next = h < o ? o : HOURS[(day + 1) % 7][0];
  return { open: false, text: `Closed · opens ${fmt(next)}` };
}

export const BAG_EVENT = "ember:bag";

export default function MenuCardNav() {
  const [bag, setBag] = useState(0);
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);
  const [activeSection, setActiveSection] = useState("top");
  const bagIcon = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const tick = () => setStatus(cafeStatus());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Track active section for nav link highlighting
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let triggers: ScrollTrigger[] = [];
    const off = onSiteReady(() => {
      triggers = SECTIONS.map(([id]) => {
        const el = document.getElementById(id);
        return el
          ? ScrollTrigger.create({
              trigger: el,
              start: "top 45%",
              end: "bottom 45%",
              onToggle: (st) => st.isActive && setActiveSection(id),
            })
          : null;
      }).filter(Boolean) as ScrollTrigger[];
    });
    return () => {
      off();
      triggers.forEach((t) => t.kill());
    };
  }, []);

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

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-[clamp(10px,2vw,28px)] pt-[clamp(10px,1.6vw,20px)]">
      <div className="nav-bar relative flex items-center justify-between gap-3 rounded-[24px] border border-[#133024]/10 bg-[#fafcf7]/90 py-2 pl-4 pr-3 text-[#133024] shadow-[0_12px_32px_-16px_rgba(19,48,36,0.35)] backdrop-blur-md md:pl-5">
        <a href="#top" className="flex min-h-11 items-center rounded-full" data-cursor="Home" aria-label="Ember Roast, back to top">
          <Logo />
        </a>

        {/* Desktop / Tablet Navigation Items */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {nav.links.map((link) => {
            const linkId = link.href.replace("#", "");
            const isActive = activeSection === linkId;
            return (
              <a
                key={link.href}
                href={link.href}
                data-cursor={link.label}
                aria-current={isActive ? "page" : undefined}
                className={`relative px-3.5 py-1.5 text-[13.5px] font-medium tracking-[0.02em] transition-all duration-200 rounded-full ${
                  isActive
                    ? "text-[#133024] font-semibold bg-[#2f7d4a]/12"
                    : "text-[#133024]/75 hover:text-[#133024] hover:bg-[#133024]/5"
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 h-[3px] w-3 -translate-x-1/2 rounded-full bg-[#2f7d4a]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right side: status + bag */}
        <div className="flex items-center gap-2.5">
          {status && (
            <span className="hidden items-center gap-2 pr-2 text-[13px] text-[#133024]/85 xl:inline-flex">
              <span className={`live-dot h-2 w-2 rounded-full ${status.open ? "bg-[#3f9a5c]" : "bg-[#b9a27a]"}`} />
              {status.text}
            </span>
          )}

          {/* Quick mobile scroll menu for smaller devices */}
          <div className="flex md:hidden items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-[190px] xs:max-w-[240px]">
            {nav.links.slice(0, 4).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap px-2.5 py-1 text-[12px] font-medium text-[#133024]/80 hover:text-[#133024] hover:bg-[#133024]/5 rounded-full"
              >
                {link.label}
              </a>
            ))}
          </div>

          <a
            ref={bagIcon}
            href="#beans"
            aria-label={`Bag, ${bag} items`}
            className="bag-icon relative grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full border border-[#133024]/15 hover:border-[#2f7d4a] hover:bg-[#2f7d4a]/5 transition-colors"
            data-cursor="Bag"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 8h14l-1.2 12H6.2L5 8Z M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span className="bag-count absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#2f7d4a] px-1 text-[11px] font-semibold text-[#fafcf7]">{bag}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
