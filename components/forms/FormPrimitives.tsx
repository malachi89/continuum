"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { CrudActionState } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export const initialCrudState: CrudActionState = {};

export function useCrudForm(
  action: (state: CrudActionState, formData: FormData) => Promise<CrudActionState>,
) {
  return useActionState(action, initialCrudState);
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-2 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function FormError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }

  return (
    <p className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent-strong">
      {error}
    </p>
  );
}

export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel ?? t("saving") : children}
    </Button>
  );
}
