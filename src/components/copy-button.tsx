"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

export default function CopyButton({
  text,
  variant = "icon",
  className = "",
}: {
  text: string;
  variant?: "icon" | "button";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={copy}
        className={`btn btn-primary ${className}`}
      >
        {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
        <span aria-live="polite">{copied ? "Copied" : "Copy code"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      title={copied ? "Copied" : "Copy code"}
      className={`btn btn-icon !h-8 !w-8 ${
        copied ? "bg-[var(--success)] text-[#0b0b0c]" : "btn-quiet"
      } ${className}`}
    >
      {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
    </button>
  );
}
