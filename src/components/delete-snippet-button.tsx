"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteSnippet } from "@/actions/snippets";
import { TrashIcon } from "@/components/icons";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-danger" disabled={pending}>
      {pending && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {pending ? "Deleting…" : "Yes, delete it"}
    </button>
  );
}

export default function DeleteSnippetButton({ id }: { id: number }) {
  const [confirming, setConfirming] = useState(false);
  const action = deleteSnippet.bind(null, id);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn btn-quiet hover:!bg-[var(--danger-soft)] hover:!text-danger"
      >
        <TrashIcon className="h-4 w-4" />
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-[var(--danger-soft)] py-1 pl-3 pr-1">
      <span className="text-sm text-danger">This can&apos;t be undone.</span>
      <form action={action}>
        <ConfirmButton />
      </form>
      <button type="button" autoFocus onClick={() => setConfirming(false)} className="btn btn-quiet">
        Keep
      </button>
    </div>
  );
}
