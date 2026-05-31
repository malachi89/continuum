import { haversineKm } from "@/lib/continuity/distance";
import type {
  AnalyzableCharacter,
  AnalyzableEvent,
  AnalyzableLocation,
  AnalyzableProject,
  ContinuityResult,
} from "@/lib/continuity/types";

const NON_LITERAL_RETURN_EVENT_TYPES = new Set(["FLASHBACK", "DREAM", "VISION"]);

function formatDate(value: string) {
  return new Date(value).toISOString();
}

function formatDistance(value: number) {
  return `${Math.round(value)} km`;
}

function formatDurationHours(value: number) {
  if (value < 1) {
    return `${Math.round(value * 60)} min`;
  }

  return `${value.toFixed(2)} h`;
}

function getLocationMap(locations: AnalyzableLocation[]) {
  return new Map(locations.map((location) => [location.id, location]));
}

function getCharacterMap(characters: AnalyzableCharacter[]) {
  return new Map(characters.map((character) => [character.id, character]));
}

function getEventLocation(
  event: AnalyzableEvent,
  locations: Map<string, AnalyzableLocation>,
  side: "start" | "end",
) {
  const locationId = side === "start" ? event.startLocationId : event.endLocationId;
  return locationId ? locations.get(locationId) ?? null : null;
}

function sortChronologically(events: AnalyzableEvent[]) {
  return [...events].sort(
    (left, right) =>
      new Date(left.internalStart).getTime() - new Date(right.internalStart).getTime(),
  );
}

