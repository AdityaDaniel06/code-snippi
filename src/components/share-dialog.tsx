"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { SharePermission } from "@prisma/client";
import {
  removeShare,
  shareSnippet,
  updateSharePermission,
  type ShareFormState,
} from "@/actions/shares";
import { CheckIcon, ShareIcon, XIcon } from "@/components/icons";

interface Person {
  name: string;
  email: string;
}

export interface ShareEntry {
  id: number;
  permission: SharePermission;
  user: Person;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-3 text-[13px] font-semibold text-ink">
      {initials(name)}
    </span>
  );
}

function ShareSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-ink)]/30 border-t-[var(--accent-ink)]" />
      )}
      {pending ? "Sharing…" : "Share"}
    </button>
  );
}

function PermissionSelect({
  name = "permission",
  defaultValue,
  onChange,
  label,
}: {
  name?: string;
  defaultValue: SharePermission;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label: string;
}) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={onChange}
        className="field !h-10 w-auto cursor-pointer appearance-none pr-9 text-sm"
      >
        <option value="VIEW">Can view</option>
        <option value="EDIT">Can edit</option>
      </select>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden
      >
        <path d="m7 10 5 5 5-5" />
      </svg>
    </label>
  );
}

/** One person with access: permission changes save at once; removal asks first. */
function ShareRow({ share }: { share: ShareEntry }) {
  const [confirming, setConfirming] = useState(false);
  const update = updateSharePermission.bind(null, share.id);
  const remove = removeShare.bind(null, share.id);

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <Avatar name={share.user.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{share.user.name}</p>
        <p className="truncate text-[13px] text-ink-2">{share.user.email}</p>
      </div>
      {confirming ? (
        <form action={remove} className="flex items-center gap-1.5">
          <button type="submit" className="btn btn-danger btn-sm">
            Remove access
          </button>
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setConfirming(false)}>
            Keep
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-1.5">
          <form action={update}>
            <PermissionSelect
              defaultValue={share.permission}
              label={`Access for ${share.user.name}`}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
            />
          </form>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Remove ${share.user.name}`}
            title="Remove access"
            className="btn btn-quiet btn-icon hover:!bg-[var(--danger-soft)] hover:!text-danger"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </li>
  );
}

export default function ShareDialog({
  snippetId,
  owner,
  shares,
}: {
  snippetId: number;
  owner: Person;
  shares: ShareEntry[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<ShareFormState, FormData>(
    shareSnippet.bind(null, snippetId),
    {}
  );

  // Clear the email after a successful share, ready for the next teammate.
  useEffect(() => {
    if (state.sharedWith) {
      const email = formRef.current?.elements.namedItem("email") as HTMLInputElement | null;
      if (email) {
        email.value = "";
        email.focus();
      }
    }
  }, [state]);

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => dialogRef.current?.showModal()}
      >
        <ShareIcon className="h-4 w-4" />
        Share
        {shares.length > 0 && (
          <span className="tabular rounded-md bg-surface-3 px-1.5 text-xs font-semibold">
            {shares.length}
          </span>
        )}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="share-title"
        className="m-auto w-[calc(100%-2rem)] max-w-[34rem] rounded-xl border border-[var(--line)] bg-surface-1 p-0 text-ink [box-shadow:var(--shadow-float)] backdrop:bg-black/50"
        onClick={(e) => {
          // A click on the backdrop (the dialog element itself) closes it.
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="share-title" className="text-xl font-semibold tracking-[-0.02em]">
                Share snippet
              </h2>
              <p className="mt-1 text-sm text-ink-2">
                Teammates need a Snippi account. They&apos;ll find it under Shared with me.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="btn btn-quiet btn-icon -mr-2 -mt-1"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <form ref={formRef} action={formAction} className="mt-5 flex flex-col gap-2 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">Teammate&apos;s email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="off"
                placeholder="teammate@company.com"
                aria-invalid={state.error ? true : undefined}
                aria-describedby="share-status"
                className="field !h-10 text-sm"
              />
            </label>
            <PermissionSelect defaultValue="VIEW" label="Access level" />
            <ShareSubmit />
          </form>
          <p id="share-status" aria-live="polite" className="min-h-[1.25rem] pt-2 text-sm">
            {state.error ? (
              <span className="text-danger">{state.error}</span>
            ) : state.sharedWith ? (
              <span className="flex items-center gap-1.5 text-ink-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Shared with {state.sharedWith}.
              </span>
            ) : null}
          </p>

          <h3 className="mt-3 text-sm font-medium text-ink-2">People with access</h3>
          <ul className="mt-1 divide-y divide-[var(--line)]">
            <li className="flex items-center gap-3 py-3">
              <Avatar name={owner.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{owner.name} (you)</p>
                <p className="truncate text-[13px] text-ink-2">{owner.email}</p>
              </div>
              <span className="pr-1 text-sm text-ink-3">Owner</span>
            </li>
            {shares.map((s) => (
              <ShareRow key={`${s.id}-${s.permission}`} share={s} />
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
