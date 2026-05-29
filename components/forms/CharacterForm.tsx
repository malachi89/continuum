"use client";

import type { Character, CharacterStatus, TravelMode } from "@prisma/client";
import type { CrudActionState } from "@/app/(app)/projects/actions";
import {
  characterStatusOptions,
  travelModeOptions,
} from "@/lib/continuity/constants";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  Field,
  FormError,
  SubmitButton,
  useCrudForm,
} from "@/components/forms/FormPrimitives";

type CharacterFormProps = {
  action: (state: CrudActionState, formData: FormData) => Promise<CrudActionState>;
  submitLabel: string;
  projectId: string;
  redirectTo: string;
  initialValues?: Partial<Character> & {
    status?: CharacterStatus;
    maxTravelMode?: TravelMode | null;
  };
};

function toDateTimeLocal(value?: Date | string | null) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function CharacterForm({
  action,
  submitLabel,
  projectId,
  redirectTo,
  initialValues,
}: CharacterFormProps) {
  const [state, formAction] = useCrudForm(action);

  return (
    <form action={formAction} className="space-y-4">
      {initialValues?.id ? <input type="hidden" name="characterId" value={initialValues.id} /> : null}
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre">
          <Input required name="name" defaultValue={initialValues?.name ?? ""} />
        </Field>
        <Field label="Alias">
          <Input name="alias" defaultValue={initialValues?.alias ?? ""} />
        </Field>
      </div>

      <Field label="Descripcion">
        <Textarea name="description" defaultValue={initialValues?.description ?? ""} />
      </Field>

      <Field label="Notas">
        <Textarea name="notes" defaultValue={initialValues?.notes ?? ""} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Color">
          <Input
            required
            type="color"
            name="color"
            className="h-12 px-2"
            defaultValue={initialValues?.color ?? "#b6542b"}
          />
        </Field>
        <Field label="Modo maximo">
          <Select name="maxTravelMode" defaultValue={initialValues?.maxTravelMode ?? ""}>
            <option value="">Sin definir</option>
            {travelModeOptions.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Velocidad max. km/h">
          <Input
            name="maxSpeedKmh"
            type="number"
            min="0"
            step="0.1"
            defaultValue={initialValues?.maxSpeedKmh ?? ""}
          />
        </Field>
        <Field label="Estado">
          <Select name="status" defaultValue={initialValues?.status ?? "UNKNOWN"}>
            {characterStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Fecha interna del estado">
        <Input
          name="statusDateInternal"
          type="datetime-local"
          defaultValue={toDateTimeLocal(initialValues?.statusDateInternal)}
        />
      </Field>

      <FormError error={state.error} />

      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
