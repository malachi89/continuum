"use client";

import type { CrudActionState } from "@/app/(app)/projects/production-actions";
import {
  Field,
  FormError,
  SubmitButton,
  useCrudForm,
} from "@/components/forms/FormPrimitives";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type PropFormProps = {
  action: (state: CrudActionState, formData: FormData) => Promise<CrudActionState>;
  submitLabel: string;
  projectId: string;
  redirectTo: string;
  initialValues?: {
    id?: string;
    name?: string;
    description?: string | null;
    category?: string | null;
    imageUrl?: string | null;
  };
};

const copy = {
  es: {
    name: "Nombre",
    description: "Descripcion",
    category: "Categoria",
    imageUrl: "URL de imagen",
  },
  en: {
    name: "Name",
    description: "Description",
    category: "Category",
    imageUrl: "Image URL",
  },
} as const;

export function PropForm({
  action,
  submitLabel,
  projectId,
  redirectTo,
  initialValues,
}: PropFormProps) {
  const [state, formAction] = useCrudForm(action);
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <form action={formAction} className="space-y-4">
      {initialValues?.id ? <input type="hidden" name="itemId" value={initialValues.id} /> : null}
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <Field label={text.name}>
        <Input required name="name" defaultValue={initialValues?.name ?? ""} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={text.category}>
          <Input name="category" defaultValue={initialValues?.category ?? ""} />
        </Field>
        <Field label={text.imageUrl}>
          <Input name="imageUrl" defaultValue={initialValues?.imageUrl ?? ""} />
        </Field>
      </div>

      <Field label={text.description}>
        <Textarea name="description" defaultValue={initialValues?.description ?? ""} />
      </Field>

      <FormError error={state.error} />

      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
