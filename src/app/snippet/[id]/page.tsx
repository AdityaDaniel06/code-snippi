import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { requireUser } from "@/lib/auth";
import { canEdit, getSnippetAccess, isOwner } from "@/lib/access";
import { withDbRetry } from "@/lib/db-retry";
import CodeViewer from "@/components/code-viewer";
import CopyButton from "@/components/copy-button";
import DeleteSnippetButton from "@/components/delete-snippet-button";
import ShareDialog from "@/components/share-dialog";
import LeaveShareButton from "@/components/leave-share-button";
import { ArrowLeftIcon, EditIcon } from "@/components/icons";
import { getLanguage } from "@/lib/languages";

interface SnippetShowPageProps {
  params: Promise<{ id: string }>;
}

// cache(): metadata and the page share one access check per request.
const getAccess = cache(async (rawId: string) => {
  const user = await requireUser();
  return getSnippetAccess(Number.parseInt(rawId, 10), user.id);
});

export async function generateMetadata(props: SnippetShowPageProps): Promise<Metadata> {
  const { id } = await props.params;
  const access = await getAccess(id);
  return { title: access ? `${access.snippet.title} · Snippi` : "Snippet · Snippi" };
}

export default async function SnippetShowPage(props: SnippetShowPageProps) {
  const { id } = await props.params;
  const access = await getAccess(id);
  if (!access) return notFound();
  const { snippet, role, owner } = access;

  // Only the owner manages access, so only the owner loads the list.
  const shares = isOwner(role)
    ? await withDbRetry(() =>
        db.snippetShare.findMany({
          where: { snippetId: snippet.id },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            permission: true,
            user: { select: { name: true, email: true } },
          },
        })
      )
    : [];

  const lang = getLanguage(snippet.language);
  const lineCount = snippet.code.split("\n").length;
  const updated = new Date(snippet.updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    // --lang drives the tinted header band and the code panel's bar, so each
    // snippet page wears its own language's identity colour.
    <div style={{ "--lang": lang.color } as React.CSSProperties}>
      <section className="lang-band pb-24 pt-8 sm:pb-28">
        <div className="container-app max-w-[1000px]">
          <Link
            href={isOwner(role) ? "/dashboard" : "/dashboard?tab=shared"}
            className="inline-flex items-center gap-1.5 rounded-md text-sm text-ink-2 transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Library
          </Link>

          <h1 className="mt-8 break-words text-[clamp(2.25rem,5.5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
            <span
              aria-hidden
              className="mr-[0.3em] inline-block h-[0.32em] w-[0.32em] rounded-[0.05em] align-[0.2em]"
              style={{ background: lang.color }}
            />
            {snippet.title}
          </h1>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="tabular flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
              <span className="font-medium text-ink">{lang.label}</span>
              <span className="text-ink-3" aria-hidden>
                ·
              </span>
              <span>
                {lineCount} {lineCount === 1 ? "line" : "lines"}
              </span>
              <span className="text-ink-3" aria-hidden>
                ·
              </span>
              <span>Updated {updated}</span>
              {!isOwner(role) && (
                <>
                  <span className="text-ink-3" aria-hidden>
                    ·
                  </span>
                  <span>
                    Shared by <span className="font-medium text-ink">{owner.name}</span>
                  </span>
                  <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink">
                    {role === "edit" ? "Can edit" : "View only"}
                  </span>
                </>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton text={snippet.code} variant="button" />
              {isOwner(role) && (
                <ShareDialog snippetId={snippet.id} owner={owner} shares={shares} />
              )}
              {canEdit(role) && (
                <Link href={`/snippet/${snippet.id}/edit`} className="btn btn-secondary">
                  <EditIcon className="h-4 w-4" />
                  Edit
                </Link>
              )}
              {isOwner(role) ? (
                <DeleteSnippetButton id={snippet.id} />
              ) : (
                access.shareId && <LeaveShareButton shareId={access.shareId} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* The code panel rides up over the band's lower edge. */}
      <div className="container-app relative -mt-16 max-w-[1000px] pb-24">
        <CodeViewer code={snippet.code} language={snippet.language} />
      </div>
    </div>
  );
}