export function analyzeProjectContinuity(project: AnalyzableProject): ContinuityResult[] {
  const results: ContinuityResult[] = [];
  const locationMap = getLocationMap(project.locations);
  const characterMap = getCharacterMap(project.characters);
  const eventsByCharacter = new Map<string, AnalyzableEvent[]>();

  for (const event of project.events) {
    const start = new Date(event.internalStart);
    const end = new Date(event.internalEnd);
    const startLocation = getEventLocation(event, locationMap, "start");
    const endLocation = getEventLocation(event, locationMap, "end");

    if (end.getTime() < start.getTime()) {
      results.push({
        severity: "ERROR",
        code: "EVENT_END_BEFORE_START",
        eventIds: [event.id],
        explanation: `"${event.title}" termina antes de iniciar (${formatDate(
          event.internalEnd,
        )} < ${formatDate(event.internalStart)}).`,
        suggestedFix: "Corrige el rango interno del evento o conviertelo en otro hito narrativo.",
      });
    }

    if (event.characterIds.length === 0) {
      results.push({
        severity: "WARNING",
        code: "SCENE_WITHOUT_CHARACTERS",
        eventIds: [event.id],
        explanation: `"${event.title}" no tiene personajes asignados.`,
        suggestedFix: "Asigna al menos un personaje relevante o marca por que la escena debe quedar vacia.",
      });
    }

    if (!startLocation && !endLocation) {
      results.push({
        severity: "WARNING",
        code: "SCENE_WITHOUT_LOCATION",
        eventIds: [event.id],
        explanation: `"${event.title}" no tiene locacion inicial ni final.`,
        suggestedFix: "Agrega una locacion o deja una nota editorial sobre la ausencia de espacio definido.",
      });
    }

    for (const characterId of event.characterIds) {
      const currentEvents = eventsByCharacter.get(characterId) ?? [];
      currentEvents.push(event);
      eventsByCharacter.set(characterId, currentEvents);
    }
  }

  for (const [characterId, events] of eventsByCharacter.entries()) {
    const character = characterMap.get(characterId);
    if (!character) {
      continue;
    }

    const orderedEvents = sortChronologically(events);

    for (const event of orderedEvents) {
      if (
        (character.status === "DEAD" || character.status === "MISSING") &&
        character.statusDateInternal &&
        !NON_LITERAL_RETURN_EVENT_TYPES.has(event.eventType)
      ) {
        const statusDate = new Date(character.statusDateInternal);
        const eventStart = new Date(event.internalStart);

        if (eventStart.getTime() > statusDate.getTime()) {
          results.push({
            severity: "ERROR",
            code: "CHARACTER_APPEARS_AFTER_STATUS",
            characterId,
            eventIds: [event.id],
            explanation: `${character.name} aparece en "${event.title}" despues de quedar ${character.status.toLowerCase()} desde ${formatDate(character.statusDateInternal)}.`,
            suggestedFix: "Revisa el estado del personaje, la fecha interna o marca la escena como flashback, dream o vision.",
          });
        }
      }
    }

    for (let index = 1; index < orderedEvents.length; index += 1) {
      const previousEvent = orderedEvents[index - 1];
      const currentEvent = orderedEvents[index];
      const previousStart = new Date(previousEvent.internalStart).getTime();
      const previousEnd = new Date(previousEvent.internalEnd).getTime();
      const currentStart = new Date(currentEvent.internalStart).getTime();
      const currentEnd = new Date(currentEvent.internalEnd).getTime();

      if (currentStart < previousEnd && currentEnd > previousStart) {
        const previousLocation = getEventLocation(previousEvent, locationMap, "end")
          ?? getEventLocation(previousEvent, locationMap, "start");
        const currentLocation = getEventLocation(currentEvent, locationMap, "start")
          ?? getEventLocation(currentEvent, locationMap, "end");
        const locationSuffix =
          previousLocation && currentLocation && previousLocation.id !== currentLocation.id
            ? ` Ocurre entre ${previousLocation.name} y ${currentLocation.name}.`
            : "";

        results.push({
          severity: "ERROR",
          code: "CHARACTER_OVERLAPPING_EVENTS",
          characterId,
          eventIds: [previousEvent.id, currentEvent.id],
          explanation: `${character.name} aparece en eventos traslapados: "${previousEvent.title}" y "${currentEvent.title}".${locationSuffix}`,
          suggestedFix: "Ajusta ventanas temporales o separa la participacion del personaje entre escenas compatibles.",
        });
      }

      const previousLocation = getEventLocation(previousEvent, locationMap, "end")
        ?? getEventLocation(previousEvent, locationMap, "start");
      const currentLocation = getEventLocation(currentEvent, locationMap, "start")
        ?? getEventLocation(currentEvent, locationMap, "end");

      if (
        previousLocation &&
        currentLocation &&
        previousLocation.id !== currentLocation.id &&
        currentEvent.eventType !== "TRAVEL"
      ) {
        results.push({
          severity: "WARNING",
          code: "CHARACTER_APPEARS_WITHOUT_TRAVEL",
          characterId,
          eventIds: [previousEvent.id, currentEvent.id],
          explanation: `${character.name} cambia de ${previousLocation.name} a ${currentLocation.name} antes de "${currentEvent.title}" sin un evento de viaje intermedio.`,
          suggestedFix: "Agrega un evento TRAVEL, ajusta locaciones o documenta el salto narrativo.",
        });
      }

      if (
        character.maxTravelMode !== "MAGIC_PORTAL" &&
        previousLocation &&
        currentLocation &&
        previousLocation.latitude !== null &&
        previousLocation.longitude !== null &&
        currentLocation.latitude !== null &&
        currentLocation.longitude !== null
      ) {
        const distanceKm = haversineKm(
          {
            latitude: previousLocation.latitude,
            longitude: previousLocation.longitude,
          },
          {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          },
        );
        const availableHours = (currentStart - previousEnd) / 3_600_000;
        const requiredSpeedKmh =
          availableHours > 0 ? distanceKm / availableHours : Number.POSITIVE_INFINITY;

        if (
          character.maxSpeedKmh !== null &&
          requiredSpeedKmh > character.maxSpeedKmh
        ) {
          results.push({
            severity: "ERROR",
            code: "IMPOSSIBLE_TRAVEL",
            characterId,
            eventIds: [previousEvent.id, currentEvent.id],
            explanation: `${character.name} pasa de ${previousLocation.name} a ${currentLocation.name} en ${formatDurationHours(
              Math.max(availableHours, 0),
            )}. La distancia aproximada es ${formatDistance(distanceKm)} y requeriria ${Math.round(
              requiredSpeedKmh,
            )} km/h.`,
            suggestedFix: "Amplia el tiempo disponible, cambia la locacion, incrementa la capacidad de viaje o usa MAGIC_PORTAL si forma parte del canon.",
          });
        }
      }
    }
  }

  return results;
}
