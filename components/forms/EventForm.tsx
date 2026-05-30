"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Event, EventType } from "@prisma/client";
import clsx from "clsx";
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
type CharacterColumn = "available" | "selected";

function toDateTimeLocal(value?: Date | string | null) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function getDropColumn(event: DragEndEvent) {
  const column = event.over?.data.current?.column;

  if (column === "available" || column === "selected") {
    return column;
  }

  return undefined;
}

function DraggableCharacterCard({
  character,
  active,
}: {
  character: CharacterOption;
  active?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event-character:${character.id}`,
    data: {
      characterId: character.id,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        "flex cursor-grab touch-none select-none items-center gap-3 rounded-2xl border px-3 py-2 text-sm transition active:cursor-grabbing",
        active || isDragging
          ? "border-accent bg-accent/10"
          : "border-line bg-surface/80 hover:border-accent hover:bg-surface",
        isDragging && "opacity-0",
      )}
    >
      <span
        className="h-3 w-3 rounded-full border border-black/10"
        style={{ backgroundColor: character.color }}
      />
      <span className="min-w-0 flex-1 truncate font-medium text-ink">
        {character.name}
      </span>
    </div>
  );
}

function CharacterDropColumn({
  title,
  count,
  column,
  characters,
  emptyLabel,
  activeCharacterId,
}: {
  title: string;
  count: number;
  column: CharacterColumn;
  characters: CharacterOption[];
  emptyLabel: string;
  activeCharacterId: string | null;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `event-character-column:${column}`,
    data: {
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "min-h-48 rounded-[22px] border p-4 transition",
        isOver ? "border-accent bg-accent/10" : "border-line bg-canvas/50",
      )}
    >
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
            <DraggableCharacterCard
              key={character.id}
              character={character}
              active={activeCharacterId === character.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function EventCharacterSelector({
  characters,
  initialSelectedCharacterIds = [],
}: {
  characters: CharacterOption[];
  initialSelectedCharacterIds?: string[];
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [selectedCharacterIds, setSelectedCharacterIds] = useState(() => {
    const initialIds = new Set(initialSelectedCharacterIds);
    return characters
      .filter((character) => initialIds.has(character.id))
      .map((character) => character.id);
  });
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);

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
  const activeCharacter =
    activeCharacterId === null
      ? null
      : characters.find((character) => character.id === activeCharacterId) ?? null;

  function moveCharacter(characterId: string, column: CharacterColumn) {
    setSelectedCharacterIds((currentIds) => {
      const isSelected = currentIds.includes(characterId);

      if (column === "selected" && !isSelected) {
        return [...currentIds, characterId];
      }

      if (column === "available" && isSelected) {
        return currentIds.filter((id) => id !== characterId);
      }

      return currentIds;
    });
  }

  function handleCharacterDragEnd(event: DragEndEvent) {
    setActiveCharacterId(null);

    const characterId = event.active.data.current?.characterId;
    const column = getDropColumn(event);

    if (typeof characterId !== "string" || !column) {
      return;
    }

    moveCharacter(characterId, column);
  }

  return (
    <div>
      <p className="mb-2 block text-sm font-medium text-ink">Personajes</p>
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
            Crea personajes primero para vincularlos a este evento.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={(event) => {
            const characterId = event.active.data.current?.characterId;
            setActiveCharacterId(typeof characterId === "string" ? characterId : null);
          }}
          onDragCancel={() => setActiveCharacterId(null)}
          onDragEnd={handleCharacterDragEnd}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <CharacterDropColumn
              title="Disponibles"
              count={availableCharacters.length}
              column="available"
              characters={availableCharacters}
              emptyLabel="No hay personajes disponibles."
              activeCharacterId={activeCharacterId}
            />
            <CharacterDropColumn
              title="Seleccionados"
              count={selectedCharacters.length}
              column="selected"
              characters={selectedCharacters}
              emptyLabel="Sin personajes seleccionados."
              activeCharacterId={activeCharacterId}
            />
          </div>

          <DragOverlay>
            {activeCharacter ? (
              <div className="flex w-64 items-center gap-3 rounded-2xl border border-accent bg-surface px-3 py-2 text-sm shadow-[0_18px_50px_rgba(91,71,36,0.18)]">
                <span
                  className="h-3 w-3 rounded-full border border-black/10"
                  style={{ backgroundColor: activeCharacter.color }}
                />
                <span className="truncate font-medium text-ink">
                  {activeCharacter.name}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
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

      <EventCharacterSelector
        characters={characters}
        initialSelectedCharacterIds={initialValues?.selectedCharacterIds ?? []}
      />

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
