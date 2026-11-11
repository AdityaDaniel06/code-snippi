"use client";

import { GridIcon, ListIcon } from "@/components/icons";

export type View = "grid" | "list";

export default function ViewToggle({
  view,
  onChange,
  label,
}: {
  view: View;
  onChange: (v: View) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg bg-surface-2 p-1">
      {(["grid", "list"] as const).map((v) => {
        const active = view === v;
        const Icon = v === "grid" ? GridIcon : ListIcon;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(v)}
            className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-150 ${
              active
                ? "bg-surface-1 text-ink [&_svg]:text-[var(--accent)]"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" />
            {v === "grid" ? "Grid" : "List"}
          </button>
        );
      })}
    </div>
  );
}
