"use client";

import type { Location, LocationType } from "@prisma/client";
import type { CrudActionState } from "@/app/(app)/projects/actions";
import { locationTypeOptions } from "@/lib/continuity/constants";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  Field,
  FormError,
  SubmitButton,
  useCrudForm,
} from "@/components/forms/FormPrimitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type LocationFormProps = {
  action: (state: CrudActionState, formData: FormData) => Promise<CrudActionState>;
  submitLabel: string;
  projectId: string;
  redirectTo: string;
  initialValues?: Partial<Location> & {
    type?: LocationType;
  };
};

const copy = {
  es: {
    name: "Nombre",
    type: "Tipo",
    description: "Descripcion",
    latitude: "Latitud",
    longitude: "Longitud",
    notes: "Notas",
  },
  en: {
    name: "Name",
    type: "Type",
    description: "Description",
    latitude: "Latitude",
    longitude: "Longitude",
    notes: "Notes",
  },
} as const;

export function LocationForm({
  action,
  submitLabel,
  projectId,
  redirectTo,
  initialValues,
}: LocationFormProps) {
  const [state, formAction] = useCrudForm(action);
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <form action={formAction} className="space-y-4">
      {initialValues?.id ? <input type="hidden" name="locationId" value={initialValues.id} /> : null}
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={text.name}>
          <Input required name="name" defaultValue={initialValues?.name ?? ""} />
        </Field>
        <Field label={text.type}>
          <Select name="type" defaultValue={initialValues?.type ?? "CITY"}>
            {locationTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label={text.description}>
        <Textarea name="description" defaultValue={initialValues?.description ?? ""} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={text.latitude}>
          <Input
            name="latitude"
            type="number"
            step="0.0001"
            defaultValue={initialValues?.latitude ?? ""}
          />
        </Field>
        <Field label={text.longitude}>
          <Input
            name="longitude"
            type="number"
            step="0.0001"
            defaultValue={initialValues?.longitude ?? ""}
          />
        </Field>
      </div>

      <Field label={text.notes}>
        <Textarea name="notes" defaultValue={initialValues?.notes ?? ""} />
      </Field>

      <FormError error={state.error} />

      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
