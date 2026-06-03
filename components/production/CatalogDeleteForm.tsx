"use client";

import type { CrudActionState } from "@/app/(app)/projects/production-actions";
import {
  FormError,
  SubmitButton,
  useCrudForm,
} from "@/components/forms/FormPrimitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function CatalogDeleteForm({
  action,
  itemId,
  projectId,
  redirectTo,
}: {
  action: (state: CrudActionState, formData: FormData) => Promise<CrudActionState>;
  itemId: string;
  projectId: string;
  redirectTo: string;
}) {
  const [state, formAction] = useCrudForm(action);
  const { language } = useLanguage();

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="flex justify-end">
        <SubmitButton>{language === "es" ? "Borrar" : "Delete"}</SubmitButton>
      </div>

      <FormError error={state.error} />
    </form>
  );
}
