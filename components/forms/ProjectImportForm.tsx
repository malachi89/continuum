"use client";

import { importProjectJsonAction } from "@/app/(app)/projects/actions";
import {
  Field,
  FormError,
  SubmitButton,
  useCrudForm,
} from "@/components/forms/FormPrimitives";
import { Textarea } from "@/components/ui/Textarea";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const copy = {
  es: {
    label: "JSON de importacion",
    hint: 'Formato minimo: { "project": {}, "characters": [], "locations": [], "events": [], "eventCharacters": [] }',
    placeholder:
      '{\n  "project": {},\n  "characters": [],\n  "locations": [],\n  "events": [],\n  "eventCharacters": []\n}',
    pending: "Importando...",
    submit: "Importar como copia nueva",
  },
  en: {
    label: "Import JSON",
    hint: 'Minimum shape: { "project": {}, "characters": [], "locations": [], "events": [], "eventCharacters": [] }',
    placeholder:
      '{\n  "project": {},\n  "characters": [],\n  "locations": [],\n  "events": [],\n  "eventCharacters": []\n}',
    pending: "Importing...",
    submit: "Import as a new copy",
  },
} as const;

export function ProjectImportForm({
  sourceProjectId,
  redirectTo,
}: {
  sourceProjectId: string;
  redirectTo: string;
}) {
  const [state, formAction] = useCrudForm(importProjectJsonAction);
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="sourceProjectId" value={sourceProjectId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <Field label={text.label} hint={text.hint}>
        <Textarea
          required
          name="rawJson"
          className="min-h-80 font-mono text-xs leading-6"
          placeholder={text.placeholder}
        />
      </Field>

      <FormError error={state.error} />

      <div className="flex justify-end">
        <SubmitButton pendingLabel={text.pending}>{text.submit}</SubmitButton>
      </div>
    </form>
  );
}
