import { describe, expect, it } from "vitest";
import { parseContinuityImportJson } from "@/lib/continuity/import-export";

describe("continuity import/export", () => {
  it("defaults production arrays for legacy bundles", () => {
    const parsed = parseContinuityImportJson(
      JSON.stringify({
        project: {
          title: "Legacy",
          type: "NOVEL",
        },
        characters: [],
        locations: [],
        events: [],
        eventCharacters: [],
      }),
    );

    expect(parsed.props).toEqual([]);
    expect(parsed.eventProps).toEqual([]);
    expect(parsed.eventCharacterProps).toEqual([]);
    expect(parsed.makeup).toEqual([]);
    expect(parsed.wardrobe).toEqual([]);
    expect(parsed.hairstyles).toEqual([]);
    expect(parsed.eventCharacterMakeup).toEqual([]);
    expect(parsed.eventCharacterWardrobe).toEqual([]);
    expect(parsed.eventCharacterHairstyles).toEqual([]);
  });

  it("parses production payloads alongside the base bundle", () => {
    const parsed = parseContinuityImportJson(
      JSON.stringify({
        project: {
          title: "With production",
          type: "FILM",
        },
        characters: [],
        locations: [],
        events: [],
        eventCharacters: [],
        props: [
          {
            id: "prop-1",
            name: "Ring",
            description: "Hero ring",
            category: "jewelry",
            imageUrl: null,
          },
        ],
        eventProps: [
          {
            eventId: "event-1",
            propId: "prop-1",
            notes: "On table",
          },
        ],
        eventCharacterProps: [],
        makeup: [],
        wardrobe: [],
        hairstyles: [],
        eventCharacterMakeup: [],
        eventCharacterWardrobe: [],
        eventCharacterHairstyles: [],
      }),
    );

    expect(parsed.props[0]?.name).toBe("Ring");
    expect(parsed.eventProps[0]?.notes).toBe("On table");
  });
});
