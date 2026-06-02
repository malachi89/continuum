import { describe, expect, it } from "vitest";
import {
  buildCharacterTracking,
  buildTimelineAxisTicks,
  buildTimelineEventCards,
  buildTimelineHistogramTracks,
  buildTimelineRange,
  collapseTimelineGaps,
  getTimelineWidth,
  indexContinuityResultsByEvent,
} from "@/lib/continuity/timeline";

describe("timeline helpers", () => {
  const bruno = {
    id: "char-1",
    projectId: "project-1",
    name: "Bruno",
    alias: null,
    description: null,
    notes: null,
    color: "#E85D04",
    status: "UNKNOWN",
    statusDateInternal: null,
  };

  const elena = {
    ...bruno,
    id: "char-2",
    name: "Elena",
    color: "#28665D",
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

  const eventC = {
    ...eventA,
    id: "event-c",
    title: "Elena en Ciudad de Mexico",
    internalStart: new Date("2026-01-01T14:03:30.000Z"),
    internalEnd: new Date("2026-01-01T14:05:00.000Z"),
    narrativeOrder: 3,
    characters: [
      {
        eventId: "event-c",
        characterId: "char-2",
        character: elena,
      },
    ],
  };

  const eventD = {
    ...eventA,
    id: "event-d",
    title: "Bruno dos dias despues",
    internalStart: new Date("2026-01-03T14:03:00.000Z"),
    internalEnd: new Date("2026-01-03T14:03:00.000Z"),
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

  it("builds a proportional timeline range from chronological event dates", () => {
    const cards = buildTimelineEventCards([eventB, eventA, eventC]);
    const range = buildTimelineRange(cards);

    expect(range?.startMs).toBe(new Date("2026-01-01T14:03:00.000Z").getTime());
    expect(range?.endMs).toBe(new Date("2026-01-01T14:05:00.000Z").getTime());
  });

  it("widens the canvas when the zoom level is finer", () => {
    const cards = buildTimelineEventCards([eventA, eventD]);
    const range = buildTimelineRange(cards);

    expect(range).not.toBeNull();

    const hoursWidth = getTimelineWidth(range!, "hours");
    const daysWidth = getTimelineWidth(range!, "days");
    const weeksWidth = getTimelineWidth(range!, "weeks");
    const monthsWidth = getTimelineWidth(range!, "months");
    const yearsWidth = getTimelineWidth(range!, "years");
    const milleniaWidth = getTimelineWidth(range!, "millenia");

    expect(hoursWidth).toBeGreaterThan(daysWidth);

    expect(weeksWidth).toBeGreaterThan(0);
    expect(monthsWidth).toBeGreaterThan(0);
    expect(yearsWidth).toBeGreaterThan(0);
    expect(milleniaWidth).toBeGreaterThan(0);
  });

  it("builds day ticks across whole-day intervals", () => {
    const cards = buildTimelineEventCards([eventA, eventD]);
    const range = buildTimelineRange(cards);

    expect(range).not.toBeNull();

    const ticks = buildTimelineAxisTicks(range!, "days");

    expect(ticks.map((tick) => tick.leftPercent)).toEqual([0, 50, 100]);
    expect(ticks.every((tick) => !tick.label.startsWith("Semana del "))).toBe(true);
  });

  it("labels weekly ticks as week segments", () => {
    const cards = buildTimelineEventCards([
      eventA,
      {
        ...eventA,
        id: "event-week",
        title: "Bruno una semana despues",
        internalStart: new Date("2026-01-10T14:03:00.000Z"),
        internalEnd: new Date("2026-01-10T14:03:00.000Z"),
      },
    ]);
    const range = buildTimelineRange(cards);

    expect(range).not.toBeNull();

    const ticks = buildTimelineAxisTicks(range!, "weeks");

    expect(ticks.length).toBeGreaterThan(1);
    expect(ticks.every((tick) => tick.label.startsWith("Semana del "))).toBe(true);
  });

  it("stacks overlapping events for the same character track", () => {
    const longEvent = {
      ...eventA,
      internalEnd: new Date("2026-01-01T14:04:00.000Z"),
    };
    const overlappingEvent = {
      ...eventA,
      id: "event-overlap",
      title: "Bruno traslapado",
      internalStart: new Date("2026-01-01T14:03:30.000Z"),
      internalEnd: new Date("2026-01-01T14:05:00.000Z"),
    };
    const cards = buildTimelineEventCards([longEvent, overlappingEvent]);
    const range = buildTimelineRange(cards);

    expect(range).not.toBeNull();

    const [track] = buildTimelineHistogramTracks({
      mode: "character",
      characters: [bruno],
      events: cards,
      range: range!,
    });

    expect(track?.events.map((event) => event.laneIndex)).toEqual([0, 1]);
    expect(track?.laneCount).toBe(2);
  });

  it("stacks visually close events when cards need a minimum rendered width", () => {
    const nextEvent = {
      ...eventA,
      id: "event-next",
      title: "Bruno poco despues",
      internalStart: new Date("2026-01-01T15:00:00.000Z"),
      internalEnd: new Date("2026-01-01T15:00:00.000Z"),
    };
    const cards = buildTimelineEventCards([eventA, nextEvent]);
    const range = buildTimelineRange(cards);

    expect(range).not.toBeNull();

    const [track] = buildTimelineHistogramTracks({
      mode: "character",
      characters: [bruno],
      events: cards,
      range: range!,
      minimumLaneDurationMs: 2 * 60 * 60 * 1000,
    });

    expect(track?.events.map((event) => event.laneIndex)).toEqual([0, 1]);
    expect(track?.laneCount).toBe(2);
  });

  it("allows simultaneous events on different character tracks", () => {
    const cards = buildTimelineEventCards([eventA, eventC]);
    const range = buildTimelineRange(cards);

    expect(range).not.toBeNull();

    const tracks = buildTimelineHistogramTracks({
      mode: "character",
      characters: [bruno, elena],
      events: cards,
      range: range!,
    });

    expect(tracks).toHaveLength(2);
    expect(tracks[0]?.events[0]?.laneIndex).toBe(0);
    expect(tracks[1]?.events[0]?.laneIndex).toBe(0);
  });

  it("builds location tracks from event start and end locations", () => {
    const cards = buildTimelineEventCards([eventA, eventB]);
    const range = buildTimelineRange(cards);

    expect(range).not.toBeNull();

    const tracks = buildTimelineHistogramTracks({
      mode: "location",
      characters: [bruno],
      events: cards,
      range: range!,
    });

    expect(tracks.map((track) => track.label)).toEqual(["Ciudad de Mexico", "Tokio"]);
    expect(tracks.every((track) => track.kind === "location")).toBe(true);
  });

  it("stacks simultaneous point-in-time events in the same location track", () => {
    const simultaneousEvent = {
      ...eventA,
      id: "event-same-location",
      title: "Otra escena en Ciudad de Mexico",
      narrativeOrder: 4,
      characters: [
        {
          eventId: "event-same-location",
          characterId: "char-2",
          character: elena,
        },
      ],
    };
    const cards = buildTimelineEventCards([eventA, simultaneousEvent]);
    const range = buildTimelineRange(cards);

    expect(range).not.toBeNull();

    const [track] = buildTimelineHistogramTracks({
      mode: "location",
      characters: [bruno, elena],
      events: cards,
      range: range!,
    });

    expect(track?.label).toBe("Ciudad de Mexico");
    expect(track?.events.map((item) => item.event.id)).toEqual([
      "event-a",
      "event-same-location",
    ]);
    expect(track?.events.map((item) => item.laneIndex)).toEqual([0, 1]);
    expect(track?.laneCount).toBe(2);
  });

  it("adds an event with different start and end locations to both location tracks once", () => {
    const travelEvent = {
      ...eventA,
      id: "event-travel",
      title: "Viaje CDMX Tokio",
      endLocation: eventB.endLocation,
      endLocationId: eventB.endLocationId,
    };
    const cards = buildTimelineEventCards([travelEvent]);
    const range = buildTimelineRange(cards);

    expect(range).not.toBeNull();

    const tracks = buildTimelineHistogramTracks({
      mode: "location",
      characters: [bruno],
      events: cards,
      range: range!,
    });

    expect(tracks).toHaveLength(2);
    expect(tracks[0]?.events.map((item) => item.event.id)).toEqual(["event-travel"]);
    expect(tracks[1]?.events.map((item) => item.event.id)).toEqual(["event-travel"]);
  });

  it("collapses gaps larger than 2x the scale unit when trimming is active", () => {
    const farFuture = {
      ...eventA,
      id: "event-far",
      title: "Bruno un mes despues",
      internalStart: new Date("2026-02-01T14:03:00.000Z"),
      internalEnd: new Date("2026-02-01T14:03:00.000Z"),
    };
    const cards = buildTimelineEventCards([eventA, farFuture]);
    const result = collapseTimelineGaps(cards, "days");

    expect(result.gapBreaks).toHaveLength(1);
    expect(result.gapBreaks[0]?.label).toBe("1 m");
    expect(result.compressedEvents).toHaveLength(2);

    const compressedRange = result.compressedRange;
    const compressedDurationHours = (compressedRange.durationMs / (60 * 60 * 1000));

    expect(compressedDurationHours).toBeLessThan(2);
  });

  it("does not collapse gaps smaller than the threshold", () => {
    const closeEvent = {
      ...eventA,
      id: "event-close",
      title: "Bruno una hora despues",
      internalStart: new Date("2026-01-01T15:03:00.000Z"),
      internalEnd: new Date("2026-01-01T15:03:00.000Z"),
    };
    const cards = buildTimelineEventCards([eventA, closeEvent]);
    const result = collapseTimelineGaps(cards, "days");

    expect(result.gapBreaks).toHaveLength(0);
  });

  it("indexes continuity results by every affected event", () => {
    const result = {
      severity: "ERROR" as const,
      code: "CHARACTER_OVERLAPPING_EVENTS",
      characterId: "char-1",
      eventIds: ["event-a", "event-b"],
      explanation: "Bruno aparece en eventos traslapados.",
      suggestedFix: "Ajusta ventanas temporales.",
    };

    const indexed = indexContinuityResultsByEvent([result]);

    expect(indexed.get("event-a")).toEqual([result]);
    expect(indexed.get("event-b")).toEqual([result]);
  });
});
