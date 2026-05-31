import type {
  Character,
  Event,
  EventCharacter,
  Location,
} from "@prisma/client";
import type { ContinuityResult } from "@/lib/continuity/types";

type EventWithRelations = Event & {
  startLocation: Location | null;
  endLocation: Location | null;
  characters: Array<
    EventCharacter & {
      character: Character;
    }
  >;
};

export type TimelineCharacterOption = Pick<
  Character,
  "id" | "name" | "alias" | "color" | "status"
>;

export type TimelineEventCard = {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  chapterOrEpisode: string | null;
  narrativeOrder: number | null;
  internalStartIso: string;
  internalEndIso: string;
  startLocation: { id: string; name: string } | null;
  endLocation: { id: string; name: string } | null;
  characterIds: string[];
  characters: Array<{
    id: string;
    name: string;
    alias: string | null;
    color: string;
  }>;
};

export type CharacterTrackingItem = {
  eventId: string;
  eventTitle: string;
  eventType: string;
  chapterOrEpisode: string | null;
  startLocationName: string | null;
  endLocationName: string | null;
  internalStartIso: string;
  internalEndIso: string;
  gapFromPreviousMinutes: number | null;
  gapLabel: string | null;
  flags: string[];
};

export type CharacterTrackingConflict = {
  id: string;
  severity: "info" | "warning";
  title: string;
  body: string;
};

export type TimelineRange = {
  startMs: number;
  endMs: number;
  durationMs: number;
};

export type TimelineScale = "hours" | "days" | "weeks";

export type TimelineAxisTick = {
  id: string;
  label: string;
  leftPercent: number;
};

export type TimelineHistogramItem = {
  event: TimelineEventCard;
  laneIndex: number;
  offsetPercent: number;
  widthPercent: number;
  startMs: number;
  endMs: number;
};

export type TimelineBoardMode = "character" | "location";

export type TimelineHistogramTrack = {
  id: string;
  kind: TimelineBoardMode;
  label: string;
  meta: string | null;
  color: string | null;
  laneCount: number;
  events: TimelineHistogramItem[];
};

const EMPTY_EVENT_TRACK_ID = "__unassigned-events__";
const EMPTY_LOCATION_TRACK_ID = "__unassigned-location__";
const MINIMUM_EVENT_WIDTH_PERCENT = 2;
const MINIMUM_RANGE_MS = 60 * 60 * 1000;
const MAX_TIMELINE_WIDTH = 7200;
const MAX_AXIS_TICKS = 7;

const TIMELINE_SCALE_CONFIG: Record<
  TimelineScale,
  {
    unitMs: number;
    pxPerUnit: number;
    minWidth: number;
  }
> = {
  hours: {
    unitMs: 60 * 60 * 1000,
    pxPerUnit: 72,
    minWidth: 960,
  },
  days: {
    unitMs: 24 * 60 * 60 * 1000,
    pxPerUnit: 160,
    minWidth: 320,
  },
  weeks: {
    unitMs: 7 * 24 * 60 * 60 * 1000,
    pxPerUnit: 220,
    minWidth: 240,
  },
};

function getEventStartMs(event: TimelineEventCard) {
  return new Date(event.internalStartIso).getTime();
}

function getEventEndMs(event: TimelineEventCard) {
  const startMs = getEventStartMs(event);
  const endMs = new Date(event.internalEndIso).getTime();

  return Math.max(startMs, endMs);
}

function getTimelineScaleConfig(scale: TimelineScale) {
  return TIMELINE_SCALE_CONFIG[scale];
}

function formatTimelineDateLabel(value: number) {
  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatTimelineHourLabel(value: number) {
  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTimelineTickLabel(value: number, scale: TimelineScale) {
  if (scale === "hours") {
    return formatTimelineHourLabel(value);
  }

  if (scale === "weeks") {
    return `Semana del ${formatTimelineDateLabel(value)}`;
  }

  return formatTimelineDateLabel(value);
}

function getTimelineScaleUnitCount(range: TimelineRange, scale: TimelineScale) {
  const { unitMs } = getTimelineScaleConfig(scale);
  return Math.max(1, Math.ceil(range.durationMs / unitMs));
}

function formatGapLabel(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours} h ${remainingMinutes} min`
      : `${hours} h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours > 0) {
    return `${days} d ${remainingHours} h`;
  }

  return `${days} d`;
}

export function buildTimelineEventCards(events: EventWithRelations[]): TimelineEventCard[] {
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    chapterOrEpisode: event.chapterOrEpisode,
    narrativeOrder: event.narrativeOrder,
    internalStartIso: event.internalStart.toISOString(),
    internalEndIso: event.internalEnd.toISOString(),
    startLocation: event.startLocation
      ? {
          id: event.startLocation.id,
          name: event.startLocation.name,
        }
      : null,
    endLocation: event.endLocation
      ? {
          id: event.endLocation.id,
          name: event.endLocation.name,
        }
      : null,
    characterIds: event.characters.map((link) => link.characterId),
    characters: event.characters.map((link) => ({
      id: link.character.id,
      name: link.character.name,
      alias: link.character.alias,
      color: link.character.color,
    })),
  }));
}

