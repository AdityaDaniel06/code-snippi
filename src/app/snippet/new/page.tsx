import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import SnippetForm from "@/components/snippet-form";
import { ArrowLeftIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "New snippet · Snippi",
};

export default async function SnippetCreatePage() {
  await requireUser();

  return (
    <div className="container-app max-w-[1000px] pb-16 pt-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 rounded-md text-sm text-ink-2 transition-colors hover:text-ink"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Library
      </Link>
      <h1 className="mt-6 text-[1.75rem] font-semibold tracking-[-0.03em]">New snippet</h1>
      <div className="mt-8">
        <SnippetForm />
      </div>
    </div>
  );
}
