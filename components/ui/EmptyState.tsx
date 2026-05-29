import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function EmptyState({
  eyebrow,
  title,
  body,
  actionLabel,
  actionHref,
}: {
  eyebrow: string;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-line bg-canvas/70 p-6">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-xl font-semibold">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{body}</p>
      {actionLabel && actionHref ? (
        <div className="mt-5">
          <Link href={actionHref}>
            <Button variant="secondary">{actionLabel}</Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
