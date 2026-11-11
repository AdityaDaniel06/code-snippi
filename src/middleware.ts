import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getAuthSecretKey, SESSION_COOKIE } from "@/lib/auth-secret";

const PROTECTED_PREFIXES = ["/dashboard", "/snippet"];
const AUTH_ROUTES = ["/login", "/register"];

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getAuthSecretKey(), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

/**
 * Pages that show private data must never be stored by the browser or a
 * proxy. Without this, the Back button after logout can replay the
 * dashboard straight from cache.
 */
function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Vary", "Cookie");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await isAuthenticated(req);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isProtected && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirect", pathname);
    return noStore(NextResponse.redirect(url));
  }

  if (isAuthRoute && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return noStore(NextResponse.redirect(url));
  }

  // Auth pages are no-store too, so Back never shows a stale signed-in or
  // signed-out state.
  return noStore(NextResponse.next());
}

export const config = {
  matcher: ["/dashboard/:path*", "/snippet/:path*", "/login", "/register"],
};
