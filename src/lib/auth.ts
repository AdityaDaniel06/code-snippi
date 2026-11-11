import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { getSession } from "@/lib/session";
import { withDbRetry } from "@/lib/db-retry";

/**
 * Returns the current user record from the DB, or null if not authenticated.
 * cache(): the root layout and the page both call this; one DB round trip per
 * request instead of two (each one is a network hop to Neon).
 */
export const getCurrentUser = cache(async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await withDbRetry(() =>
    db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    })
  );

  return user;
});

/**
 * Ensures a user is logged in. Redirects to /login otherwise.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
