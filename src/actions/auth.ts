"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { withDbRetry } from "@/lib/db-retry";

export interface AuthFormState {
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (!name || name.length < 2) fieldErrors.name = "Name must be at least 2 characters.";
  if (!email || !EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (!password || password.length < 6)
    fieldErrors.password = "Password must be at least 6 characters.";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    const existing = await withDbRetry(() =>
      db.user.findUnique({ where: { email } })
    );
    if (existing) {
      return {
        fieldErrors: { email: "An account with this email already exists." },
      };
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await withDbRetry(() =>
      db.user.create({ data: { name, email, password: hashed } })
    );

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    // Unique-constraint race: another request created the same email first.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        fieldErrors: { email: "An account with this email already exists." },
      };
    }
    console.error("register failed:", error);
    return {
      error: "Something went wrong creating your account. Please try again.",
    };
  }

  // Must run outside the try/catch: redirect() throws a control-flow signal.
  redirect("/dashboard");
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const redirectRaw = (formData.get("redirect") as string | null) ?? "";
  // Only same-site paths: "/snippet/3" yes, "//evil.com" or "https://…" no.
  const redirectTo =
    /^\/(?![/\\])/.test(redirectRaw) ? redirectRaw : "/dashboard";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const user = await withDbRetry(() =>
      db.user.findUnique({ where: { email } })
    );
    if (!user) {
      return { error: "Invalid email or password." };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return { error: "Invalid email or password." };
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("login failed:", error);
    return { error: "Something went wrong signing in. Please try again." };
  }

  redirect(redirectTo);
}

/**
 * Clears the session. Navigation is left to the caller, which does a full
 * page replace so no signed-in page survives in the client router cache
 * (that cache is what the Back button would otherwise restore).
 */
export async function logout(): Promise<void> {
  await clearSessionCookie();
  revalidatePath("/", "layout");
}
