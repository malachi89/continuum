import type {
  AnalyzableCharacter,
  AnalyzableEvent,
  AnalyzableLocation,
  AnalyzableProject,
  ContinuityResult,
} from "@/lib/continuity/types";
import type { Language } from "@/lib/i18n/dictionary";

const NON_LITERAL_RETURN_EVENT_TYPES = new Set(["FLASHBACK", "DREAM", "VISION"]);

const copy = {
  es: {
    eventEndBeforeStart: (title: string, end: string, start: string) =>
      `"${title}" termina antes de iniciar (${end} < ${start}).`,
    eventEndBeforeStartFix: "Corrige el rango interno del evento o conviertelo en otro hito narrativo.",
    sceneWithoutCharacters: (title: string) => `"${title}" no tiene personajes asignados.`,
    sceneWithoutCharactersFix:
      "Asigna al menos un personaje relevante o marca por que la escena debe quedar vacia.",
    sceneWithoutLocation: (title: string) => `"${title}" no tiene locacion inicial ni final.`,
    sceneWithoutLocationFix:
      "Agrega una locacion o deja una nota editorial sobre la ausencia de espacio definido.",
    characterAfterStatus: (
      characterName: string,
      eventTitle: string,
      status: string,
      statusDate: string,
    ) =>
      `${characterName} aparece en "${eventTitle}" despues de quedar ${status} desde ${statusDate}.`,
    characterAfterStatusFix:
      "Revisa el estado del personaje, la fecha interna o marca la escena como flashback, dream o vision.",
    overlappingEvents: (
      characterName: string,
      previousTitle: string,
      currentTitle: string,
      locationSuffix: string,
    ) =>
      `${characterName} aparece en eventos traslapados: "${previousTitle}" y "${currentTitle}".${locationSuffix}`,
    overlappingEventsLocationSuffix: (previous: string, current: string) =>
      ` Ocurre entre ${previous} y ${current}.`,
    overlappingEventsFix:
      "Ajusta ventanas temporales o separa la participacion del personaje entre escenas compatibles.",
    characterWithoutTravel: (
      characterName: string,
      previousLocation: string,
      currentLocation: string,
      currentTitle: string,
    ) =>
      `${characterName} cambia de ${previousLocation} a ${currentLocation} antes de "${currentTitle}" sin un evento de viaje intermedio.`,
    characterWithoutTravelFix:
      "Agrega un evento TRAVEL, ajusta locaciones o documenta el salto narrativo.",
  },
  en: {
    eventEndBeforeStart: (title: string, end: string, start: string) =>
      `"${title}" ends before it starts (${end} < ${start}).`,
    eventEndBeforeStartFix: "Fix the event's internal range or turn it into another narrative beat.",
    sceneWithoutCharacters: (title: string) => `"${title}" has no assigned characters.`,
    sceneWithoutCharactersFix:
      "Assign at least one relevant character or note why the scene should remain empty.",
    sceneWithoutLocation: (title: string) => `"${title}" has no start or end location.`,
    sceneWithoutLocationFix:
      "Add a location or leave an editorial note about the missing space.",
    characterAfterStatus: (
      characterName: string,
      eventTitle: string,
      status: string,
      statusDate: string,
    ) =>
      `${characterName} appears in "${eventTitle}" after becoming ${status} since ${statusDate}.`,
    characterAfterStatusFix:
      "Review the character status, internal date, or mark the scene as a flashback, dream, or vision.",
    overlappingEvents: (
      characterName: string,
      previousTitle: string,
      currentTitle: string,
      locationSuffix: string,
    ) =>
      `${characterName} appears in overlapping events: "${previousTitle}" and "${currentTitle}".${locationSuffix}`,
    overlappingEventsLocationSuffix: (previous: string, current: string) =>
      ` It happens between ${previous} and ${current}.`,
    overlappingEventsFix:
      "Adjust the time windows or separate the character's participation between compatible scenes.",
    characterWithoutTravel: (
      characterName: string,
      previousLocation: string,
      currentLocation: string,
      currentTitle: string,
    ) =>
      `${characterName} moves from ${previousLocation} to ${currentLocation} before "${currentTitle}" without an intermediate travel event.`,
    characterWithoutTravelFix:
      "Add a TRAVEL event, adjust locations, or document the narrative jump.",
  },
} as const;

function formatDate(value: string) {
  return new Date(value).toISOString();
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

export function analyzeProjectContinuity(
  project: AnalyzableProject,
  language: Language = "es",
): ContinuityResult[] {
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
        explanation: copy[language].eventEndBeforeStart(
          event.title,
          formatDate(event.internalEnd),
          formatDate(event.internalStart),
        ),
        suggestedFix: copy[language].eventEndBeforeStartFix,
      });
    }

    if (event.characterIds.length === 0) {
      results.push({
        severity: "WARNING",
        code: "SCENE_WITHOUT_CHARACTERS",
        eventIds: [event.id],
        explanation: copy[language].sceneWithoutCharacters(event.title),
        suggestedFix: copy[language].sceneWithoutCharactersFix,
      });
    }

    if (!startLocation && !endLocation) {
      results.push({
        severity: "WARNING",
        code: "SCENE_WITHOUT_LOCATION",
        eventIds: [event.id],
        explanation: copy[language].sceneWithoutLocation(event.title),
        suggestedFix: copy[language].sceneWithoutLocationFix,
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
            explanation: copy[language].characterAfterStatus(
              character.name,
              event.title,
              character.status.toLowerCase(),
              formatDate(character.statusDateInternal),
            ),
            suggestedFix: copy[language].characterAfterStatusFix,
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
            ? copy[language].overlappingEventsLocationSuffix(
                previousLocation.name,
                currentLocation.name,
              )
            : "";

        results.push({
          severity: "ERROR",
          code: "CHARACTER_OVERLAPPING_EVENTS",
          characterId,
          eventIds: [previousEvent.id, currentEvent.id],
          explanation: copy[language].overlappingEvents(
            character.name,
            previousEvent.title,
            currentEvent.title,
            locationSuffix,
          ),
          suggestedFix: copy[language].overlappingEventsFix,
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
          explanation: copy[language].characterWithoutTravel(
            character.name,
            previousLocation.name,
            currentLocation.name,
            currentEvent.title,
          ),
          suggestedFix: copy[language].characterWithoutTravelFix,
        });
      }
    }
  }

  return results;
}
