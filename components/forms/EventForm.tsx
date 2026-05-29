"use client";

import type { Event, EventType } from "@prisma/client";
import type { CrudActionState } from "@/app/(app)/projects/actions";
import { eventTypeOptions } from "@/lib/continuity/constants";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  Field,
  FormError,
  SubmitButton,
  useCrudForm,
} from "@/components/forms/FormPrimitives";

type EventFormProps = {
  action: (state: CrudActionState, formData: FormData) => Promise<CrudActionState>;
  submitLabel: string;
  projectId: string;
  redirectTo: string;
  locations: Array<{ id: string; name: string }>;
  characters: Array<{ id: string; name: string; color: string }>;
  initialValues?: Partial<Event> & {
    eventType?: EventType;
    selectedCharacterIds?: string[];
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

export function EventForm({
  action,
  submitLabel,
  projectId,
  redirectTo,
  locations,
  characters,
  initialValues,
}: EventFormProps) {
  const [state, formAction] = useCrudForm(action);
  const selectedCharacterIds = new Set(initialValues?.selectedCharacterIds ?? []);

  return (
    <form action={formAction} className="space-y-4">
      {initialValues?.id ? <input type="hidden" name="eventId" value={initialValues.id} /> : null}
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Titulo">
          <Input required name="title" defaultValue={initialValues?.title ?? ""} />
        </Field>
        <Field label="Tipo">
          <Select name="eventType" defaultValue={initialValues?.eventType ?? "SCENE"}>
            {eventTypeOptions.map((eventType) => (
              <option key={eventType} value={eventType}>
                {eventType}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Descripcion">
        <Textarea name="description" defaultValue={initialValues?.description ?? ""} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Inicio interno">
          <Input
            required
            name="internalStart"
            type="datetime-local"
            defaultValue={toDateTimeLocal(initialValues?.internalStart)}
          />
        </Field>
        <Field label="Fin interno">
          <Input
            required
            name="internalEnd"
            type="datetime-local"
            defaultValue={toDateTimeLocal(initialValues?.internalEnd)}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Locacion inicial">
          <Select name="startLocationId" defaultValue={initialValues?.startLocationId ?? ""}>
            <option value="">Sin definir</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Locacion final">
          <Select name="endLocationId" defaultValue={initialValues?.endLocationId ?? ""}>
            <option value="">Sin definir</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Capitulo / episodio">
          <Input
            name="chapterOrEpisode"
            defaultValue={initialValues?.chapterOrEpisode ?? ""}
          />
        </Field>
        <Field label="Orden narrativo">
          <Input
            name="narrativeOrder"
            type="number"
            step="1"
            defaultValue={initialValues?.narrativeOrder ?? ""}
          />
        </Field>
      </div>

      <Field label="Personajes">
        <div className="grid gap-2 rounded-[24px] border border-line bg-canvas/50 p-4 md:grid-cols-2">
          {characters.length === 0 ? (
            <p className="text-sm text-muted">
              Crea personajes primero para vincularlos a este evento.
            </p>
          ) : (
            characters.map((character) => (
              <label
                key={character.id}
                className="flex items-center gap-3 rounded-2xl bg-surface/80 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="characterIds"
                  value={character.id}
                  defaultChecked={selectedCharacterIds.has(character.id)}
                />
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: character.color }}
                />
                <span>{character.name}</span>
              </label>
            ))
          )}
        </div>
      </Field>

      <Field label="Notas">
        <Textarea name="notes" defaultValue={initialValues?.notes ?? ""} />
      </Field>

      <FormError error={state.error} />

      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
