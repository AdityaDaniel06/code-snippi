"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SharePermission } from "@prisma/client";
import { db } from "@/db";
import { requireUser } from "@/lib/auth";
import { getSnippetAccess, isOwner } from "@/lib/access";
import { withDbRetry } from "@/lib/db-retry";

export interface ShareFormState {
  error?: string;
  /** Name of the person just added, for the confirmation line. */
  sharedWith?: string;
}

function parsePermission(value: FormDataEntryValue | null): SharePermission | null {
  return value === "VIEW" || value === "EDIT" ? value : null;
}

function revalidateShare(snippetId: number) {
  revalidatePath(`/snippet/${snippetId}`);
  revalidatePath("/dashboard");
}

/** Owner only: give a registered user View or Edit access by their email. */
export async function shareSnippet(
  snippetId: number,
  _prev: ShareFormState,
  formData: FormData
): Promise<ShareFormState> {
  const user = await requireUser();
  const access = await getSnippetAccess(snippetId, user.id);
  if (!access || !isOwner(access.role)) {
    return { error: "Only the owner can share this snippet." };
  }

  // Emails are stored lowercased at registration (actions/auth.ts).
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const permission = parsePermission(formData.get("permission"));
  if (!email) return { error: "Enter your teammate's email." };
  if (!permission) return { error: "Choose View or Edit access." };
  if (email === user.email.toLowerCase()) {
    return { error: "That's you: you already own this snippet." };
  }

  const recipient = await withDbRetry(() =>
    db.user.findUnique({ where: { email }, select: { id: true, name: true } })
  );
  if (!recipient) {
    return { error: "No Snippi account uses that email. Ask them to sign up first." };
  }

  try {
    // Sharing again with someone already on the list just changes their access.
    await withDbRetry(() =>
      db.snippetShare.upsert({
        where: { snippetId_userId: { snippetId, userId: recipient.id } },
        create: { snippetId, userId: recipient.id, permission },
        update: { permission },
      })
    );
  } catch (error) {
    console.error("shareSnippet failed:", error);
    return { error: "Could not share the snippet. Please try again." };
  }

  revalidateShare(snippetId);
  return { sharedWith: recipient.name };
}

/** Owner only: switch an existing share between View and Edit. */
export async function updateSharePermission(shareId: number, formData: FormData): Promise<void> {
  const user = await requireUser();
  const permission = parsePermission(formData.get("permission"));
  if (!permission) return;

  const share = await withDbRetry(() =>
    db.snippetShare.findFirst({
      where: { id: shareId, snippet: { userId: user.id } },
      select: { snippetId: true },
    })
  );
  if (!share) return;

  await withDbRetry(() => db.snippetShare.update({ where: { id: shareId }, data: { permission } }));
  revalidateShare(share.snippetId);
}

/**
 * Removes a share. The owner can revoke anyone's access; a recipient can
 * remove themselves ("Leave"), which also takes them back to their library.
 */
export async function removeShare(shareId: number): Promise<void> {
  const user = await requireUser();

  const share = await withDbRetry(() =>
    db.snippetShare.findFirst({
      where: { id: shareId, OR: [{ userId: user.id }, { snippet: { userId: user.id } }] },
      select: { snippetId: true, userId: true },
    })
  );
  if (!share) return;

  await withDbRetry(() => db.snippetShare.delete({ where: { id: shareId } }));
  revalidateShare(share.snippetId);

  if (share.userId === user.id) redirect("/dashboard?tab=shared");
}
