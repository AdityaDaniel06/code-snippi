"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroDemo from "@/components/landing/hero-demo";
import SaveDemo from "@/components/landing/save-demo";
import LibraryDemo from "@/components/landing/library-demo";
import { ArrowRightIcon } from "@/components/icons";
import { LANGUAGES, getLanguage } from "@/lib/languages";
import { DEMO_SNIPPETS } from "@/lib/demo-snippets";
import { highlight } from "@/lib/highlight";

const PROOF = [DEMO_SNIPPETS[3], DEMO_SNIPPETS[1], DEMO_SNIPPETS[6]];

const LANG_ROW_A = LANGUAGES.slice(1, 10);
const LANG_ROW_B = [...LANGUAGES.slice(10), LANGUAGES[0]];

const PRIVACY_FACTS = [
  {
    term: "Private by default",
    detail:
      "Every snippet belongs to your account. There is no public feed: nobody else can open a snippet unless you share it with a specific Snippi user, as view-only or editable.",
  },
  {
    term: "Signed sessions",
    detail:
      "You stay signed in through a signed, httpOnly cookie that expires after seven days. Scripts on the page can't read it.",
  },
  {
    term: "Hashed passwords",
    detail: "Passwords are hashed with bcrypt before they are stored. Nobody can read yours back.",
  },
];

