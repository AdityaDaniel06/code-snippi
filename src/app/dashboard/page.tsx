import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { requireUser } from "@/lib/auth";
import { withDbRetry } from "@/lib/db-retry";
import SnippetList from "@/components/snippet-list";
import LibraryTabs, { type LibraryTab } from "@/components/library-tabs";
import type { SnippetSummary } from "@/components/snippet-card";
import { PlusIcon, ShareIcon, UsersIcon } from "@/components/icons";
import { LANGUAGES } from "@/lib/languages";

export const metadata: Metadata = {
  title: "Library · Snippi",
};

const SUMMARY = { id: true, title: true, code: true, language: true, updatedAt: true } as const;

function parseTab(value: string | string[] | undefined): LibraryTab {
  return value === "shared" || value === "sent" ? value : "mine";
}

/** Loads only the selected tab's list; the other two are just counted. */
async function loadTab(tab: LibraryTab, userId: number): Promise<SnippetSummary[]> {
  if (tab === "shared") {
    const shares = await withDbRetry(() =>
      db.snippetShare.findMany({
        where: { userId },
        orderBy: { snippet: { updatedAt: "desc" } },
        select: {
          permission: true,
          snippet: { select: { ...SUMMARY, user: { select: { name: true } } } },
        },
      })
    );
    return shares.map(({ permission, snippet: { user, ...s } }) => ({
      ...s,
      share: { ownerName: user.name, permission },
    }));
  }

  if (tab === "sent") {
    const snippets = await withDbRetry(() =>
      db.snippet.findMany({
        where: { userId, shares: { some: {} } },
        orderBy: { updatedAt: "desc" },
        select: {
          ...SUMMARY,
          shares: { orderBy: { createdAt: "asc" }, select: { user: { select: { name: true } } } },
        },
      })
    );
    return snippets.map(({ shares, ...s }) => ({ ...s, sharedWith: shares.map((x) => x.user.name) }));
  }

  return withDbRetry(() =>
    db.snippet.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, select: SUMMARY })
  );
}

function EmptyShared({ tab }: { tab: "shared" | "sent" }) {
  const Icon = tab === "shared" ? UsersIcon : ShareIcon;
  return (
    <div className="mt-8 rounded-2xl bg-surface-1 px-6 py-16 text-center sm:px-12">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-ink-2">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em]">
        {tab === "shared" ? "Nothing shared with you yet" : "You haven't shared anything yet"}
      </h2>
      <p className="mx-auto mt-2 max-w-[30rem] text-ink-2">
        {tab === "shared"
          ? "When a teammate shares a snippet with the email you signed up with, it shows up here."
          : "Open one of your snippets and choose Share to give a teammate view or edit access."}
      </p>
      {tab === "sent" && (
        <Link href="/dashboard" className="btn btn-secondary mt-6">
          Go to my snippets
        </Link>
      )}
    </div>
  );
}

export default async function DashboardPage(props: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const user = await requireUser();
  const tab = parseTab((await props.searchParams).tab);

  const [snippets, mine, shared, sent] = await Promise.all([
    loadTab(tab, user.id),
    withDbRetry(() => db.snippet.count({ where: { userId: user.id } })),
    withDbRetry(() => db.snippetShare.count({ where: { userId: user.id } })),
    withDbRetry(() => db.snippet.count({ where: { userId: user.id, shares: { some: {} } } })),
  ]);

  const languageCount = new Set(snippets.map((s) => s.language)).size;
  const summary =
    snippets.length === 0
      ? "Empty for now"
      : `${snippets.length} ${snippets.length === 1 ? "snippet" : "snippets"} in ${languageCount} ${
          languageCount === 1 ? "language" : "languages"
        }`;

  return (
    <div className="container-app pb-24 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-[-0.03em]">Library</h1>
          <p className="tabular mt-1 text-sm text-ink-2">{summary}</p>
        </div>
        <LibraryTabs active={tab} counts={{ mine, shared, sent }} />
      </div>

      {snippets.length > 0 ? (
        // key: each tab starts with fresh search and filters.
        <SnippetList key={tab} snippets={snippets} />
      ) : tab !== "mine" ? (
        <EmptyShared tab={tab} />
      ) : (
        <div className="mt-10 grid gap-10 rounded-2xl bg-surface-1 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-[2rem] font-semibold leading-tight tracking-[-0.03em]">
              Save the first thing you&apos;d hate to rewrite.
            </h2>
            <p className="mt-4 max-w-[28rem] text-ink-2">
              A query you run every month, a config you copy between projects, a command you always
              have to look up. Paste it in once and it&apos;s here, searchable, from then on.
            </p>
            <Link href="/snippet/new" className="btn btn-primary btn-lg mt-8">
              <PlusIcon className="h-4 w-4" />
              New snippet
            </Link>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="Supported languages">
            {LANGUAGES.filter((l) => l.id !== "plaintext").map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-1.5 text-sm text-ink-2"
              >
                <span className="swatch" style={{ background: l.color }} />
                {l.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
