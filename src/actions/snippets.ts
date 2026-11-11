"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { requireUser } from "@/lib/auth";
import { isValidLanguage } from "@/lib/languages";
import { withDbRetry } from "@/lib/db-retry";
import { canEdit, getSnippetAccess } from "@/lib/access";

export interface SnippetFormState {
  error?: string;
}

export async function createSnippet(
  _prevState: SnippetFormState,
  formData: FormData
): Promise<SnippetFormState> {
  const user = await requireUser();

  const title = (formData.get("title") as string)?.trim();
  const code = formData.get("code") as string;
  const languageRaw = (formData.get("language") as string) ?? "plaintext";
  const language = isValidLanguage(languageRaw) ? languageRaw : "plaintext";

  if (!title) return { error: "Title is required." };
  if (!code || !code.trim()) return { error: "Code cannot be empty." };

  try {
    await withDbRetry(() =>
      db.snippet.create({ data: { title, code, language, userId: user.id } })
    );
  } catch (error) {
    console.error("createSnippet failed:", error);
    return { error: "Could not save your snippet. Please try again." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateSnippet(
  id: number,
  _prevState: SnippetFormState,
  formData: FormData
): Promise<SnippetFormState> {
  const user = await requireUser();

  // Owners and people with Edit access may save; View-only shares may not.
  const access = await getSnippetAccess(id, user.id);
  if (!access || !canEdit(access.role)) {
    return { error: "Snippet not found or you don't have access." };
  }

  const title = (formData.get("title") as string)?.trim();
  const code = formData.get("code") as string;
  const languageRaw = (formData.get("language") as string) ?? "plaintext";
  const language = isValidLanguage(languageRaw) ? languageRaw : "plaintext";

  if (!title) return { error: "Title is required." };
  if (!code || !code.trim()) return { error: "Code cannot be empty." };

  try {
    await withDbRetry(() =>
      db.snippet.update({ where: { id }, data: { title, code, language } })
    );
  } catch (error) {
    console.error("updateSnippet failed:", error);
    return { error: "Could not save your changes. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/snippet/${id}`);
  redirect(`/snippet/${id}`);
}

export async function deleteSnippet(id: number): Promise<void> {
  const user = await requireUser();

  const existing = await withDbRetry(() =>
    db.snippet.findFirst({ where: { id, userId: user.id } })
  );
  if (existing) {
    await withDbRetry(() => db.snippet.delete({ where: { id } }));
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
