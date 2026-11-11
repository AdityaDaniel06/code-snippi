"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "@/lib/auth-client";
import { LogoutIcon } from "@/components/icons";

export default function UserMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        className="grid h-9 w-9 place-items-center rounded-full bg-surface-3 text-[13px] font-semibold text-ink transition-colors hover:bg-[var(--line-strong)]"
      >
        {initials}
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-[calc(100%+8px)] w-64 origin-top-right rounded-xl border border-[var(--line)] bg-surface-1 p-1.5 [box-shadow:var(--shadow-float)] transition-[opacity,transform] duration-150 ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        <div className="px-3 py-2.5">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-[13px] text-ink-2">{email}</p>
        </div>
        <div className="my-1 h-px bg-[var(--line)]" />
        <button
          type="button"
          role="menuitem"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            void signOut();
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-60"
        >
          <LogoutIcon className="h-4 w-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
