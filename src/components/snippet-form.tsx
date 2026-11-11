"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Snippet } from "@prisma/client";
import CodeEditor from "@/components/code-editor";
import { createSnippet, updateSnippet, type SnippetFormState } from "@/actions/snippets";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-ink)]/30 border-t-[var(--accent-ink)]" />
      )}
      {pending ? "Saving…" : label}
    </button>
  );
}

export default function SnippetForm({
  snippet,
}: {
  snippet?: Pick<Snippet, "id" | "title" | "code" | "language">;
}) {
  const isEdit = Boolean(snippet);
  const action = isEdit ? updateSnippet.bind(null, snippet!.id) : createSnippet;
  const [state, formAction] = useActionState<SnippetFormState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    // Ctrl/Cmd+S anywhere on the page saves (Monaco handles its own focus).
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const titleError = state.error === "Title is required." ? state.error : undefined;
  const otherError = titleError ? undefined : state.error;

  return (
    <form ref={formRef} action={formAction} className="flex flex-col">
      <CodeEditor
        defaultLanguage={snippet?.language ?? "plaintext"}
        defaultValue={snippet?.code ?? ""}
        onSave={() => formRef.current?.requestSubmit()}
        titleSlot={
          <div>
            <label className="label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={snippet?.title}
              placeholder="What would you search for? e.g. Revenue by month"
              className="field"
              maxLength={200}
              autoFocus={!isEdit}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? "title-error" : undefined}
            />
            {titleError && (
              <p id="title-error" className="mt-2 text-sm text-danger">
                Give it a title so you can find it later.
              </p>
            )}
          </div>
        }
      />

      {otherError && (
        <div role="alert" className="mt-5 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm text-danger">
          {otherError === "Code cannot be empty." ? "Paste some code before saving." : otherError}
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex shadow-[0_-1px_0_var(--line)] items-center justify-between gap-3 bg-[var(--bg)] px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <p className="hidden text-sm text-ink-3 sm:block">
          <span className="kbd mr-1">{isMac ? "⌘" : "Ctrl"}</span>
          <span className="kbd mr-2">S</span>
          to save
        </p>
        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <Link href={isEdit ? `/snippet/${snippet!.id}` : "/dashboard"} className="btn btn-quiet">
            Cancel
          </Link>
          <SubmitButton label={isEdit ? "Save changes" : "Save snippet"} />
        </div>
      </div>
    </form>
  );
}
