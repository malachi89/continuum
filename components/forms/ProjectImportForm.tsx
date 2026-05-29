"use client";

import { importProjectJsonAction } from "@/app/(app)/projects/actions";
import {
  Field,
  FormError,
  SubmitButton,
  useCrudForm,
} from "@/components/forms/FormPrimitives";
import { Textarea } from "@/components/ui/Textarea";

export function ProjectImportForm({
  sourceProjectId,
  redirectTo,
}: {
  sourceProjectId: string;
  redirectTo: string;
}) {
  const [state, formAction] = useCrudForm(importProjectJsonAction);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="sourceProjectId" value={sourceProjectId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <Field
        label="JSON de importacion"
        hint='Formato minimo: { "project": {}, "characters": [], "locations": [], "events": [], "eventCharacters": [] }'
      >
        <Textarea
          required
          name="rawJson"
          className="min-h-80 font-mono text-xs leading-6"
          placeholder='{\n  "project": {},\n  "characters": [],\n  "locations": [],\n  "events": [],\n  "eventCharacters": []\n}'
        />
      </Field>

      <FormError error={state.error} />

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Importando...">Importar como copia nueva</SubmitButton>
      </div>
    </form>
  );
}
