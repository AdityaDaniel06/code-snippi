import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="container-app grid min-h-[70dvh] content-center py-16">
      <p className="text-[clamp(6rem,22vw,14rem)] font-semibold leading-[0.85] tracking-[-0.04em] text-surface-3" aria-hidden>
        404
      </p>
      <h1 className="mt-6 text-[2rem] font-semibold tracking-[-0.03em]">This snippet isn&apos;t here.</h1>
      <p className="mt-3 max-w-[32rem] text-ink-2">
        It may have been deleted, or the link belongs to another account. Snippets are private to
        whoever saved them and the people they shared them with.
      </p>
      <div className="mt-8">
        <Link href="/dashboard" className="btn btn-primary">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to your library
        </Link>
      </div>
    </div>
  );
}
