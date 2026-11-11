import "server-only";
import { db } from "@/db";
import { withDbRetry } from "@/lib/db-retry";

export type SnippetRole = "owner" | "edit" | "view";

/**
 * The single gate for reading or changing a snippet. A user reaches a snippet
 * if they own it or it was shared with them; anyone else gets null, which the
 * pages turn into a 404 (so a snippet's existence is never revealed).
 */
export async function getSnippetAccess(snippetId: number, userId: number) {
  if (!Number.isInteger(snippetId)) return null;

  const snippet = await withDbRetry(() =>
    db.snippet.findFirst({
      where: { id: snippetId, OR: [{ userId }, { shares: { some: { userId } } }] },
      include: {
        user: { select: { id: true, name: true, email: true } },
        shares: { where: { userId }, select: { id: true, permission: true } },
      },
    })
  );
  if (!snippet) return null;

  const role: SnippetRole =
    snippet.userId === userId ? "owner" : snippet.shares[0]?.permission === "EDIT" ? "edit" : "view";

  return { snippet, role, owner: snippet.user, shareId: snippet.shares[0]?.id ?? null };
}

export const canEdit = (role: SnippetRole) => role === "owner" || role === "edit";
export const isOwner = (role: SnippetRole) => role === "owner";
