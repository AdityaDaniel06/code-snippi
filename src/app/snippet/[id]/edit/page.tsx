import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { canEdit, getSnippetAccess, isOwner } from "@/lib/access";
import SnippetForm from "@/components/snippet-form";
import { ArrowLeftIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Edit snippet · Snippi",
};

interface SnippetEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function SnippetEditPage(props: SnippetEditPageProps) {
  const user = await requireUser();
  const { id } = await props.params;

  // Owners and Edit shares only; View-only and strangers get the same 404.
  const access = await getSnippetAccess(Number.parseInt(id, 10), user.id);
  if (!access || !canEdit(access.role)) return notFound();
  const { snippet, role, owner } = access;

  return (
    <div className="container-app max-w-[1000px] pb-16 pt-8">
      <Link
        href={`/snippet/${snippet.id}`}
        className="inline-flex max-w-full items-center gap-1.5 rounded-md text-sm text-ink-2 transition-colors hover:text-ink"
      >
        <ArrowLeftIcon className="h-4 w-4 shrink-0" />
        <span className="truncate">{snippet.title}</span>
      </Link>
      <h1 className="mt-6 text-[1.75rem] font-semibold tracking-[-0.03em]">Edit snippet</h1>
      {!isOwner(role) && (
        <p className="mt-2 text-sm text-ink-2">
          This is <span className="font-medium text-ink">{owner.name}</span>&apos;s snippet. They
          shared it with you, and they&apos;ll see your changes.
        </p>
      )}
      <div className="mt-8">
        <SnippetForm
          snippet={{ id: snippet.id, title: snippet.title, code: snippet.code, language: snippet.language }}
        />
      </div>
    </div>
  );
}
