"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  assignCharacterToEventAction,
  removeCharacterFromEventAction,
} from "@/app/(app)/projects/actions";
import type {
  TimelineCharacterOption,
  TimelineEventCard,
} from "@/lib/continuity/timeline";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

type TimelineBoardProps = {
  projectId: string;
  characters: TimelineCharacterOption[];
  events: TimelineEventCard[];
  availableLocations: Array<{ id: string; name: string }>;
};

type SortMode = "chronological" | "narrative";
type Feedback = {
  tone: "info" | "error" | "success";
  message: string;
};

const timelineCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  return pointerCollisions.length > 0 ? pointerCollisions : closestCenter(args);
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getDroppedEventId(event: DragEndEvent) {
  const dataEventId = event.over?.data.current?.eventId;

  if (typeof dataEventId === "string" && dataEventId.length > 0) {
    return dataEventId;
  }

  const overId = event.over?.id;

  if (typeof overId === "string" && overId.startsWith("event:")) {
    return overId.slice("event:".length);
  }

  return undefined;
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DraggableCharacterCard({
  character,
  active,
}: {
  character: TimelineCharacterOption;
  active?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `character:${character.id}`,
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
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        "flex w-full items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition",
        active || isDragging
          ? "border-accent bg-accent/10"
          : "border-line bg-surface hover:border-accent hover:bg-canvas/70",
      )}
    >
      <span
        className="h-3.5 w-3.5 rounded-full border border-black/10"
        style={{ backgroundColor: character.color }}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">
          {character.name}
        </span>
        <span className="block truncate text-xs text-muted">
          {character.alias ?? character.status}
        </span>
      </span>
    </button>
  );
}

