/**
 * The key that signs session tokens. Shared by the Node runtime (session.ts)
 * and the Edge runtime (middleware.ts), so it must not import "server-only".
 *
 * In production a missing or short AUTH_SECRET is a hard error: falling back
 * to a known string would let anyone forge a session cookie.
 */
const DEV_FALLBACK = "dev-only-insecure-secret-change-me-0000000000";

let cached: Uint8Array | null = null;

export function getAuthSecretKey(): Uint8Array {
  if (cached) return cached;
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET must be set to a random string of at least 32 characters in production."
      );
    }
    console.warn("[auth] AUTH_SECRET is missing or shorter than 32 characters; using a dev-only key.");
    cached = new TextEncoder().encode(secret && secret.length > 0 ? secret : DEV_FALLBACK);
    return cached;
  }

  cached = new TextEncoder().encode(secret);
  return cached;
}

export const SESSION_COOKIE = "session";
