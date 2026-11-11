import Link from "next/link";

export type LibraryTab = "mine" | "shared" | "sent";

const TABS: { id: LibraryTab; label: string; href: string }[] = [
  { id: "mine", label: "My snippets", href: "/dashboard" },
  { id: "shared", label: "Shared with me", href: "/dashboard?tab=shared" },
  { id: "sent", label: "Shared by me", href: "/dashboard?tab=sent" },
];

/** Link tabs (so each list has its own URL), styled like the view toggle. */
export default function LibraryTabs({
  active,
  counts,
}: {
  active: LibraryTab;
  counts: Record<LibraryTab, number>;
}) {
  return (
    <nav aria-label="Library sections" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="inline-flex rounded-lg bg-surface-2 p-1">
        {TABS.map((t) => {
          const current = t.id === active;
          return (
            <Link
              key={t.id}
              href={t.href}
              aria-current={current ? "page" : undefined}
              className={`inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors duration-150 ${
                current ? "bg-surface-1 text-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              {t.label}
              <span
                className={`tabular text-xs ${current ? "text-[var(--accent)]" : "text-ink-3"}`}
              >
                {counts[t.id]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