function TimelineDropZone({
  event,
  projectId,
  onRemove,
  busyKey,
}: {
  event: TimelineEventCard;
  projectId: string;
  onRemove: (eventId: string, characterId: string) => void;
  busyKey: string | null;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `event:${event.id}`,
    data: {
      eventId: event.id,
    },
  });

  return (
    <article
      ref={setNodeRef}
      className={clsx(
        "rounded-[24px] border p-5 transition",
        isOver
          ? "border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(182,84,43,0.12)]"
          : "border-line bg-surface",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <Badge tone="accent">{event.eventType}</Badge>
            {event.narrativeOrder !== null ? (
              <Badge tone="success">Orden {event.narrativeOrder}</Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-muted">
            {formatEventDate(event.internalStartIso)} {"->"}{" "}
            {formatEventDate(event.internalEndIso)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {event.chapterOrEpisode ? <Badge>{event.chapterOrEpisode}</Badge> : null}
          {event.startLocation ? <Badge>{event.startLocation.name}</Badge> : null}
          {event.endLocation && event.endLocation.id !== event.startLocation?.id ? (
            <Badge>{event.endLocation.name}</Badge>
          ) : null}
        </div>
      </div>

      {event.description ? (
        <p className="mt-3 text-sm leading-6 text-muted">{event.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {event.characters.length === 0 ? (
          <Badge>Arrastra personajes aqui</Badge>
        ) : (
          event.characters.map((character) => {
            const removeKey = `${event.id}:${character.id}`;
            const removing = busyKey === removeKey;

            return (
              <div
                key={character.id}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas/80 px-3 py-1.5 text-xs"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: character.color }}
                />
                <Link
                  href={`/projects/${projectId}/characters/${character.id}`}
                  className="font-medium text-ink hover:text-accent"
                >
                  {character.name}
                </Link>
                <button
                  type="button"
                  onClick={() => onRemove(event.id, character.id)}
                  disabled={removing}
                  className="rounded-full px-1 text-muted transition hover:text-accent disabled:opacity-50"
                  aria-label={`Quitar ${character.name} del evento ${event.title}`}
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}

export function TimelineBoard({
  projectId,
  characters,
  events,
  availableLocations,
}: TimelineBoardProps) {
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [sortMode, setSortMode] = useState<SortMode>("chronological");
  const [characterFilter, setCharacterFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [timelineEvents, setTimelineEvents] = useState(events);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [, startTransition] = useTransition();

  const chapterOptions = useMemo(() => {
    const chapters = new Set(
      timelineEvents
        .map((event) => event.chapterOrEpisode)
        .filter((value): value is string => Boolean(value)),
    );
    return [...chapters].sort((a, b) => a.localeCompare(b));
  }, [timelineEvents]);

  const filteredEvents = useMemo(() => {
    const filtered = timelineEvents.filter((event) => {
      if (characterFilter !== "all" && !event.characterIds.includes(characterFilter)) {
        return false;
      }

      if (locationFilter !== "all") {
        const matchStart = event.startLocation?.id === locationFilter;
        const matchEnd = event.endLocation?.id === locationFilter;
        if (!matchStart && !matchEnd) {
          return false;
        }
      }

      if (chapterFilter !== "all" && event.chapterOrEpisode !== chapterFilter) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((left, right) => {
      if (sortMode === "narrative") {
        const leftNarrative = left.narrativeOrder ?? Number.MAX_SAFE_INTEGER;
        const rightNarrative = right.narrativeOrder ?? Number.MAX_SAFE_INTEGER;

        if (leftNarrative !== rightNarrative) {
          return leftNarrative - rightNarrative;
        }
      }

      return (
        new Date(left.internalStartIso).getTime() -
        new Date(right.internalStartIso).getTime()
      );
    });
  }, [chapterFilter, characterFilter, locationFilter, sortMode, timelineEvents]);

  const activeCharacter =
    activeCharacterId === null
      ? null
      : characters.find((character) => character.id === activeCharacterId) ?? null;

  function handleAssign(characterId: string, eventId: string) {
    const key = `${eventId}:${characterId}`;
    const targetEvent = timelineEvents.find((event) => event.id === eventId);
    const character = characters.find((currentCharacter) => currentCharacter.id === characterId);

    if (!targetEvent || !character) {
      setFeedback({
        tone: "error",
        message: "No pudimos identificar el evento o personaje seleccionado.",
      });
      return;
    }

    if (targetEvent.characterIds.includes(characterId)) {
      return;
    }

    const previousEvents = timelineEvents;

    setBusyKey(key);
    setFeedback({ tone: "info", message: "Asignando personaje al evento..." });
    setTimelineEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              characterIds: [...event.characterIds, characterId],
              characters: [
                ...event.characters,
                {
                  id: character.id,
                  name: character.name,
                  alias: character.alias,
                  color: character.color,
                },
              ],
            }
          : event,
      ),
    );

    startTransition(async () => {
      try {
        await assignCharacterToEventAction({ projectId, eventId, characterId });
        setFeedback({ tone: "success", message: "Personaje asignado al evento." });
        router.refresh();
      } catch (error) {
        setTimelineEvents(previousEvents);
        setFeedback({
          tone: "error",
          message: getErrorMessage(error, "No pudimos asignar el personaje al evento."),
        });
      } finally {
        setBusyKey(null);
      }
    });
  }

  function handleRemove(eventId: string, characterId: string) {
    const key = `${eventId}:${characterId}`;
    const previousEvents = timelineEvents;

    setBusyKey(key);
    setFeedback({ tone: "info", message: "Quitando personaje del evento..." });
    setTimelineEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              characterIds: event.characterIds.filter((id) => id !== characterId),
              characters: event.characters.filter((character) => character.id !== characterId),
            }
          : event,
      ),
    );

    startTransition(async () => {
      try {
        await removeCharacterFromEventAction({ projectId, eventId, characterId });
        setFeedback({ tone: "success", message: "Personaje quitado del evento." });
        router.refresh();
      } catch (error) {
        setTimelineEvents(previousEvents);
        setFeedback({
          tone: "error",
          message: getErrorMessage(error, "No pudimos quitar el personaje del evento."),
        });
      } finally {
        setBusyKey(null);
      }
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCharacterId(null);

    const characterId = event.active.data.current?.characterId as string | undefined;
    const eventId = getDroppedEventId(event);

    if (!characterId || !eventId) {
      return;
    }

    handleAssign(characterId, eventId);
  }

  return (
    <DndContext
      collisionDetection={timelineCollisionDetection}
      sensors={sensors}
      onDragStart={(event) => {
        const characterId = event.active.data.current?.characterId as string | undefined;
        setActiveCharacterId(characterId ?? null);
      }}
      onDragCancel={() => setActiveCharacterId(null)}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {feedback ? (
          <div
            className={clsx(
              "rounded-[18px] border px-4 py-3 text-sm",
              feedback.tone === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : feedback.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-line bg-canvas text-muted",
            )}
            role={feedback.tone === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {feedback.message}
          </div>
        ) : null}

        <section className="rounded-[28px] border border-line bg-surface p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-44 flex-1">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Orden
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={sortMode === "chronological" ? "primary" : "secondary"}
                  onClick={() => setSortMode("chronological")}
                >
                  Cronológico
                </Button>
                <Button
                  type="button"
                  variant={sortMode === "narrative" ? "primary" : "secondary"}
                  onClick={() => setSortMode("narrative")}
                >
                  Narrativo
                </Button>
              </div>
            </div>

            <label className="min-w-40">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Personaje
              </span>
              <Select value={characterFilter} onChange={(event) => setCharacterFilter(event.target.value)}>
                <option value="all">Todos</option>
                {characters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </Select>
            </label>

            <label className="min-w-40">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Locacion
              </span>
              <Select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                <option value="all">Todas</option>
                {availableLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </Select>
            </label>

            <label className="min-w-40">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Capitulo
              </span>
              <Select value={chapterFilter} onChange={(event) => setChapterFilter(event.target.value)}>
                <option value="all">Todos</option>
                {chapterOptions.map((chapter) => (
                  <option key={chapter} value={chapter}>
                    {chapter}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                  Paleta
                </p>
                <h3 className="mt-2 text-lg font-semibold">Personajes arrastrables</h3>
              </div>
              <Badge>{characters.length}</Badge>
            </div>

            <div className="mt-5 space-y-3">
              {characters.map((character) => (
                <DraggableCharacterCard
                  key={character.id}
                  character={character}
                  active={activeCharacterId === character.id}
                />
              ))}
            </div>
          </aside>

          <section className="space-y-4">
              {filteredEvents.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-line bg-surface p-6 text-sm text-muted">
                Ningún evento coincide con los filtros actuales.
              </div>
            ) : (
              filteredEvents.map((event) => (
                <TimelineDropZone
                  key={event.id}
                  event={event}
                  projectId={projectId}
                  onRemove={handleRemove}
                  busyKey={busyKey}
                />
              ))
            )}
          </section>
        </div>
      </div>

      <DragOverlay>
        {activeCharacter ? (
          <div className="w-64 rounded-[20px] border border-accent bg-surface p-3 shadow-[0_18px_50px_rgba(91,71,36,0.18)]">
            <div className="flex items-center gap-3">
              <span
                className="h-3.5 w-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: activeCharacter.color }}
              />
              <div>
                <p className="text-sm font-semibold text-ink">{activeCharacter.name}</p>
                <p className="text-xs text-muted">
                  Suelta sobre un evento para asignarlo
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
