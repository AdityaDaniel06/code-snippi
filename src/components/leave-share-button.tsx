"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { removeShare } from "@/actions/shares";
import { LogoutIcon } from "@/components/icons";

function ConfirmLeave() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-danger" disabled={pending}>
      {pending ? "Leaving…" : "Yes, leave"}
    </button>
  );
}

/** For someone a snippet was shared with: drop it from their library. */
export default function LeaveShareButton({ shareId }: { shareId: number }) {
  const [confirming, setConfirming] = useState(false);
  const action = removeShare.bind(null, shareId);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn btn-quiet hover:!bg-[var(--danger-soft)] hover:!text-danger"
      >
        <LogoutIcon className="h-4 w-4" />
        Leave
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-[var(--danger-soft)] py-1 pl-3 pr-1">
      <span className="text-sm text-danger">You&apos;ll lose access.</span>
      <form action={action}>
        <ConfirmLeave />
      </form>
      <button type="button" autoFocus onClick={() => setConfirming(false)} className="btn btn-quiet">
        Keep
      </button>
    </div>
  );
}
