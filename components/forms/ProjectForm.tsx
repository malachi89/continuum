"use client";

import type { ProjectType } from "@prisma/client";
import type { CrudActionState } from "@/app/(app)/projects/actions";
import { projectTypeOptions } from "@/lib/continuity/constants";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  Field,
  FormError,
  SubmitButton,
  useCrudForm,
} from "@/components/forms/FormPrimitives";

type ProjectFormProps = {
  action: (state: CrudActionState, formData: FormData) => Promise<CrudActionState>;
  submitLabel: string;
  redirectTo: string;
  initialValues?: {
    projectId?: string;
    title?: string;
    type?: ProjectType;
    description?: string | null;
  };
};

export function ProjectForm({
  action,
  submitLabel,
  redirectTo,
  initialValues,
}: ProjectFormProps) {
  const [state, formAction] = useCrudForm(action);

  return (
    <form action={formAction} className="space-y-4">
      {initialValues?.projectId ? (
        <input type="hidden" name="projectId" value={initialValues.projectId} />
      ) : null}
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <Field label="Titulo">
        <Input
          required
          name="title"
          placeholder="Saga principal"
          defaultValue={initialValues?.title ?? ""}
        />
      </Field>

      <Field label="Tipo">
        <Select name="type" defaultValue={initialValues?.type ?? "NOVEL"}>
          {projectTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Descripcion">
        <Textarea
          name="description"
          placeholder="Reglas base, tono, alcance editorial..."
          defaultValue={initialValues?.description ?? ""}
        />
      </Field>

      <FormError error={state.error} />

      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
