"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import UserMenu from "@/components/user-menu";
import { PlusIcon, SnippiMark } from "@/components/icons";

interface NavbarUser {
  id: number;
  name: string;
  email: string;
}

export default function Navbar({ user }: { user: NavbarUser | null }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const onLibrary = pathname === "/dashboard";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 transition-[box-shadow] duration-200 ${
        scrolled ? "shadow-[0_1px_0_var(--line)]" : ""
      }`}
      style={{ background: "var(--bg)" }}
    >
      <nav
        className={`flex h-full items-center justify-between gap-4 ${
          user ? "container-app" : "container-page"
        }`}
        aria-label="Main"
      >
        <div className="flex items-center gap-8">
          <Link
            href={user ? "/dashboard" : "/"}
            className="group flex items-center gap-2.5 rounded-md"
            aria-label="Snippi home"
          >
            <SnippiMark className="h-7 w-7 transition-transform duration-200 group-hover:-rotate-6" />
            <span className="text-base font-semibold tracking-[-0.02em]">Snippi</span>
          </Link>

          {user && (
            <Link
              href="/dashboard"
              aria-current={onLibrary ? "page" : undefined}
              className={`hidden rounded-md px-1 text-sm font-medium transition-colors sm:block ${
                onLibrary ? "text-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              Library
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/snippet/new" className="btn btn-primary btn-sm ml-1">
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">New snippet</span>
                <span className="sr-only sm:hidden">New snippet</span>
              </Link>
              <UserMenu name={user.name} email={user.email} />
            </>
          ) : (
            !isAuthRoute && (
              <>
                <Link href="/login" className="btn btn-quiet btn-sm">
                  Sign in
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Get started
                </Link>
              </>
            )
          )}
        </div>
      </nav>
    </header>
  );
}
