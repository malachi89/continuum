import { describe, expect, it } from "vitest";
import { buildCharacterTracking, buildTimelineEventCards } from "@/lib/continuity/timeline";

describe("timeline helpers", () => {
  const bruno = {
    id: "char-1",
    projectId: "project-1",
    name: "Bruno",
    alias: null,
    description: null,
    notes: null,
    color: "#E85D04",
    maxTravelMode: "CAR",
    maxSpeedKmh: 80,
    status: "UNKNOWN",
    statusDateInternal: null,
  };

  const eventA = {
    id: "event-a",
    projectId: "project-1",
    title: "Bruno en Ciudad de Mexico",
    description: null,
    internalStart: new Date("2026-01-01T14:03:00.000Z"),
    internalEnd: new Date("2026-01-01T14:03:00.000Z"),
    startLocationId: "loc-a",
    endLocationId: "loc-a",
    eventType: "SCENE",
    chapterOrEpisode: "Cap 1",
    narrativeOrder: 2,
    notes: null,
    startLocation: {
      id: "loc-a",
      projectId: "project-1",
      name: "Ciudad de Mexico",
      description: null,
      latitude: 19.4326,
      longitude: -99.1332,
      type: "CITY",
      notes: null,
    },
    endLocation: {
      id: "loc-a",
      projectId: "project-1",
      name: "Ciudad de Mexico",
      description: null,
      latitude: 19.4326,
      longitude: -99.1332,
      type: "CITY",
      notes: null,
    },
    characters: [
      {
        eventId: "event-a",
        characterId: "char-1",
        character: bruno,
      },
    ],
  };

  const eventB = {
    id: "event-b",
    projectId: "project-1",
    title: "Bruno en Tokio",
    description: null,
    internalStart: new Date("2026-01-01T14:04:00.000Z"),
    internalEnd: new Date("2026-01-01T14:04:00.000Z"),
    startLocationId: "loc-b",
    endLocationId: "loc-b",
    eventType: "SCENE",
    chapterOrEpisode: "Cap 1",
    narrativeOrder: 1,
    notes: null,
    startLocation: {
      id: "loc-b",
      projectId: "project-1",
      name: "Tokio",
      description: null,
      latitude: 35.6762,
      longitude: 139.6503,
      type: "CITY",
      notes: null,
    },
    endLocation: {
      id: "loc-b",
      projectId: "project-1",
      name: "Tokio",
      description: null,
      latitude: 35.6762,
      longitude: 139.6503,
      type: "CITY",
      notes: null,
    },
    characters: [
      {
        eventId: "event-b",
        characterId: "char-1",
        character: bruno,
      },
    ],
  };

  it("builds timeline cards with ids for filters and drag/drop", () => {
    const [card] = buildTimelineEventCards([eventA]);

    expect(card.id).toBe("event-a");
    expect(card.characterIds).toEqual(["char-1"]);
    expect(card.startLocation?.name).toBe("Ciudad de Mexico");
  });

  it("detects fast location jumps in character tracking", () => {
    const result = buildCharacterTracking([eventA, eventB]);

    expect(result.timeline).toHaveLength(2);
    expect(result.timeline[1]?.gapFromPreviousMinutes).toBe(1);
    expect(result.timeline[1]?.flags).toContain("Cambio de locacion");
    expect(result.conflicts.some((conflict) => conflict.id === "event-b-jump")).toBe(true);
  });
});
