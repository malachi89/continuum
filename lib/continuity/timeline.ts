import type {
  Character,
  Event,
  EventCharacter,
  Location,
} from "@prisma/client";

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
