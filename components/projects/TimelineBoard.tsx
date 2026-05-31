"use client";

import clsx from "clsx";
import { AlertTriangle, CircleAlert } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeCharacterFromEventAction } from "@/app/(app)/projects/actions";
import type {
  TimelineBoardMode,
  TimelineScale,
  TimelineCharacterOption,
  TimelineEventCard,
  TimelineHistogramItem,
} from "@/lib/continuity/timeline";
import {
  buildTimelineAxisTicks,
  buildTimelineHistogramTracks,
  buildTimelineRange,
  indexContinuityResultsByEvent,
  getTimelineWidth,
} from "@/lib/continuity/timeline";
import type { ContinuityResult } from "@/lib/continuity/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

type TimelineBoardProps = {
  projectId: string;
  characters: TimelineCharacterOption[];
  events: TimelineEventCard[];
  continuityResults: ContinuityResult[];
};

type SortMode = "chronological" | "narrative";
type Feedback = {
  tone: "info" | "error" | "success";
  message: string;
};

const TRACK_LABEL_WIDTH = 220;
const TRACK_CARD_HEIGHT = 152;
const TRACK_LANE_GAP = 12;
const TRACK_VERTICAL_PADDING = 12;
const TIMELINE_SCALE_STORAGE_KEY = "continuum.timelineScale";
const TIMELINE_END_GAP = 64;

const viewOptions: Array<{ value: TimelineBoardMode; label: string }> = [
  { value: "character", label: "Personajes" },
  { value: "location", label: "Lugares" },
];

const zoomOptions: Array<{ value: TimelineScale; label: string }> = [
  { value: "hours", label: "Horas" },
  { value: "days", label: "Días" },
  { value: "weeks", label: "Semanas" },
];

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getTrackLaneTop(laneIndex: number) {
  return TRACK_VERTICAL_PADDING + laneIndex * (TRACK_CARD_HEIGHT + TRACK_LANE_GAP);
}

function getTrackHeight(laneCount: number) {
  return (
    TRACK_VERTICAL_PADDING * 2 +
    laneCount * TRACK_CARD_HEIGHT +
    Math.max(0, laneCount - 1) * TRACK_LANE_GAP
  );
}

function getLocationLabel(event: TimelineEventCard) {
  if (
    event.startLocation &&
    event.endLocation &&
    event.startLocation.id !== event.endLocation.id
  ) {
    return `${event.startLocation.name} -> ${event.endLocation.name}`;
  }

  return event.startLocation?.name ?? event.endLocation?.name ?? "Sin locacion";
}

function getContinuityTone(results: ContinuityResult[]) {
  if (results.some((result) => result.severity === "ERROR")) {
    return "error";
  }

  if (results.some((result) => result.severity === "WARNING")) {
    return "warning";
  }

  return "note";
}

function getContinuityLabel(results: ContinuityResult[]) {
  return results
    .map((result) => `${result.severity}: ${result.explanation}`)
    .join("\n");
}

function getViewHeader(mode: TimelineBoardMode) {
  if (mode === "location") {
    return "Lugar";
  }

  return "Personaje";
}

function getEventLocations(event: TimelineEventCard) {
  return [event.startLocation, event.endLocation].filter(
    (location): location is { id: string; name: string } => location !== null,
  );
}

function getInitialTimelineScale(): TimelineScale {
  if (typeof window === "undefined") {
    return "hours";
  }

  const storedScale = window.localStorage.getItem(TIMELINE_SCALE_STORAGE_KEY);

  if (storedScale === "hours" || storedScale === "days" || storedScale === "weeks") {
    return storedScale;
  }

  return "hours";
}

