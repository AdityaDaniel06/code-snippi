"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { gsap } from "gsap";
import { login, register, type AuthFormState } from "@/actions/auth";
import { DEMO_SNIPPETS } from "@/lib/demo-snippets";
import { getLanguage } from "@/lib/languages";
import { highlight } from "@/lib/highlight";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-lg mt-2 w-full" disabled={pending}>
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-ink)]/30 border-t-[var(--accent-ink)]" />
      )}
      {pending ? "One moment…" : label}
    </button>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm text-danger">
      {message}
    </p>
  );
}

const STACK = [DEMO_SNIPPETS[1], DEMO_SNIPPETS[2], DEMO_SNIPPETS[0]];

export default function AuthForm({
  mode,
  redirectTo,
}: {
  mode: "login" | "register";
  redirectTo?: string;
}) {
  const isRegister = mode === "register";
  const action = isRegister ? register : login;
  const [state, formAction] = useActionState<AuthFormState, FormData>(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(rootRef);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".auth-tile", {
        y: 40,
        opacity: 0,
        rotate: (i: number) => [-4, 3, -2][i] ?? 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.1,
        delay: 0.1,
      });
      gsap.from(".auth-field", { y: 14, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.05 });
    });
    return () => mm.revert();
  }, []);

  const errors = state.fieldErrors ?? {};

  return (
    <div
      ref={rootRef}
      className="container-app grid min-h-[calc(100dvh-4rem)] items-stretch gap-10 py-6 lg:grid-cols-2 lg:gap-16"
    >
      {/* Showcase */}
      <aside className="relative hidden overflow-hidden rounded-2xl bg-surface-1 p-12 lg:flex lg:flex-col lg:justify-between">
        <p className="h-section max-w-[12ch] text-[3.25rem]">
          {isRegister ? "Every snippet, one place." : "Your snippets are waiting."}
        </p>

        <div className="relative mt-10 h-[372px]" aria-hidden>
          {STACK.map((s, i) => {
            const l = getLanguage(s.language);
            return (
              <div
                key={s.id}
                className="auth-tile absolute w-[86%] rounded-xl bg-surface-2 p-4"
                style={{
                  left: `${i * 7}%`,
                  top: `${i * 116}px`,
                  transform: `rotate(${[-2, 1.5, -1][i]}deg)`,
                  zIndex: i,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold">{s.title}</p>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink-3">
                    <span className="swatch" style={{ background: l.color }} />
                    {l.label}
                  </span>
                </div>
                <pre className="code-block mt-3 overflow-hidden rounded-lg bg-[var(--code-bg)] p-3 !text-xs">
                  {s.code
                    .split("\n")
                    .slice(0, 3)
                    .map((line, j) => (
                      <span key={j} className="block truncate whitespace-pre">
                        {highlight(line, s.language)}
                      </span>
                    ))}
                </pre>
              </div>
            );
          })}
        </div>

        <p className="max-w-[26rem] text-base leading-relaxed text-ink-2">
          Private to your account. 19 languages with highlighting. Copy in one click.
        </p>
      </aside>

      {/* Form */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[400px]">
          <h1 className="auth-field text-[1.75rem] font-semibold tracking-[-0.03em] sm:text-[2rem]">
            {isRegister ? "Create your account" : "Sign in to Snippi"}
          </h1>
          <p className="auth-field mt-2 text-ink-2">
            {isRegister
              ? "Free, and it takes under a minute."
              : "Welcome back. Your library is where you left it."}
          </p>

          <form action={formAction} className="mt-8 flex flex-col gap-5" noValidate>
            {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

            {isRegister && (
              <div className="auth-field">
                <label className="label" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  className="field"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                <FieldError id="name-error" message={errors.name} />
              </div>
            )}

            <div className="auth-field">
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="field"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              <FieldError id="email-error" message={errors.email} />
            </div>

            <div className="auth-field">
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className="field pr-20"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    [isRegister ? "password-rule" : "", errors.password ? "password-error" : ""]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="btn btn-quiet btn-sm absolute right-1.5 top-1/2 -translate-y-1/2"
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {isRegister && !errors.password && (
                <p id="password-rule" className="mt-2 text-sm text-ink-2">
                  At least 6 characters.
                </p>
              )}
              <FieldError id="password-error" message={errors.password} />
            </div>

            {state.error && (
              <div
                role="alert"
                className="rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm text-danger"
              >
                {state.error}
              </div>
            )}

            <div className="auth-field">
              <SubmitButton label={isRegister ? "Create account" : "Sign in"} />
            </div>
          </form>

          <p className="auth-field mt-8 text-sm text-ink-2">
            {isRegister ? "Already have an account? " : "New to Snippi? "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-medium text-ink underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:decoration-[var(--accent)]"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
