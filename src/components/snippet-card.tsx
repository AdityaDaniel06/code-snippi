import Link from "next/link";
import type { SharePermission } from "@prisma/client";
import { getLanguage } from "@/lib/languages";
import { highlight } from "@/lib/highlight";
import CardDeleteButton from "@/components/card-delete-button";
import CopyButton from "@/components/copy-button";
import { EditIcon, ShareIcon, UsersIcon } from "@/components/icons";

export type SnippetView = "grid" | "list";

export interface SnippetSummary {
  id: number;
  title: string;
  code: string;
  language: string;
  updatedAt: Date | string;
  /** Set on "Shared with me": who owns it and what you may do. */
  share?: { ownerName: string; permission: SharePermission };
  /** Set on "Shared by me": names of the people it's shared with. */
  sharedWith?: string[];
}

export function formatUpdated(updatedAt: Date | string) {
  const d = new Date(updatedAt);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

function sharedWithLabel(names: string[]) {
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

/** "From Ana · Can edit" or "Shared with Ana, Raj +2"; nothing for plain snippets. */
function ShareLine({ snippet }: { snippet: SnippetSummary }) {
  if (snippet.share) {
    return (
      <p className="flex min-w-0 items-center gap-1.5 text-xs text-ink-2">
        <UsersIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          From <span className="font-medium text-ink">{snippet.share.ownerName}</span>
        </span>
        <span className="shrink-0 rounded bg-surface-3 px-1.5 py-px font-medium text-ink">
          {snippet.share.permission === "EDIT" ? "Can edit" : "View only"}
        </span>
      </p>
    );
  }
  if (snippet.sharedWith?.length) {
    return (
      <p className="flex min-w-0 items-center gap-1.5 text-xs text-ink-2">
        <ShareIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          Shared with <span className="font-medium text-ink">{sharedWithLabel(snippet.sharedWith)}</span>
        </span>
      </p>
    );
  }
  return null;
}

function Actions({ snippet }: { snippet: SnippetSummary }) {
  // Owners get everything; Edit shares can edit; nobody but the owner deletes.
  const editable = !snippet.share || snippet.share.permission === "EDIT";
  return (
    <div className="relative z-10 flex items-center gap-0.5 transition-opacity duration-150 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
      <CopyButton text={snippet.code} />
      {editable && (
        <Link
          href={`/snippet/${snippet.id}/edit`}
          aria-label={`Edit ${snippet.title}`}
          title="Edit"
          className="btn btn-quiet btn-icon !h-8 !w-8"
        >
          <EditIcon className="h-4 w-4" />
        </Link>
      )}
      {!snippet.share && <CardDeleteButton id={snippet.id} title={snippet.title} />}
    </div>
  );
}
export default function SnippetCard({
  snippet,
  view = "grid",
}: {
  snippet: SnippetSummary;
  view?: SnippetView;
}) {
  const lang = getLanguage(snippet.language);
  const hasShareLine = Boolean(snippet.share || snippet.sharedWith?.length);
  const langTag = (
    <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink-2">
      <span className="swatch" style={{ background: lang.color }} />
      {lang.label}
    </span>
  );

  if (view === "list") {
    const firstLine = snippet.code.split("\n").find((l) => l.trim()) ?? "";
    return (
      <div className="group relative flex items-center gap-4 rounded-xl bg-surface-1 px-4 py-3 transition-colors duration-150 hover:bg-surface-2">
        <Link
          href={`/snippet/${snippet.id}`}
          className="absolute inset-0 rounded-xl"
          aria-label={`Open ${snippet.title}`}
        />
        <div className="w-full min-w-0 sm:w-64 sm:shrink-0">
          <h3 className="truncate text-[15px] font-medium">{snippet.title}</h3>
          <div className="mt-0.5 sm:hidden">{langTag}</div>
          {hasShareLine && (
            <div className="mt-1">
              <ShareLine snippet={snippet} />
            </div>
          )}
        </div>
        <pre className="code-block hidden min-w-0 flex-1 truncate !text-xs md:block">
          {highlight(firstLine, snippet.language)}
        </pre>
        <div className="hidden w-28 shrink-0 sm:block">{langTag}</div>
        <span suppressHydrationWarning className="tabular hidden w-24 shrink-0 text-right text-xs text-ink-3 lg:block">
          {formatUpdated(snippet.updatedAt)}
        </span>
        <Actions snippet={snippet} />
      </div>
    );
  }

  const preview = snippet.code.split("\n").slice(0, 6);
  return (
    <div className="group relative flex h-full flex-col rounded-xl bg-surface-1 p-4 transition-colors duration-150 hover:bg-surface-2">
      <Link
        href={`/snippet/${snippet.id}`}
        className="absolute inset-0 rounded-xl"
        aria-label={`Open ${snippet.title}`}
      />
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug">{snippet.title}</h3>
        <div className="pt-0.5">{langTag}</div>
      </div>

      {hasShareLine && (
        <div className="mt-2">
          <ShareLine snippet={snippet} />
        </div>
      )}

      <pre className="code-block mt-3 h-[8.6rem] overflow-hidden rounded-lg bg-[var(--code-bg)] p-3 !text-xs transition-colors">
        {preview.map((line, i) => (
          <span key={i} className="block truncate whitespace-pre">
            {highlight(line, snippet.language)}
          </span>
        ))}
      </pre>

      <div className="mt-3 flex h-8 items-center justify-between gap-2">
        <span suppressHydrationWarning className="tabular text-xs text-ink-3">{formatUpdated(snippet.updatedAt)}</span>
        <Actions snippet={snippet} />
      </div>
    </div>
  );
}