function LangRow({ items, rowClass }: { items: typeof LANGUAGES; rowClass: string }) {
  // Two copies so the row never runs out while it travels.
  const doubled = [...items, ...items];
  return (
    <div className={`${rowClass} flex w-max gap-[0.45em] whitespace-nowrap will-change-transform`}>
      {doubled.map((l, i) => (
        <span key={`${l.id}-${i}`} className="flex items-center gap-[0.22em]">
          <span
            className="inline-block h-[0.22em] w-[0.22em] rounded-[0.04em]"
            style={{ background: l.color }}
          />
          {l.label}
        </span>
      ))}
    </div>
  );
}

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero: lines rise out of their masks, then the rest follows.
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .from(".hero-line > span", { yPercent: 110, duration: 1.2, stagger: 0.09 })
        .from(".hero-sub", { y: 20, opacity: 0, duration: 0.9 }, "-=0.85")
        .from(".hero-cta > *", { y: 16, opacity: 0, duration: 0.8, stagger: 0.07 }, "-=0.75")
        .from(".hero-window-inner", { y: 80, opacity: 0, duration: 1.4 }, "-=0.7");

      // Hero window: tilted back, flattens as it scrolls into place.
      gsap.fromTo(
        ".hero-window",
        { rotateX: 18, scale: 0.94, transformPerspective: 1800, transformOrigin: "50% 0%" },
        {
          rotateX: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-window",
            start: "top 85%",
            end: "top 20%",
            scrub: 0.5,
          },
        }
      );

      // Section entrances: content is always visible; heading, text and fragment
      // only settle up into place, staggered. No opacity gate, so nothing can be
      // left blank if a trigger fires late.
      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        gsap.from(group.querySelectorAll("[data-reveal]"), {
          y: 36,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: group, start: "top 85%", once: true },
        });
      });

      // Fonts and the demos change the page height after mount; re-measure.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      const late = window.setTimeout(() => ScrollTrigger.refresh(), 1200);

      // Language wall: two rows travel in opposite directions with the scroll.
      gsap.fromTo(
        ".lang-row-a",
        { xPercent: 0 },
        {
          xPercent: -30,
          ease: "none",
          scrollTrigger: { trigger: ".lang-wall", start: "top bottom", end: "bottom top", scrub: 0.4 },
        }
      );
      gsap.fromTo(
        ".lang-row-b",
        { xPercent: -30 },
        {
          xPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: ".lang-wall", start: "top bottom", end: "bottom top", scrub: 0.4 },
        }
      );

      // Footer wordmark rises as the page ends.
      gsap.from(".footer-mark", {
        yPercent: 40,
        ease: "none",
        scrollTrigger: { trigger: ".footer-mark", start: "top bottom", end: "bottom bottom", scrub: 0.5 },
      });

      return () => window.clearTimeout(late);
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={root}>
      {/* ---------- Hero ---------- */}
      <section className="container-page pb-12 pt-14 sm:pt-20 lg:pb-16">
        <h1 className="display text-[clamp(2.9rem,7.4vw,6rem)]">
          <span className="hero-line block overflow-hidden pb-[0.08em]">
            <span className="block">Stop rewriting</span>
          </span>
          <span className="hero-line -mt-[0.08em] block overflow-hidden pb-[0.08em]">
            <span className="block">the same code.</span>
          </span>
        </h1>

        <div className="mt-8 lg:mt-10">
          <p className="hero-sub max-w-[36rem] text-lg leading-relaxed text-ink [text-wrap:pretty]">
            Snippi is a private library for the SQL, configs and helpers you reuse. Save a snippet
            once, find it in a keystroke, copy it and get back to work.
          </p>
          <div className="hero-cta mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className="btn btn-primary btn-lg group">
              Create your library
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Sign in
            </Link>
          </div>
        </div>

        <div className="hero-window mt-14 lg:mt-20">
          <div className="hero-window-inner">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* ---------- Save ---------- */}
      <section className="container-page py-20 lg:py-28" data-reveal-group>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5 lg:pt-6">
            <h2 data-reveal className="h-section text-[clamp(2.25rem,4.6vw,4rem)]">
              Paste it once.
            </h2>
            <p data-reveal className="mt-6 max-w-[30rem] text-lg leading-relaxed">
              Give it a title, pick the language and paste. It lands in your library with full
              highlighting, ready the next time that problem comes back.
            </p>
            <p data-reveal className="mt-4 max-w-[30rem] text-base leading-relaxed">
              Indenting, brackets and multi-cursor editing behave the way your hands expect, and
              Ctrl+S saves.
            </p>
          </div>
          <div data-reveal className="lg:col-span-7">
            <SaveDemo />
          </div>
        </div>
      </section>

      {/* ---------- Languages ---------- */}
      <section className="py-20 lg:py-28">
        <div className="container-page" data-reveal-group>
          <h2 data-reveal className="h-section max-w-[18ch] text-[clamp(2.25rem,4.6vw,4rem)]">
            Nineteen languages, all highlighted.
          </h2>
        </div>
        <div
          className="lang-wall mt-14 select-none overflow-hidden text-[clamp(2.9rem,7.4vw,6rem)] font-semibold leading-[1.12] tracking-[-0.04em]"
          aria-label={`Supported languages: ${LANGUAGES.map((l) => l.label).join(", ")}`}
          role="img"
        >
          <LangRow items={LANG_ROW_A} rowClass="lang-row-a" />
          <LangRow items={LANG_ROW_B} rowClass="lang-row-b text-ink-3" />
        </div>

        <div className="container-page mt-16 grid gap-3 md:grid-cols-2 lg:grid-cols-12" data-reveal-group>
          {PROOF.map((s, i) => (
            <figure
              key={s.id}
              data-reveal
              data-ui
              className={`min-w-0 rounded-xl bg-surface-1 p-5 ${["lg:col-span-5", "lg:col-span-4", "md:col-span-2 lg:col-span-3"][i]}`}
            >
              <figcaption className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">{s.title}</span>
                <span className="flex shrink-0 items-center gap-1.5 text-ink-2">
                  <span className="swatch" style={{ background: getLanguage(s.language).color }} />
                  {getLanguage(s.language).label}
                </span>
              </figcaption>
              <pre className="code-block mt-4 overflow-x-auto rounded-lg bg-[var(--code-bg)] p-4 !text-xs">
                <code>{highlight(s.code, s.language)}</code>
              </pre>
            </figure>
          ))}
        </div>
        <div className="container-page mt-8" data-reveal-group>
          <p data-reveal className="max-w-[40rem] text-lg leading-relaxed">
            Open a snippet and it is shown in Monaco, the editor inside VS Code, so it reads the way it
            does in your IDE.
          </p>
        </div>
      </section>

      {/* ---------- Library views ---------- */}
      <section className="container-page py-20 lg:py-28" data-reveal-group>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4 xl:col-span-4">
            <h2 data-reveal className="h-section text-[clamp(2.25rem,4.6vw,4rem)]">
              Browse or hunt.
            </h2>
            <p data-reveal className="mt-6 max-w-[28rem] text-lg leading-relaxed">
              Cards show the first lines of each snippet so you recognise it by shape. The list
              packs more onto the screen when you know what you&apos;re after. Snippi remembers
              which one you like.
            </p>
          </div>
          <div data-reveal className="lg:col-span-8">
            <LibraryDemo />
          </div>
        </div>
      </section>

      {/* ---------- Private ---------- */}
      <section className="bg-surface-1 py-20 lg:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16" data-reveal-group>
          <div className="lg:col-span-5">
            <h2 data-reveal className="h-section text-[clamp(2.25rem,4.6vw,4rem)]">
              Yours, and only yours.
            </h2>
            <p data-reveal className="mt-6 max-w-[28rem] text-lg leading-relaxed">
              A snippet library fills up with internal queries, keys you meant to rotate and code
              from work. Snippi keeps all of it behind your sign-in.
            </p>
          </div>
          <dl className="grid gap-10 lg:col-span-6 lg:col-start-7 lg:pt-20">
            {PRIVACY_FACTS.map((f) => (
              <div key={f.term} data-reveal>
                <dt className="text-lg font-semibold tracking-[-0.02em]">{f.term}</dt>
                <dd className="mt-2 max-w-[34rem] text-base leading-relaxed">{f.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Close ---------- */}
      <section className="container-page pb-20 pt-24 lg:pb-28 lg:pt-32" data-reveal-group>
        <div className="flex flex-col items-center gap-10 text-center">
          <h2 data-reveal className="display text-[clamp(2.9rem,7.4vw,6rem)]">
            Start your library today.
          </h2>
          <div data-reveal className="flex flex-col items-center gap-4">
            <Link href="/register" className="btn btn-primary btn-lg group">
              Create your library
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <p className="text-sm text-ink-2">Free. Takes under a minute.</p>
          </div>
        </div>
      </section>

      <footer className="overflow-hidden">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-ink-2">
          <p>Snippi, a private snippet library.</p>
          <nav aria-label="Footer" className="flex gap-6">
            <Link href="/login" className="transition-colors hover:text-ink">
              Sign in
            </Link>
            <Link href="/register" className="transition-colors hover:text-ink">
              Create account
            </Link>
          </nav>
        </div>
        <div
          aria-hidden
          className="footer-mark container-page select-none text-[23vw] font-semibold leading-[0.78] tracking-[-0.04em] text-ink"
        >
          Snippi
        </div>
      </footer>
    </div>
  );
}
