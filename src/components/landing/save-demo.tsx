"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckIcon } from "@/components/icons";
import { getLanguage } from "@/lib/languages";

const TITLE = "Free a port that's stuck";
const CODE = `# Kill whatever is listening on :3000
lsof -ti :3000 | xargs kill -9`;

/**
 * The new-snippet form, filled in by the scroll: title, then code, then the
 * save button presses and the confirmation lands. Shows the finished state
 * without motion.
 */
export default function SaveDemo() {
  const root = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLSpanElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const shell = getLanguage("shell");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const p = { title: 0, code: 0 };
      const render = () => {
        if (titleRef.current) titleRef.current.textContent = TITLE.slice(0, Math.round(p.title));
        if (codeRef.current) codeRef.current.textContent = CODE.slice(0, Math.round(p.code));
      };
      render();
      gsap.set(toastRef.current, { opacity: 0, y: 16 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top 75%",
          end: "bottom 45%",
          scrub: 0.6,
        },
      });
      tl.to(p, { title: TITLE.length, duration: 2, ease: "none", onUpdate: render })
        .to(p, { code: CODE.length, duration: 5, ease: "none", onUpdate: render })
        .to(btnRef.current, { scale: 0.95, duration: 0.3, ease: "power2.in" })
        .to(btnRef.current, { scale: 1, duration: 0.3, ease: "power2.out" })
        .to(toastRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={root} className="relative" data-ui>
      <div className="rounded-2xl bg-surface-1 p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="label">Title</p>
            <div className="field flex items-center">
              <span ref={titleRef}>{TITLE}</span>
              <span className="caret ml-px" aria-hidden />
            </div>
          </div>
          <div>
            <p className="label">Language</p>
            <div className="field flex min-w-40 items-center gap-2">
              <span className="swatch" style={{ background: shell.color }} />
              {shell.label}
            </div>
          </div>
        </div>

        <p className="label mt-5">Code</p>
        <pre className="code-block min-h-[9.5rem] whitespace-pre-wrap rounded-lg bg-[var(--code-bg)] p-4 sm:text-sm">
          <span ref={codeRef}>{CODE}</span>
        </pre>

        <div className="mt-5 flex items-center gap-3">
          <span ref={btnRef} className="btn btn-primary inline-flex" aria-hidden>
            Save snippet
          </span>
          <span className="btn btn-quiet" aria-hidden>
            Cancel
          </span>
        </div>
      </div>

      <div
        ref={toastRef}
        className="absolute -bottom-5 right-5 flex items-center gap-2.5 rounded-xl bg-surface-3 px-4 py-3 text-sm font-medium [box-shadow:var(--shadow-float)] sm:right-8"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--success)] text-[#0b0b0c]">
          <CheckIcon className="h-3.5 w-3.5" />
        </span>
        Saved to your library
      </div>
    </div>
  );
}
