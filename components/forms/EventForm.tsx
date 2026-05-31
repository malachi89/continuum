"use client";

import type { Event, EventType } from "@prisma/client";
import { useMemo, useState } from "react";
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
import { useLanguage } from "@/lib/i18n/LanguageProvider";

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

type CharacterOption = { id: string; name: string; color: string };

const copy = {
  es: {
    characters: "Personajes",
    createCharactersFirst: "Crea personajes primero para vincularlos a este evento.",
    available: "Disponibles",
    selected: "Seleccionados",
    noCharactersAvailable: "No hay personajes disponibles.",
    noCharactersSelected: "Sin personajes seleccionados.",
    title: "Titulo",
    type: "Tipo",
    description: "Descripcion",
    internalStart: "Inicio interno",
    internalEnd: "Fin interno",
    startLocation: "Locacion inicial",
    endLocation: "Locacion final",
    chapterOrEpisode: "Capitulo / episodio",
    narrativeOrder: "Orden narrativo",
    notes: "Notas",
    noLocation: "Sin definir",
  },
  en: {
    characters: "Characters",
    createCharactersFirst: "Create characters first to link them to this event.",
    available: "Available",
    selected: "Selected",
    noCharactersAvailable: "No characters available.",
    noCharactersSelected: "No characters selected.",
    title: "Title",
    type: "Type",
    description: "Description",
    internalStart: "Internal start",
    internalEnd: "Internal end",
    startLocation: "Start location",
    endLocation: "End location",
    chapterOrEpisode: "Chapter / episode",
    narrativeOrder: "Narrative order",
    notes: "Notes",
    noLocation: "Unset",
  },
} as const;

function toDateTimeLocal(value?: Date | string | null) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function EventCharacterSelector({
  characters,
  initialSelectedCharacterIds = [],
}: {
  characters: CharacterOption[];
  initialSelectedCharacterIds?: string[];
}) {
  const { language } = useLanguage();
  const text = copy[language];
  const [selectedCharacterIds, setSelectedCharacterIds] = useState(() => {
    const initialIds = new Set(initialSelectedCharacterIds);
    return characters
      .filter((character) => initialIds.has(character.id))
      .map((character) => character.id);
  });

  const selectedIdSet = useMemo(
    () => new Set(selectedCharacterIds),
    [selectedCharacterIds],
  );
  const availableCharacters = useMemo(
    () => characters.filter((character) => !selectedIdSet.has(character.id)),
    [characters, selectedIdSet],
  );
  const selectedCharacters = useMemo(
    () =>
      selectedCharacterIds
        .map((characterId) =>
          characters.find((character) => character.id === characterId),
        )
        .filter((character): character is CharacterOption => Boolean(character)),
    [characters, selectedCharacterIds],
  );

  function toggleCharacter(characterId: string) {
    setSelectedCharacterIds((currentIds) => {
      if (currentIds.includes(characterId)) {
        return currentIds.filter((id) => id !== characterId);
      }
      return [...currentIds, characterId];
    });
  }

  return (
    <div>
      <p className="mb-2 block text-sm font-medium text-ink">{text.characters}</p>
      {selectedCharacterIds.map((characterId) => (
        <input
          key={characterId}
          type="hidden"
          name="characterIds"
          value={characterId}
        />
      ))}
      {characters.length === 0 ? (
        <div className="rounded-[24px] border border-line bg-canvas/50 p-4">
          <p className="text-sm text-muted">
            {text.createCharactersFirst}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <CharacterColumn
            title={text.available}
            count={availableCharacters.length}
            characters={availableCharacters}
            emptyLabel={text.noCharactersAvailable}
            onCharacterClick={toggleCharacter}
          />
          <CharacterColumn
            title={text.selected}
            count={selectedCharacters.length}
            characters={selectedCharacters}
            emptyLabel={text.noCharactersSelected}
            onCharacterClick={toggleCharacter}
          />
        </div>
      )}
    </div>
  );
}

function CharacterColumn({
  title,
  count,
  characters,
  emptyLabel,
  onCharacterClick,
}: {
  title: string;
  count: number;
  characters: CharacterOption[];
  emptyLabel: string;
  onCharacterClick: (characterId: string) => void;
}) {
  return (
    <div className="min-h-48 rounded-[22px] border border-line bg-canvas/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-muted">
          {count}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {characters.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-surface/60 px-3 py-4 text-sm text-muted">
            {emptyLabel}
          </p>
        ) : (
          characters.map((character) => (
            <button
              key={character.id}
              type="button"
              onClick={() => onCharacterClick(character.id)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface/80 px-3 py-2 text-sm text-left transition hover:border-accent hover:bg-surface"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: character.color }}
              />
              <span className="min-w-0 flex-1 truncate font-medium text-ink">
                {character.name}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
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
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <form action={formAction} className="space-y-4">
      {initialValues?.id ? <input type="hidden" name="eventId" value={initialValues.id} /> : null}
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={text.title}>
          <Input required name="title" defaultValue={initialValues?.title ?? ""} />
        </Field>
        <Field label={text.type}>
          <Select name="eventType" defaultValue={initialValues?.eventType ?? "SCENE"}>
            {eventTypeOptions.map((eventType) => (
              <option key={eventType} value={eventType}>
                {eventType}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label={text.description}>
        <Textarea name="description" defaultValue={initialValues?.description ?? ""} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={text.internalStart}>
          <Input
            required
            name="internalStart"
            type="datetime-local"
            defaultValue={toDateTimeLocal(initialValues?.internalStart)}
          />
        </Field>
        <Field label={text.internalEnd}>
          <Input
            required
            name="internalEnd"
            type="datetime-local"
            defaultValue={toDateTimeLocal(initialValues?.internalEnd)}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label={text.startLocation}>
          <Select name="startLocationId" defaultValue={initialValues?.startLocationId ?? ""}>
            <option value="">{text.noLocation}</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={text.endLocation}>
          <Select name="endLocationId" defaultValue={initialValues?.endLocationId ?? ""}>
            <option value="">{text.noLocation}</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={text.chapterOrEpisode}>
          <Input
            name="chapterOrEpisode"
            defaultValue={initialValues?.chapterOrEpisode ?? ""}
          />
        </Field>
        <Field label={text.narrativeOrder}>
          <Input
            name="narrativeOrder"
            type="number"
            step="1"
            defaultValue={initialValues?.narrativeOrder ?? ""}
          />
        </Field>
      </div>

      <EventCharacterSelector
        characters={characters}
        initialSelectedCharacterIds={initialValues?.selectedCharacterIds ?? []}
      />

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