export function buildTimelineRange(events: TimelineEventCard[]): TimelineRange | null {
  if (events.length === 0) {
    return null;
  }

  const startMs = Math.min(...events.map(getEventStartMs));
  const latestEventEndMs = Math.max(...events.map(getEventEndMs));
  const endMs = latestEventEndMs > startMs ? latestEventEndMs : startMs + MINIMUM_RANGE_MS;

  return {
    startMs,
    endMs,
    durationMs: endMs - startMs,
  };
}

export function getTimelineWidth(range: TimelineRange, scale: TimelineScale) {
  const { pxPerUnit, minWidth } = getTimelineScaleConfig(scale);
  const unitCount = getTimelineScaleUnitCount(range, scale);
  const width = unitCount * pxPerUnit;

  return Math.max(minWidth, Math.min(MAX_TIMELINE_WIDTH, width));
}

export function buildTimelineAxisTicks(
  range: TimelineRange,
  scale: TimelineScale,
): TimelineAxisTick[] {
  const unitCount = getTimelineScaleUnitCount(range, scale);
  const step = Math.max(1, Math.ceil(unitCount / (MAX_AXIS_TICKS - 1)));
  const tickIndexes = new Set<number>();

  for (let index = 0; index <= unitCount; index += step) {
    tickIndexes.add(index);
  }

  tickIndexes.add(unitCount);

  return [...tickIndexes]
    .sort((left, right) => left - right)
    .map((unitIndex) => {
      const leftPercent = (unitIndex / unitCount) * 100;
      const value = range.startMs + unitIndex * getTimelineScaleConfig(scale).unitMs;

      return {
        id: `${range.startMs}-${scale}-${unitIndex}`,
        label: formatTimelineTickLabel(value, scale),
        leftPercent,
      };
    });
}

export function getTimelineEventPosition(
  event: TimelineEventCard,
  range: TimelineRange,
): Pick<TimelineHistogramItem, "offsetPercent" | "widthPercent" | "startMs" | "endMs"> {
  const startMs = getEventStartMs(event);
  const endMs = getEventEndMs(event);
  const rawOffset = ((startMs - range.startMs) / range.durationMs) * 100;
  const rawWidth = ((endMs - startMs) / range.durationMs) * 100;

  return {
    startMs,
    endMs,
    offsetPercent: Math.max(0, Math.min(100, rawOffset)),
    widthPercent: Math.max(MINIMUM_EVENT_WIDTH_PERCENT, Math.min(100, rawWidth)),
  };
}

function assignEventLanes(events: TimelineEventCard[], range: TimelineRange) {
  const laneEndTimes: number[] = [];

  return [...events]
    .sort((left, right) => getEventStartMs(left) - getEventStartMs(right))
    .map((event) => {
      const position = getTimelineEventPosition(event, range);
      const laneIndex = laneEndTimes.findIndex((endMs) => endMs <= position.startMs);
      const assignedLaneIndex = laneIndex >= 0 ? laneIndex : laneEndTimes.length;
      const occupiedUntilMs =
        position.endMs === position.startMs ? position.endMs + 1 : position.endMs;

      laneEndTimes[assignedLaneIndex] = occupiedUntilMs;

      return {
        event,
        laneIndex: assignedLaneIndex,
        ...position,
      };
    });
}

function createTrack(
  input: Omit<TimelineHistogramTrack, "laneCount" | "events"> & {
    events: TimelineEventCard[];
  },
  range: TimelineRange,
): TimelineHistogramTrack {
  const trackEvents = assignEventLanes(input.events, range);

  return {
    id: input.id,
    kind: input.kind,
    label: input.label,
    meta: input.meta,
    color: input.color,
    laneCount: Math.max(1, ...trackEvents.map((event) => event.laneIndex + 1)),
    events: trackEvents,
  };
}

function getUniqueEventLocations(event: TimelineEventCard) {
  const locations = [event.startLocation, event.endLocation].filter(
    (location): location is { id: string; name: string } => location !== null,
  );
  const uniqueLocations = new Map(locations.map((location) => [location.id, location]));

  return [...uniqueLocations.values()];
}

function buildCharacterTracks(
  characters: TimelineCharacterOption[],
  events: TimelineEventCard[],
  range: TimelineRange,
) {
  const tracks: TimelineHistogramTrack[] = characters.map((character) =>
    createTrack(
      {
        id: character.id,
        kind: "character",
        label: character.name,
        meta: character.alias ?? character.status,
        color: character.color,
        events: events.filter((event) => event.characterIds.includes(character.id)),
      },
      range,
    ),
  );

  const unassignedEvents = events.filter((event) => event.characterIds.length === 0);

  if (unassignedEvents.length > 0) {
    tracks.push(
      createTrack(
        {
          id: EMPTY_EVENT_TRACK_ID,
          kind: "character",
          label: "Sin personajes",
          meta: null,
          color: "#6a6257",
          events: unassignedEvents,
        },
        range,
      ),
    );
  }

  return tracks;
}

