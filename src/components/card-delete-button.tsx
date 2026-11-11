"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteSnippet } from "@/actions/snippets";
import { TrashIcon } from "@/components/icons";

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-danger btn-sm !h-8">
      {pending ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {pending ? "Deleting" : "Delete"}
    </button>
  );
}

/** Two steps: the bin asks, a labelled button confirms. */
export default function CardDeleteButton({ id, title }: { id: number; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const action = deleteSnippet.bind(null, id);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setConfirming(true);
        }}
        aria-label={`Delete ${title}`}
        title="Delete"
        className="btn btn-quiet btn-icon !h-8 !w-8 hover:!bg-[var(--danger-soft)] hover:!text-danger"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <form action={action}>
        <ConfirmDeleteButton />
      </form>
      <button
        type="button"
        autoFocus
        onClick={(e) => {
          e.preventDefault();
          setConfirming(false);
        }}
        className="btn btn-quiet btn-sm !h-8"
      >
        Keep
      </button>
    </div>
  );
}
