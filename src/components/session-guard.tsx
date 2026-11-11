"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { onSignOutElsewhere } from "@/lib/auth-client";

const PROTECTED = /^\/(dashboard|snippet)(\/|$)/;

/**
 * Keeps signed-in pages from outliving the session:
 * - A protected page restored from the browser's back-forward cache is
 *   reloaded, so the server checks the cookie again (and redirects to /login
 *   if the user signed out).
 * - When another tab signs out, this tab leaves its protected page at once.
 */
export default function SessionGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && PROTECTED.test(window.location.pathname)) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    return onSignOutElsewhere(() => {
      if (PROTECTED.test(window.location.pathname)) {
        window.location.replace("/login");
      } else {
        window.location.reload();
      }
    });
  }, [pathname]);

  return null;
}
