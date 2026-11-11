"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { DEMO_SNIPPETS } from "@/lib/demo-snippets";
import { getLanguage } from "@/lib/languages";
import { highlight } from "@/lib/highlight";
import { CheckIcon, CopyIcon, SearchIcon, SnippiMark } from "@/components/icons";

const AUTO_QUERY = "revenue";

function matches(q: string, s: (typeof DEMO_SNIPPETS)[number]) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    s.title.toLowerCase().includes(needle) ||
    getLanguage(s.language).label.toLowerCase().includes(needle) ||
    s.code.toLowerCase().includes(needle)
  );
}

/**
 * A working miniature of the Snippi library: type to filter, arrow keys to
 * move, Enter or the button to copy. Built from the real app's vocabulary.
 */
export default function HeroDemo() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(DEMO_SNIPPETS[1].id);
  const [copied, setCopied] = useState(false);
  const touched = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => DEMO_SNIPPETS.filter((s) => matches(query, s)), [query]);
  const selected = results.find((s) => s.id === selectedId) ?? results[0];

  // Keep the selection inside the filtered set.
  useEffect(() => {
    if (results.length && !results.some((s) => s.id === selectedId)) {
      setSelectedId(results[0].id);
    }
  }, [results, selectedId]);

  // One demonstration: type a query once, unless the visitor got there first.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Type the query, hold on the match, then erase back to the full library
    // so the window rests with every snippet listed and the match selected.
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const erase = () => {
      if (touched.current) return;
      i -= 1;
      setQuery(AUTO_QUERY.slice(0, i));
      if (i > 0) timer = setTimeout(erase, 45);
    };
    const step = () => {
      if (touched.current) return;
      i += 1;
      setQuery(AUTO_QUERY.slice(0, i));
      if (i < AUTO_QUERY.length) timer = setTimeout(step, 85 + Math.random() * 60);
      else timer = setTimeout(erase, 1800);
    };
    timer = setTimeout(step, 2200);
    return () => clearTimeout(timer);
  }, []);

  // "/" focuses search, like the real library.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || t.closest("input, textarea, [contenteditable]")) return;
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return;
      e.preventDefault();
      touched.current = true;
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The code pane swaps with a short masked rise, line by line.
  useEffect(() => {
    const el = codeRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lines = el.querySelectorAll("[data-line]");
    const tween = gsap.fromTo(
      lines,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.38, ease: "power3.out", stagger: 0.018 }
    );
    return () => {
      tween.kill();
    };
  }, [selected?.id]);

  const copy = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.code);
    } catch {
      /* clipboard unavailable: still show the state change */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    const idx = results.findIndex((s) => s.id === selected?.id);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedId(results[Math.min(idx + 1, results.length - 1)].id);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedId(results[Math.max(idx - 1, 0)].id);
    } else if (e.key === "Enter") {
      e.preventDefault();
      copy();
    }
  };

  const lang = selected ? getLanguage(selected.language) : null;
  const lines = selected ? selected.code.split("\n") : [];

  return (
    <div
      ref={rootRef}
      data-ui
      className="overflow-hidden rounded-xl border border-[var(--line-strong)] bg-surface-1 text-left [box-shadow:var(--shadow-float)]"
    >
      {/* App bar */}
      <div className="flex h-12 items-center justify-between gap-4 border-b border-[var(--line)] px-4">
        <div className="flex items-center gap-2.5">
          <SnippiMark className="h-5 w-5" />
          <span className="text-sm font-semibold">Library</span>
          <span className="tabular text-sm text-ink-3">{DEMO_SNIPPETS.length} snippets</span>
        </div>
        <span className="hidden text-xs text-ink-3 sm:block">Try it: type, use the arrow keys, press Enter to copy</span>
      </div>

      <div className="grid md:grid-cols-[minmax(260px,340px)_1fr]">
        {/* Search + results */}
        <div className="border-b border-[var(--line)] md:border-b-0 md:border-r">
          <label className="relative block border-b border-[var(--line)]">
            <span className="sr-only">Search demo snippets</span>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                touched.current = true;
                setQuery(e.target.value);
              }}
              onFocus={() => (touched.current = true)}
              onKeyDown={onInputKey}
              placeholder="Search snippets"
              className="h-12 w-full bg-transparent pl-11 pr-12 text-[15px] text-ink outline-none placeholder:text-ink-3"
              aria-controls="hero-demo-results"
            />
            <span className="kbd absolute right-4 top-1/2 -translate-y-1/2" aria-hidden>
              /
            </span>
          </label>

          <ul
            id="hero-demo-results"
            role="listbox"
            aria-label="Demo snippets"
            className="max-h-[232px] overflow-y-auto p-1.5 md:max-h-[388px]"
          >
            {results.map((s) => {
              const active = s.id === selected?.id;
              const l = getLanguage(s.language);
              return (
                <li key={s.id} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      touched.current = true;
                      setSelectedId(s.id);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ${
                      active ? "bg-[var(--accent-soft)]" : "hover:bg-surface-2"
                    }`}
                  >
                    <span className="swatch" style={{ background: l.color }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{s.title}</span>
                      <span className={`block text-xs ${active ? "text-ink-2" : "text-ink-3"}`}>
                        {l.label} · {s.updated}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            {results.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-ink-2">
                Nothing matches &ldquo;{query}&rdquo;.
              </li>
            )}
          </ul>
        </div>

        {/* Code pane */}
        <div className="flex min-h-[280px] min-w-0 flex-col md:min-h-[436px]">
          {selected && lang ? (
            <>
              <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-4">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold">{selected.title}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-3">
                    <span className="swatch" style={{ background: lang.color }} />
                    {lang.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copy}
                  className={`btn btn-sm shrink-0 ${copied ? "btn-primary" : "btn-secondary"}`}
                  aria-live="polite"
                >
                  {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre
                ref={codeRef}
                key={selected.id}
                className="code-block flex-1 overflow-x-auto px-5 pb-5 pt-3"
              >
                <code>
                  {lines.map((line, i) => (
                    <span key={i} data-line className="flex">
                      <span
                        aria-hidden
                        className="tabular w-8 shrink-0 select-none pr-4 text-right text-[var(--code-gutter)]"
                      >
                        {i + 1}
                      </span>
                      <span className="whitespace-pre">{highlight(line, selected.language)}</span>
                    </span>
                  ))}
                </code>
              </pre>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-sm text-ink-2">
              Clear the search to see every snippet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
