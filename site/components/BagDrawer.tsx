"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cart as copy, contact } from "../content";
import { useCart, type CartItem } from "../cart";

// The bag: a cream drawer that slides in from the right over a soft green veil. Items with a +/− stepper, the
// subtotal, a free-delivery meter and "Order on WhatsApp", which opens WhatsApp with the order written out (the
// same approach as the contact form: nothing is sent until you press send there).
// Escape, the veil or the close button close it; focus moves into the drawer on open and back to the bag icon after.
// Page scroll (Lenis) is paused while it is open; the list scrolls on its own (data-lenis-prevent).

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function orderText(items: CartItem[], subtotal: number) {
  const lines = ["Hi Aura Roast! I'd like to order:"];
  items.forEach((i) => lines.push(`• ${i.qty} × ${i.name}${i.variant ? ` (${i.kind === "beans" ? `250 g, ${i.variant}` : i.variant})` : ""} – ${inr(i.price * i.qty)}`));
  lines.push(`Total: ${inr(subtotal)}`, "Pick-up at the café, please.");
  return lines.join("\n");
}

function Thumb({ item }: { item: CartItem }) {
  if (item.kind === "bake" && item.image)
    return (
      <span className="arch block h-[72px] w-[58px] shrink-0 overflow-hidden bg-[#edf4ea]">
        <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
      </span>
    );
  // a tiny kraft bag with the lot's label colour
  return (
    <span className="block h-[72px] w-[58px] shrink-0" aria-hidden>
      <svg viewBox="0 0 58 72" className="h-full w-full">
        <path d="M9 14h40l3 52a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4l3-52Z" fill="#c8a57a" />
        <path d="M9 14h40l-2 6H11l-2-6Z" fill="#b48f66" />
        <rect x="14" y="30" width="30" height="26" rx="3" fill={item.label ?? "#f4e9d8"} />
        <text x="29" y="46" textAnchor="middle" fontSize="7" fontWeight="600" fill={item.ink ?? "#2a1a10"} fontFamily="var(--font-body-family), sans-serif">
          {item.name.split(" ")[0]}
        </text>
      </svg>
    </span>
  );
}

