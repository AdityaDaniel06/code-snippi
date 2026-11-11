"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { DEMO_SNIPPETS } from "@/lib/demo-snippets";
import { getLanguage } from "@/lib/languages";
import { highlight } from "@/lib/highlight";
import ViewToggle, { type View } from "@/components/view-toggle";

const ITEMS = DEMO_SNIPPETS.slice(0, 6);

export default function LibraryDemo() {
  const [view, setView] = useState<View>("grid");
  const listRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const change = (next: View) => {
    if (next === view) return;
    if (listRef.current) {
      flipState.current = Flip.getState(listRef.current.querySelectorAll("[data-flip]"));
    }
    setView(next);
  };

  useLayoutEffect(() => {
    gsap.registerPlugin(Flip);
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    Flip.from(state, {
      duration: 0.7,
      ease: "power3.inOut",
      stagger: 0.025,
      absolute: true,
      nested: true,
    });
  }, [view]);

  return (
    <div>
      <div className="mb-6">
        <ViewToggle view={view} onChange={change} label="Demo library view" />
      </div>
      <div
        ref={listRef}
        data-ui
        className={
          view === "grid" ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-2"
        }
      >
        {ITEMS.map((s) => {
          const l = getLanguage(s.language);
          const preview = s.code.split("\n").slice(0, view === "grid" ? 4 : 1);
          return (
            <div
              key={s.id}
              data-flip
              data-flip-id={`demo-${s.id}`}
              className={`min-w-0 overflow-hidden rounded-xl bg-surface-1 ${
                view === "grid" ? "p-4" : "flex items-center gap-4 px-4 py-3"
              }`}
            >
              <div className={view === "grid" ? "flex items-center justify-between gap-3" : "w-56 shrink-0"}>
                <p className="truncate text-sm font-semibold">{s.title}</p>
                {view === "grid" && (
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink-3">
                    <span className="swatch" style={{ background: l.color }} />
                    {l.label}
                  </span>
                )}
              </div>
              <pre
                className={`code-block overflow-hidden !text-xs ${
                  view === "grid"
                    ? "mt-3 h-[5.6rem] rounded-lg bg-[var(--code-bg)] p-3"
                    : "min-w-0 flex-1 truncate"
                }`}
              >
                {preview.map((line, i) => (
                  <span key={i} className="block truncate whitespace-pre">
                    {highlight(line, s.language) }
                  </span>
                ))}
              </pre>
              {view === "list" && (
                <span className="hidden shrink-0 items-center gap-1.5 text-xs text-ink-3 sm:flex">
                  <span className="swatch" style={{ background: l.color }} />
                  {l.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
