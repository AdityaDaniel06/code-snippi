"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import SnippetCard, { type SnippetSummary, type SnippetView } from "@/components/snippet-card";
import ViewToggle from "@/components/view-toggle";
import { getLanguage } from "@/lib/languages";
import { SearchIcon, XIcon } from "@/components/icons";

const VIEW_KEY = "snippet-view";
type Sort = "recent" | "title";

export default function SnippetList({ snippets }: { snippets: SnippetSummary[] }) {
  const [view, setView] = useState<SnippetView>("grid");
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const flipTl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "grid" || saved === "list") setView(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  // "/" focuses search; Escape clears it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !t.closest("input, textarea, select, [contenteditable]")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    snippets.forEach((s) => counts.set(s.language, (counts.get(s.language) ?? 0) + 1));
    return [...counts.entries()]
      .map(([id, count]) => ({ ...getLanguage(id), count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [snippets]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = snippets.filter((s) => {
      if (lang !== "all" && s.language !== lang) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        getLanguage(s.language).label.toLowerCase().includes(q) ||
        Boolean(s.share?.ownerName.toLowerCase().includes(q))
      );
    });
    return sort === "title"
      ? [...list].sort((a, b) => a.title.localeCompare(b.title))
      : list;
  }, [snippets, query, lang, sort]);

  /** Capture positions before any change that moves cards. */
  const withFlip = (fn: () => void) => {
    flipTl.current?.progress(1).kill();
    if (gridRef.current) {
      flipState.current = Flip.getState(gridRef.current.querySelectorAll("[data-flip]"));
    }
    fn();
  };

  useLayoutEffect(() => {
    gsap.registerPlugin(Flip);
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    flipTl.current = Flip.from(state, {
      duration: 0.45,
      ease: "power3.inOut",
      absolute: true,
      stagger: 0.012,
      onEnter: (els) =>
        gsap.fromTo(els, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.3 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.96, duration: 0.2 }),
    });
  }, [view, visible]);

  const changeView = (next: SnippetView) => {
    if (next === view) return;
    withFlip(() => setView(next));
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* storage unavailable */
    }
  };

  const filtering = query.trim() !== "" || lang !== "all";

  return (
    <div>
      {/* Controls */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Search snippets</span>
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            // No Flip while typing: measuring and animating every card per keystroke
            // made the input lag. Flip is kept for view, sort and language changes.
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
            placeholder="Search titles and code"
            className="field !h-11 pl-10 pr-12 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => withFlip(() => setQuery(""))}
              aria-label="Clear search"
              className="btn btn-quiet btn-icon absolute right-1.5 top-1/2 !h-8 !w-8 -translate-y-1/2"
            >
              <XIcon className="h-4 w-4" />
            </button>
          ) : (
            <span className="kbd absolute right-3 top-1/2 -translate-y-1/2" aria-hidden>
              /
            </span>
          )}
        </label>

        <div className="flex items-center justify-between gap-2">
          <label className="relative">
            <span className="sr-only">Sort</span>
            <select
              value={sort}
              onChange={(e) => withFlip(() => setSort(e.target.value as Sort))}
              className="field !h-10 w-auto cursor-pointer appearance-none pr-9 text-sm"
            >
              <option value="recent">Recently updated</option>
              <option value="title">Title A–Z</option>
            </select>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path d="m7 10 5 5 5-5" />
            </svg>
          </label>
          <ViewToggle view={view} onChange={changeView} label="Library view" />
        </div>
      </div>

      {/* Language filter */}
      {languages.length > 1 && (
        <div
          className="-mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          role="group"
          aria-label="Filter by language"
        >
          {[{ id: "all", label: "All", color: "", count: snippets.length }, ...languages].map((l) => {
            const active = lang === l.id;
            return (
              <button
                key={l.id}
                type="button"
                aria-pressed={active}
                onClick={() => withFlip(() => setLang(l.id))}
                className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-sm transition-colors duration-150 ${
                  active ? "bg-[var(--accent-soft)] text-ink shadow-[inset_0_0_0_1px_var(--accent)]" : "bg-surface-1 text-ink-2 hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {l.color && <span className="swatch" style={{ background: l.color }} />}
                {l.label}
                <span className={`tabular text-xs ${active ? "opacity-60" : "text-ink-3"}`}>{l.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {filtering && (
        <p className="mt-5 text-sm text-ink-2" aria-live="polite">
          {visible.length === 0
            ? "No snippets match."
            : `Showing ${visible.length} of ${snippets.length}`}
        </p>
      )}

      {/* Results */}
      <div
        ref={gridRef}
        className={
          view === "grid"
            ? "mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            : "mt-5 flex flex-col gap-1.5"
        }
      >
        {visible.map((snippet) => (
          <div key={snippet.id} data-flip data-flip-id={`s-${snippet.id}`} className="min-w-0">
            <SnippetCard snippet={snippet} view={view} />
          </div>
        ))}
      </div>

      {filtering && visible.length === 0 && (
        <div className="mt-4 rounded-xl bg-surface-1 px-6 py-14 text-center">
          <p className="text-lg font-medium">Nothing matches {query ? <>&ldquo;{query}&rdquo;</> : "that filter"}.</p>
          <p className="mt-2 text-ink-2">Search looks at titles and the code itself.</p>
          <button
            type="button"
            onClick={() =>
              withFlip(() => {
                setQuery("");
                setLang("all");
              })
            }
            className="btn btn-secondary mt-6"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