function buildLocationTracks(events: TimelineEventCard[], range: TimelineRange) {
  const locationsById = new Map<string, { id: string; name: string }>();

  for (const event of events) {
    for (const location of getUniqueEventLocations(event)) {
      locationsById.set(location.id, location);
    }
  }

  const tracks = [...locationsById.values()]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((location) =>
      createTrack(
        {
          id: location.id,
          kind: "location" as const,
          label: location.name,
          meta: "Locacion",
          color: null,
          events: events.filter((event) =>
            getUniqueEventLocations(event).some(
              (eventLocation) => eventLocation.id === location.id,
            ),
          ),
        },
        range,
      ),
    );

  const eventsWithoutLocations = events.filter(
    (event) => getUniqueEventLocations(event).length === 0,
  );

  if (eventsWithoutLocations.length > 0) {
    tracks.push(
      createTrack(
        {
          id: EMPTY_LOCATION_TRACK_ID,
          kind: "location",
          label: "Sin locacion",
          meta: null,
          color: "#6a6257",
          events: eventsWithoutLocations,
        },
        range,
      ),
    );
  }

  return tracks;
}

export function buildTimelineHistogramTracks(
  input: {
    mode: TimelineBoardMode;
    characters: TimelineCharacterOption[];
    events: TimelineEventCard[];
    range: TimelineRange;
  },
): TimelineHistogramTrack[] {
  if (input.mode === "location") {
    return buildLocationTracks(input.events, input.range);
  }

  return buildCharacterTracks(input.characters, input.events, input.range);
}

export function indexContinuityResultsByEvent(results: ContinuityResult[]) {
  const resultsByEvent = new Map<string, ContinuityResult[]>();

  for (const result of results) {
    for (const eventId of result.eventIds) {
      const eventResults = resultsByEvent.get(eventId) ?? [];
      eventResults.push(result);
      resultsByEvent.set(eventId, eventResults);
    }
  }

  return resultsByEvent;
}

export function buildCharacterTracking(
  events: EventWithRelations[],
): {
  timeline: CharacterTrackingItem[];
  conflicts: CharacterTrackingConflict[];
} {
  const timeline: CharacterTrackingItem[] = [];
  const conflicts: CharacterTrackingConflict[] = [];

  for (const [index, event] of events.entries()) {
    const previousEvent = index > 0 ? events[index - 1] : null;
    const gapMs = previousEvent
      ? event.internalStart.getTime() - previousEvent.internalEnd.getTime()
      : null;
    const gapMinutes = gapMs === null ? null : Math.round(gapMs / 60000);
    const flags: string[] = [];

    if (!event.startLocation && !event.endLocation) {
      flags.push("Sin locacion");
      conflicts.push({
        id: `${event.id}-missing-location`,
        severity: "info",
        title: "Evento sin locacion",
        body: `"${event.title}" no tiene locacion inicial ni final.`,
      });
    }

    if (gapMinutes !== null && gapMinutes < 0) {
      flags.push("Superposicion");
      conflicts.push({
        id: `${event.id}-overlap`,
        severity: "warning",
        title: "Eventos superpuestos",
        body: `"${event.title}" empieza antes de que termine "${previousEvent?.title}".`,
      });
    }

    if (
      previousEvent &&
      previousEvent.endLocation &&
      event.startLocation &&
      previousEvent.endLocation.id !== event.startLocation.id
    ) {
      flags.push("Cambio de locacion");

      if (gapMinutes !== null && gapMinutes <= 60) {
        conflicts.push({
          id: `${event.id}-jump`,
          severity: "warning",
          title: "Salto rapido entre locaciones",
          body: `"${previousEvent.title}" termina en ${previousEvent.endLocation.name} y "${event.title}" arranca en ${event.startLocation.name} con solo ${formatGapLabel(Math.max(gapMinutes, 0))}.`,
        });
      }
    }

    if (gapMinutes !== null && gapMinutes > 24 * 60) {
      flags.push("Hueco amplio");
    }

    timeline.push({
      eventId: event.id,
      eventTitle: event.title,
      eventType: event.eventType,
      chapterOrEpisode: event.chapterOrEpisode,
      startLocationName: event.startLocation?.name ?? null,
      endLocationName: event.endLocation?.name ?? null,
      internalStartIso: event.internalStart.toISOString(),
      internalEndIso: event.internalEnd.toISOString(),
      gapFromPreviousMinutes: gapMinutes,
      gapLabel: gapMinutes === null ? null : formatGapLabel(Math.abs(gapMinutes)),
      flags,
    });
  }

  return { timeline, conflicts };
}