export default function BagDrawer() {
  const cart = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // open / close: slide + veil; page scroll locked (Lenis stopped) while open
  useEffect(() => {
    const el = root.current!;
    const p = panel.current!;
    const v = veil.current!;
    const quick = prefersReducedMotion();
    if (cart.open) {
      wasOpen.current = true;
      el.style.visibility = "visible";
      window.__lenis?.stop();
      document.documentElement.classList.add("bag-open");
      gsap.killTweensOf([p, v]);
      gsap.fromTo(v, { opacity: 0 }, { opacity: 1, duration: quick ? 0 : 0.5, ease: "power2.out" });
      gsap.fromTo(p, { x: "104%" }, { x: "0%", duration: quick ? 0 : 0.7, ease: "power3.out" });
      if (!quick) gsap.fromTo(p.querySelectorAll(".bag-row-in"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, delay: 0.2, ease: "power2.out" });
      const t = setTimeout(() => p.focus({ preventScroll: true }), 50);
      return () => clearTimeout(t);
    }
    if (wasOpen.current) {
      window.__lenis?.start();
      document.documentElement.classList.remove("bag-open");
      gsap.killTweensOf([p, v]);
      gsap.to(v, { opacity: 0, duration: quick ? 0 : 0.4, ease: "power2.in" });
      gsap.to(p, {
        x: "104%",
        duration: quick ? 0 : 0.5,
        ease: "power3.in",
        onComplete: () => {
          el.style.visibility = "hidden";
        },
      });
      document.querySelector<HTMLElement>(".bag-icon")?.focus({ preventScroll: true });
    }
  }, [cart.open]);

  // Escape closes
  useEffect(() => {
    if (!cart.open) return;
    const close = cart.setOpen;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cart.open, cart.setOpen]);

  // the row just added or changed glows for a moment
  useEffect(() => {
    if (!cart.open || !cart.last || prefersReducedMotion()) return;
    const row = list.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(cart.last)}"]`);
    if (row) gsap.fromTo(row, { backgroundColor: "rgba(47,125,74,0.14)" }, { backgroundColor: "rgba(47,125,74,0)", duration: 1.2, ease: "power2.out" });
  }, [cart.items, cart.open, cart.last]);

  const toGo = Math.max(0, copy.free - cart.subtotal);
  const wa = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(orderText(cart.items, cart.subtotal))}`;

  return (
    <div ref={root} className="bag-drawer fixed inset-0 z-[60]" style={{ visibility: "hidden" }} aria-hidden={!cart.open}>
      <div ref={veil} className="absolute inset-0 bg-[#133024]/45 backdrop-blur-[2px]" onClick={() => cart.setOpen(false)} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        tabIndex={-1}
        data-lenis-prevent
        className="paper absolute inset-y-0 right-0 flex w-[min(100vw,460px)] flex-col bg-[#fafcf7] text-[#133024] shadow-[-30px_0_80px_-30px_rgba(19,48,36,0.5)] outline-none max-sm:inset-y-2 max-sm:right-2 max-sm:w-[calc(100vw-16px)] max-sm:rounded-[26px] sm:my-3 sm:mr-3 sm:rounded-[30px]"
      >
        {/* head */}
        <div className="bag-row-in flex items-start justify-between gap-4 px-6 pb-4 pt-6 sm:px-8">
          <div>
            <p className="eyebrow">{cart.count ? `${cart.count} ${cart.count === 1 ? "item" : "items"}` : "Bag"}</p>
            <h2 className="mt-2 font-display text-[clamp(34px,4vw,46px)]">
              {copy.title[0]} <span className="highlight">{copy.title[1].replace(/\*/g, "")}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => cart.setOpen(false)}
            aria-label="Close the bag"
            className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-[#133024]/15 transition-colors duration-200 hover:border-[#2f7d4a] hover:bg-[#2f7d4a]/8"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* items */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 sm:px-8" data-lenis-prevent>
          {cart.items.length === 0 ? (
            <div className="bag-row-in flex h-full flex-col items-start justify-center gap-3 pb-10">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#2f7d4a]">
                <path d="M5 8h14l-1.2 12H6.2L5 8Z M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
              <p className="font-display text-[26px]">{copy.empty.title}</p>
              <p className="max-w-[30ch] text-[15px] text-muted">{copy.empty.text}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {copy.empty.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => cart.setOpen(false)}
                    className="inline-flex min-h-11 items-center rounded-full border border-[#24683c]/35 px-5 text-[14px] font-semibold text-[#24683c] transition-colors duration-200 hover:border-[#24683c] hover:bg-[#edf4ea]"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <ul ref={list} className="divide-y divide-line">
              {cart.items.map((i) => (
                <li key={i.id} data-id={i.id} className="bag-row-in -mx-3 flex items-center gap-4 rounded-2xl px-3 py-4">
                  <Thumb item={i} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[20px] leading-tight">{i.name}</p>
                    <p className="mt-0.5 text-[13px] text-muted">{i.kind === "beans" ? `250 g · ${i.variant}` : i.variant}</p>
                    <div className="mt-2 inline-flex items-center rounded-full border border-line" role="group" aria-label={`Quantity of ${i.name}`}>
                      <button
                        type="button"
                        onClick={() => cart.setQty(i.id, i.qty - 1)}
                        aria-label={i.qty === 1 ? `Remove ${i.name}` : `One less ${i.name}`}
                        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors duration-200 hover:bg-[#edf4ea]"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          {i.qty === 1 ? (
                            <path d="M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V4h6v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          ) : (
                            <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          )}
                        </svg>
                      </button>
                      <span className="min-w-6 text-center text-[14px] font-semibold tabular-nums" aria-live="polite">
                        {i.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => cart.setQty(i.id, i.qty + 1)}
                        aria-label={`One more ${i.name}`}
                        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors duration-200 hover:bg-[#edf4ea]"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 text-right text-[16px] font-semibold tabular-nums text-[#24683c]">{inr(i.price * i.qty)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* foot */}
        {cart.items.length > 0 && (
          <div className="bag-row-in border-t border-line px-6 pb-6 pt-4 sm:px-8">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] text-muted">Subtotal</span>
              <span className="font-display text-[28px] tabular-nums">{inr(cart.subtotal)}</span>
            </div>
            <p className="mt-1 text-[13px] text-muted">{copy.pickup}</p>
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#dde9da]">
                <div className="h-full rounded-full bg-[#2f7d4a] transition-[width] duration-700 ease-out" style={{ width: `${Math.min(100, (cart.subtotal / copy.free) * 100)}%` }} />
              </div>
              <p className="mt-1.5 text-[12px] text-muted">{toGo > 0 ? `Add ${inr(toGo)} more for free delivery in Visakhapatnam` : "Free delivery in Visakhapatnam unlocked"}</p>
            </div>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#133024] px-6 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#24683c]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8Zm-3.3 4.4c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.1-1.4l-.5-.3-2-1c-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1a6.7 6.7 0 0 1-3.4-3c-.3-.4.2-.4.7-1.4.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6Z" />
              </svg>
              {copy.button}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <div className="mt-3 flex items-start justify-between gap-4">
              <p className="text-[12px] leading-relaxed text-muted">{copy.fine}</p>
              <button type="button" onClick={cart.clear} className="shrink-0 cursor-pointer text-[12px] text-muted underline-offset-4 transition-colors duration-200 hover:text-[#133024] hover:underline">
                {copy.clear}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
