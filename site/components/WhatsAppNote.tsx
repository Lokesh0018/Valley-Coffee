"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { contact } from "../content";
import Lines from "./Lines";
import TornEdge from "./TornEdge";
import { LogoMark } from "./Logo";

// Contact: a note to the café that opens in WhatsApp (wa.me link with the text filled in). Left: a chat preview;
// right: the form. Motion map M21 typewriter: when the section comes on screen the chat bubble types a sample
// note by itself, the café's "typing…" dots show and a reply lands (plays on every arrival, for filming).
// As soon as the visitor fills the form, the bubble shows their real note live instead.
// Phone: form first, chat below. ?static=1: the sample note and reply are shown in full.

type Topic = (typeof contact.topics)[number]["id"];

const fmtDate = (v: string) =>
  v ? new Date(`${v}T00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "";

function buildNote(f: { topic: Topic; name: string; date: string; time: string; guests: number; message: string }) {
  const topic = contact.topics.find((t) => t.id === f.topic)!;
  const lines = [`Hi Aura Roast${f.name.trim() ? `, this is ${f.name.trim()}` : ""}.`];
  if (f.topic === "table") {
    const when = [fmtDate(f.date), f.time && `at ${f.time}`].filter(Boolean).join(" ");
    lines.push(`I'd like to book a table for ${f.guests}${when ? `, ${when}` : ""}.`);
  } else {
    lines.push(`About: ${topic.label.toLowerCase()}.`);
  }
  if (f.message.trim()) lines.push(f.message.trim());
  return lines.join("\n");
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function WhatsAppNote() {
  const root = useRef<HTMLElement>(null);
  const id = useId();
  const [topic, setTopic] = useState<Topic>("table");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(contact.times[1]);
  const [guests, setGuests] = useState(2);
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false); // the visitor has started filling the form
  const [error, setError] = useState(false);
  const [minDate, setMinDate] = useState<string>();

  // the sample note the bubble types (M21) until the visitor writes their own
  const [typed, setTyped] = useState(contact.sample);
  const [phase, setPhase] = useState<"typing" | "sent" | "reply">("reply");

  const note = useMemo(() => buildNote({ topic, name, date, time, guests, message }), [topic, name, date, time, guests, message]);
  const current = contact.topics.find((t) => t.id === topic)!;

  useEffect(() => setMinDate(today()), []);

  useEffect(() => {
    if (touched || prefersReducedMotion()) return;
    const el = root.current!;
    // start blank so the note visibly types itself on arrival
    setTyped("");
    setPhase("typing");
    let tl: gsap.core.Timeline | undefined;
    const play = () => {
      tl?.kill();
      const s = { n: 0 };
      setTyped("");
      setPhase("typing");
      tl = gsap
        .timeline()
        .to(s, {
          n: contact.sample.length,
          duration: contact.sample.length * 0.032,
          ease: "none",
          delay: 0.3,
          onUpdate: () => setTyped(contact.sample.slice(0, Math.round(s.n))),
        })
        .call(() => setPhase("sent"))
        .call(() => setPhase("reply"), [], "+=1.3");
    };
    const st = ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 20%", onEnter: play, onEnterBack: play });
    return () => {
      st.kill();
      tl?.kill();
    };
  }, [touched]);

  const edit = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setTouched(true);
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(true);
      (document.getElementById(`${id}-name`) as HTMLInputElement | null)?.focus();
      return;
    }
    const url = `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(note)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shown = touched ? note : typed;
  const showReply = !touched && phase === "reply";

  return (
    <section
      ref={root}
      id="contact"
      data-record-time="1.1"
      data-record-hold="1"
      data-record-align="center"
      data-record-label="Contact"
      className="contact paper relative z-[3] pb-[clamp(90px,13vh,150px)] pt-[clamp(80px,11vh,130px)]"
    >
      <TornEdge color="#edf4ea" seed={37} />
      <div className="container-x grid items-start gap-12 lg:grid-cols-12 lg:gap-8">
        {/* heading + chat preview */}
        <div className="lg:col-span-5">
          <p className="eyebrow mb-6 uppercase">{contact.eyebrow}</p>
          <Lines lines={contact.title} className="text-[clamp(44px,5vw,88px)]" />
          <p className="mt-6 max-w-[42ch] text-[17px] leading-relaxed text-muted">{contact.intro}</p>

          <div className="wa-chat mt-10 overflow-hidden rounded-[26px] bg-[#fafcf7] shadow-[0_30px_60px_-30px_rgba(19,48,36,0.45)] ring-1 ring-[#133024]/10 max-lg:hidden" aria-hidden>
            <ChatHead />
            <div className="wa-wall flex min-h-[260px] flex-col gap-3 px-5 py-6">
              <p className="mx-auto rounded-full bg-[#133024]/[0.06] px-3 py-1 text-[12px] font-medium tracking-[0.06em] text-[#4f6657]">Today</p>
              <Bubble text={shown} caret={!touched && phase === "typing"} />
              <div className={`wa-in self-start transition-all duration-500 ${!touched && phase === "sent" ? "translate-y-0 opacity-100" : "pointer-events-none h-0 translate-y-2 opacity-0"}`}>
                <span className="wa-dots inline-flex gap-1 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm">
                  <i /> <i /> <i />
                </span>
              </div>
              <div className={`wa-reply max-w-[80%] self-start rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[15px] leading-snug text-[#133024] shadow-sm transition-all duration-500 ${showReply ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                We&apos;d love to have you. Window seat saved, see you Saturday.
                <span className="ml-2 align-bottom text-[11px] text-[#4f6657]">10:02</span>
              </div>
            </div>
          </div>
        </div>

        {/* the form */}
        <form onSubmit={send} noValidate className="contact-card rounded-[30px] bg-white p-[clamp(22px,3vw,44px)] shadow-[0_40px_80px_-40px_rgba(19,48,36,0.35)] ring-1 ring-[#133024]/[0.08] lg:col-span-6 lg:col-start-7">
          <fieldset>
            <legend className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#4f6657]">What&apos;s it about?</legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {contact.topics.map((t) => (
                <label key={t.id} className="contact-chip cursor-pointer">
                  <input type="radio" name="topic" value={t.id} checked={topic === t.id} onChange={() => edit(setTopic)(t.id)} className="peer sr-only" />
                  <span className="inline-flex min-h-11 items-center rounded-full border border-[#133024]/20 px-4 text-[15px] transition-colors duration-200 peer-checked:border-[#133024] peer-checked:bg-[#133024] peer-checked:text-[#fafcf7] peer-focus-visible:ring-2 peer-focus-visible:ring-[#2f7d4a] peer-focus-visible:ring-offset-2 hover:border-[#133024]/50">
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-8">
            <label htmlFor={`${id}-name`} className="contact-label">
              Your name
            </label>
            <input
              id={`${id}-name`}
              value={name}
              onChange={(e) => {
                edit(setName)(e.target.value);
                if (e.target.value.trim()) setError(false);
              }}
              autoComplete="given-name"
              placeholder="Meera"
              aria-invalid={error}
              aria-describedby={error ? `${id}-name-err` : undefined}
              className="contact-input"
            />
            {error && (
              <p id={`${id}-name-err`} className="mt-2 text-[14px] text-[#a3331f]" role="alert">
                Add your name so we know who&apos;s writing.
              </p>
            )}
          </div>

          {topic === "table" && (
            <div className="mt-6 grid gap-6 sm:grid-cols-[1.2fr_1fr_auto]">
              <div>
                <label htmlFor={`${id}-date`} className="contact-label">
                  Date
                </label>
                <input id={`${id}-date`} type="date" min={minDate} value={date} onChange={(e) => edit(setDate)(e.target.value)} className="contact-input" />
              </div>
              <div>
                <label htmlFor={`${id}-time`} className="contact-label">
                  Time
                </label>
                <select id={`${id}-time`} value={time} onChange={(e) => edit(setTime)(e.target.value)} className="contact-input cursor-pointer">
                  {contact.times.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <span id={`${id}-guests`} className="contact-label">
                  Guests
                </span>
                <div role="group" aria-labelledby={`${id}-guests`} className="flex h-[52px] items-center rounded-full border border-[#133024]/20">
                  <button type="button" aria-label="One guest fewer" disabled={guests <= 1} onClick={() => edit(setGuests)(Math.max(1, guests - 1))} className="contact-step">
                    −
                  </button>
                  <span className="w-8 text-center text-[17px] tabular-nums" aria-live="polite">
                    {guests}
                  </span>
                  <button type="button" aria-label="One more guest" disabled={guests >= 12} onClick={() => edit(setGuests)(Math.min(12, guests + 1))} className="contact-step">
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <label htmlFor={`${id}-msg`} className="contact-label">
              Your note <span className="font-normal normal-case tracking-normal text-[#4f6657]">(optional)</span>
            </label>
            <textarea id={`${id}-msg`} rows={4} value={message} onChange={(e) => edit(setMessage)(e.target.value)} placeholder={current.placeholder} className="contact-input resize-none py-4 leading-relaxed" />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <button type="submit" className="wa-send group inline-flex min-h-[54px] cursor-pointer items-center gap-3 rounded-full bg-[#133024] pl-6 pr-2 text-[15px] font-medium text-[#fafcf7] transition-colors duration-200 hover:bg-[#2f7d4a]">
              {contact.button}
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#8fe3a8] text-[#133024] transition-transform duration-300 group-hover:translate-x-0.5">
                <ChatIcon />
              </span>
            </button>
            <p className="max-w-[30ch] text-[13px] leading-snug text-[#4f6657] max-md:text-[14px]">{contact.fine}</p>
          </div>

          {/* phone: the live preview sits under the form */}
          <div className="mt-8 overflow-hidden rounded-[22px] bg-[#fafcf7] ring-1 ring-[#133024]/10 lg:hidden" aria-hidden>
            <ChatHead small />
            <div className="wa-wall flex flex-col px-4 py-5">
              <Bubble text={shown} caret={!touched && phase === "typing"} />
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

function ChatHead({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-3 bg-[#133024] px-5 py-4 text-[#eef5ec]">
      <span className={`grid place-items-center rounded-full bg-[#f4ebdd] ${small ? "h-9 w-9" : "h-11 w-11"}`}>
        <LogoMark className={`${small ? "h-6 w-6" : "h-7 w-7"} text-[#15542d]`} />
      </span>
      <span className="min-w-0">
        <span className="block text-[16px] font-medium leading-tight">Aura Roast</span>
        <span className="flex items-center gap-1.5 text-[12px] text-[#a9c4b1]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8fe3a8]" />
          {contact.replies}
        </span>
      </span>
    </div>
  );
}

function Bubble({ text, caret }: { text: string; caret: boolean }) {
  return (
    <div className="wa-out max-w-[86%] self-end whitespace-pre-line rounded-2xl rounded-tr-md bg-[#d6f2cf] px-4 py-3 text-[15px] leading-snug text-[#133024] shadow-sm">
      {text || " "}
      {caret && <span className="wa-caret ml-px inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-[#133024]" />}
      <span className="ml-2 inline-flex items-center gap-1 align-bottom text-[11px] text-[#4f6657]">
        10:01
        <svg viewBox="0 0 18 12" className="h-3 w-[18px]" fill="none" stroke="#2f7d4a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 6.5 4.5 10 11 2.5M7.5 9.5 8 10l6.5-7.5" />
        </svg>
      </span>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.5 11.6a8.4 8.4 0 0 1-12.3 7.5L3.5 20.5l1.4-4.6a8.4 8.4 0 1 1 15.6-4.3Z" />
      <path d="M9.4 8.6c.2 2.6 3.2 5.7 5.9 6" />
    </svg>
  );
}
