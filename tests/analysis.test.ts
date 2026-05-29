import { describe, expect, it } from "vitest";
import { analyzeProjectContinuity } from "@/lib/continuity/analyze";
import type { AnalyzableProject } from "@/lib/continuity/types";

function createBaseProject(): AnalyzableProject {
  return {
    id: "project-1",
    title: "Demo: Viaje Imposible",
    type: "NOVEL",
    characters: [
      {
        id: "char-1",
        name: "Bruno",
        alias: null,
        color: "#E85D04",
        maxTravelMode: "CAR",
        maxSpeedKmh: 80,
        status: "UNKNOWN",
        statusDateInternal: null,
      },
    ],
    locations: [
      {
        id: "loc-cdmx",
        name: "Ciudad de Mexico",
        type: "CITY",
        latitude: 19.4326,
        longitude: -99.1332,
      },
      {
        id: "loc-tokyo",
        name: "Tokio",
        type: "CITY",
        latitude: 35.6762,
        longitude: 139.6503,
      },
    ],
    events: [
      {
        id: "event-1",
        title: "Bruno en Ciudad de Mexico",
        eventType: "SCENE",
        description: null,
        chapterOrEpisode: "Cap 1",
        narrativeOrder: 1,
        internalStart: "2026-01-01T14:03:00.000Z",
        internalEnd: "2026-01-01T14:03:00.000Z",
        startLocationId: "loc-cdmx",
        endLocationId: "loc-cdmx",
        characterIds: ["char-1"],
      },
      {
        id: "event-2",
        title: "Bruno en Tokio",
        eventType: "SCENE",
        description: null,
        chapterOrEpisode: "Cap 1",
        narrativeOrder: 2,
        internalStart: "2026-01-01T14:04:00.000Z",
        internalEnd: "2026-01-01T14:04:00.000Z",
        startLocationId: "loc-tokyo",
        endLocationId: "loc-tokyo",
        characterIds: ["char-1"],
      },
    ],
  };
}

describe("continuity analysis", () => {
  it("flags impossible travel in the demo project", () => {
    const results = analyzeProjectContinuity(createBaseProject());
    const impossibleTravel = results.find((result) => result.code === "IMPOSSIBLE_TRAVEL");

    expect(impossibleTravel).toBeDefined();
    expect(impossibleTravel?.severity).toBe("ERROR");
    expect(impossibleTravel?.explanation).toContain("distancia aproximada");
    expect(impossibleTravel?.explanation).toContain("requeriria");
  });

  it("warns about missing coordinates without crashing analysis", () => {
    const project = createBaseProject();
    project.locations[1] = {
      ...project.locations[1],
      latitude: null,
      longitude: null,
    };

    const results = analyzeProjectContinuity(project);
    expect(results.some((result) => result.code === "LOCATION_MISSING_COORDINATES")).toBe(true);
  });

  it("detects overlapping events for the same character", () => {
    const project = createBaseProject();
    project.events[1] = {
      ...project.events[1],
      internalStart: "2026-01-01T14:02:30.000Z",
      internalEnd: "2026-01-01T14:04:30.000Z",
    };

    const results = analyzeProjectContinuity(project);
    expect(results.some((result) => result.code === "CHARACTER_OVERLAPPING_EVENTS")).toBe(true);
  });

  it("flags a dead character appearing in a later literal scene", () => {
    const project = createBaseProject();
    project.characters[0] = {
      ...project.characters[0],
      status: "DEAD",
      statusDateInternal: "2026-01-01T14:03:30.000Z",
    };

    const results = analyzeProjectContinuity(project);
    expect(results.some((result) => result.code === "CHARACTER_APPEARS_AFTER_STATUS")).toBe(
      true,
    );
  });

  it("allows flashback-like returns for a dead character", () => {
    const project = createBaseProject();
    project.characters[0] = {
      ...project.characters[0],
      status: "DEAD",
      statusDateInternal: "2026-01-01T14:03:30.000Z",
    };
    project.events[1] = {
      ...project.events[1],
      eventType: "FLASHBACK",
    };

    const results = analyzeProjectContinuity(project);
    expect(results.some((result) => result.code === "CHARACTER_APPEARS_AFTER_STATUS")).toBe(
      false,
    );
  });

  it("flags events whose end is earlier than their start", () => {
    const project = createBaseProject();
    project.events[0] = {
      ...project.events[0],
      internalEnd: "2026-01-01T14:02:00.000Z",
    };

    const results = analyzeProjectContinuity(project);
    expect(results.some((result) => result.code === "EVENT_END_BEFORE_START")).toBe(true);
  });
});