function ContinuityMarker({ results }: { results: ContinuityResult[] }) {
  if (results.length === 0) {
    return null;
  }

  const tone = getContinuityTone(results);
  const label = getContinuityLabel(results);
  const Icon = tone === "error" ? AlertTriangle : CircleAlert;

  return (
    <div
      tabIndex={0}
      title={label}
      aria-label={label}
      className={clsx(
        "group absolute right-2 top-2 z-10 rounded-full border p-1 outline-none transition",
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : tone === "warning"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-line bg-canvas text-muted",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <div className="pointer-events-none absolute right-0 top-7 hidden w-72 rounded-[14px] border border-line bg-surface p-3 text-left text-xs leading-5 text-ink shadow-[0_18px_50px_rgba(91,71,36,0.18)] group-hover:block group-focus:block">
        {results.slice(0, 3).map((result, index) => (
          <p
            key={`${result.code}-${result.eventIds.join("-")}`}
            className={index > 0 ? "mt-2" : undefined}
          >
            <span className="font-semibold">{result.severity}</span> {result.explanation}
          </p>
        ))}
      </div>
    </div>
  );
}

function HistogramEventBlock({
  item,
  projectId,
  onRemove,
  busyKey,
  continuityResults,
}: {
  item: TimelineHistogramItem;
  projectId: string;
  onRemove: (eventId: string, characterId: string) => void;
  busyKey: string | null;
  continuityResults: ContinuityResult[];
}) {
  const event = item.event;

  return (
    <article
      style={{
        left: `${item.offsetPercent}%`,
        top: `${getTrackLaneTop(item.laneIndex)}px`,
        width: `${item.widthPercent}%`,
        height: `${TRACK_CARD_HEIGHT}px`,
        minWidth: "13rem",
      }}
      className="absolute overflow-visible rounded-[18px] border border-line bg-surface p-3 pr-9 text-left shadow-sm"
    >
      <ContinuityMarker results={continuityResults} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="accent">{event.eventType}</Badge>
          {event.chapterOrEpisode ? <Badge>{event.chapterOrEpisode}</Badge> : null}
          {event.narrativeOrder !== null ? (
            <Badge tone="success">#{event.narrativeOrder}</Badge>
          ) : null}
        </div>
        <Link
          href={`/projects/${projectId}/events/${event.id}`}
          className="mt-2 block truncate text-sm font-semibold text-ink hover:text-accent"
        >
          {event.title}
        </Link>
        <p className="mt-1 truncate text-xs text-muted">{getLocationLabel(event)}</p>
        <p className="mt-1 truncate text-[0.7rem] text-muted">
          {formatEventDate(event.internalStartIso)} {"->"}{" "}
          {formatEventDate(event.internalEndIso)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {event.characters.length === 0 ? (
          <Badge>Sin personajes</Badge>
        ) : (
          event.characters.map((character) => {
            const removeKey = `${event.id}:${character.id}`;
            const removing = busyKey === removeKey;

            return (
              <div
                key={character.id}
                className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-line bg-canvas/80 px-2 py-1 text-[0.7rem]"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: character.color }}
                />
                <Link
                  href={`/projects/${projectId}/characters/${character.id}`}
                  className="max-w-24 truncate font-medium text-ink hover:text-accent"
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
  continuityResults,
}: TimelineBoardProps) {
  const router = useRouter();
  const [boardMode, setBoardMode] = useState<TimelineBoardMode>("character");
  const [timelineScale, setTimelineScale] = useState<TimelineScale>(getInitialTimelineScale);
  const [sortMode, setSortMode] = useState<SortMode>("chronological");
  const [characterFilter, setCharacterFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");
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

  const locationOptions = useMemo(() => {
    const locations = new Map<string, { id: string; name: string }>();

    for (const event of timelineEvents) {
      for (const location of getEventLocations(event)) {
        locations.set(location.id, location);
      }
    }

    return [...locations.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [timelineEvents]);

  const filteredEvents = useMemo(() => {
    const filtered = timelineEvents.filter((event) => {
      if (characterFilter !== "all" && !event.characterIds.includes(characterFilter)) {
        return false;
      }

      if (
        locationFilter !== "all" &&
        !getEventLocations(event).some((location) => location.id === locationFilter)
      ) {
        return false;
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

  const filteredCharacters = useMemo(
    () =>
      characterFilter === "all"
        ? characters
        : characters.filter((character) => character.id === characterFilter),
    [characterFilter, characters],
  );

  const timelineRange = useMemo(() => buildTimelineRange(filteredEvents), [filteredEvents]);
  const continuityResultsByEvent = useMemo(
    () => indexContinuityResultsByEvent(continuityResults),
    [continuityResults],
  );
  const timelineWidth = timelineRange ? getTimelineWidth(timelineRange, timelineScale) : 0;
  const timelineCanvasWidth = timelineWidth + TIMELINE_END_GAP;
  const axisTicks = timelineRange ? buildTimelineAxisTicks(timelineRange, timelineScale) : [];
  const activeZoomLabel =
    zoomOptions.find((option) => option.value === timelineScale)?.label ?? "Horas";
  const histogramTracks = useMemo(() => {
    if (!timelineRange) {
      return [];
    }

    return buildTimelineHistogramTracks({
      mode: boardMode,
      characters: filteredCharacters,
      events: filteredEvents,
      range: timelineRange,
    }).filter((track) => track.events.length > 0 || characterFilter !== "all");
  }, [boardMode, characterFilter, filteredCharacters, filteredEvents, timelineRange]);

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

  function handleTimelineScaleChange(nextScale: TimelineScale) {
    setTimelineScale(nextScale);
    window.localStorage.setItem(TIMELINE_SCALE_STORAGE_KEY, nextScale);
  }

  return (
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
          <div className="min-w-56">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Vista
            </p>
            <div className="flex flex-wrap gap-2">
              {viewOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={boardMode === option.value ? "primary" : "secondary"}
                  onClick={() => setBoardMode(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="min-w-44">
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

          <div className="min-w-44">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Zoom
            </p>
            <div className="flex flex-wrap gap-2">
              {zoomOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={timelineScale === option.value ? "primary" : "secondary"}
                  onClick={() => handleTimelineScaleChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <label className="min-w-40">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Personaje
            </span>
            <Select
              value={characterFilter}
              onChange={(event) => setCharacterFilter(event.target.value)}
            >
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
              Lugar
            </span>
            <Select
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
            >
              <option value="all">Todos</option>
              {locationOptions.map((location) => (
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
            <Select
              value={chapterFilter}
              onChange={(event) => setChapterFilter(event.target.value)}
            >
              <option value="all">Todos</option>
              {chapterOptions.map((chapter) => (
                <option key={chapter} value={chapter}>
                  {chapter}
                </option>
              ))}
            </Select>
          </label>

          <div className="ml-auto flex flex-wrap gap-2">
            <Badge tone="accent">{filteredEvents.length} eventos</Badge>
            <Badge>{histogramTracks.length} filas</Badge>
            <Badge tone="success">{locationOptions.length} lugares</Badge>
            <Badge>Zoom: {activeZoomLabel}</Badge>
          </div>
        </div>
      </section>

      <section className="min-w-0">
        {filteredEvents.length === 0 || !timelineRange ? (
          <div className="rounded-[28px] border border-dashed border-line bg-surface p-6 text-sm text-muted">
            Ningún evento coincide con los filtros actuales.
          </div>
        ) : histogramTracks.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-line bg-surface p-6 text-sm text-muted">
            No hay filas con eventos para los filtros actuales.
          </div>
        ) : (
          <div className="overflow-auto rounded-[28px] border border-line bg-surface">
            <div style={{ minWidth: TRACK_LABEL_WIDTH + timelineCanvasWidth }}>
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `${TRACK_LABEL_WIDTH}px ${timelineCanvasWidth}px`,
                }}
              >
                <div className="sticky left-0 z-20 border-b border-r border-line bg-surface p-4">
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                    {getViewHeader(boardMode)}
                  </p>
                </div>
                <div className="flex h-16 border-b border-line bg-canvas/60">
                  <div className="relative shrink-0" style={{ width: timelineWidth }}>
                    {axisTicks.map((tick) => (
                      <div
                        key={tick.id}
                        className="absolute top-0 h-full border-l border-line/70"
                        style={{ left: `${tick.leftPercent}%` }}
                      >
                        <span className="absolute left-2 top-4 whitespace-nowrap text-xs text-muted">
                          {tick.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div aria-hidden="true" className="shrink-0" style={{ width: TIMELINE_END_GAP }} />
                </div>

                {histogramTracks.map((track) => {
                  const trackHeight = getTrackHeight(track.laneCount);

                  return (
                    <div key={`${track.kind}-${track.id}`} className="contents">
                      <div
                        className="sticky left-0 z-10 border-b border-r border-line bg-surface p-4"
                        style={{ height: trackHeight }}
                      >
                        <div className="flex items-center gap-3">
                          {track.color ? (
                            <span
                              className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                              style={{ backgroundColor: track.color }}
                            />
                          ) : (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-canvas text-[0.65rem] font-semibold text-muted">
                              {track.kind === "location" ? "LU" : "PE"}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink">
                              {track.label}
                            </p>
                            <p className="truncate text-xs text-muted">
                              {track.meta ?? `${track.events.length} eventos`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex border-b border-line bg-canvas/35" style={{ height: trackHeight }}>
                        <div className="relative shrink-0" style={{ width: timelineWidth }}>
                          {axisTicks.map((tick) => (
                            <div
                              key={`${track.id}-${tick.id}`}
                              className="absolute top-0 h-full border-l border-line/40"
                              style={{ left: `${tick.leftPercent}%` }}
                            />
                          ))}
                          {track.events.map((item) => (
                            <HistogramEventBlock
                              key={`${track.kind}-${track.id}-${item.event.id}-${item.laneIndex}`}
                              item={item}
                              projectId={projectId}
                              onRemove={handleRemove}
                              busyKey={busyKey}
                              continuityResults={continuityResultsByEvent.get(item.event.id) ?? []}
                            />
                          ))}
                        </div>
                        <div aria-hidden="true" className="shrink-0" style={{ width: TIMELINE_END_GAP }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
