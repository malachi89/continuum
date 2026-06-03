import { z } from "zod";

export const continuityImportSchema = z.object({
  project: z.object({
    title: z.string().min(1),
    type: z.string().min(1),
    description: z.string().nullable().optional(),
  }),
  characters: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      alias: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
      color: z.string().min(1),
      status: z.string().min(1),
      statusDateInternal: z.string().nullable().optional(),
    }),
  ),
  locations: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().nullable().optional(),
      latitude: z.number().nullable().optional(),
      longitude: z.number().nullable().optional(),
      type: z.string().min(1),
      notes: z.string().nullable().optional(),
    }),
  ),
  events: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().nullable().optional(),
      internalStart: z.string().min(1),
      internalEnd: z.string().min(1),
      startLocationId: z.string().nullable().optional(),
      endLocationId: z.string().nullable().optional(),
      eventType: z.string().min(1),
      chapterOrEpisode: z.string().nullable().optional(),
      narrativeOrder: z.number().int().nullable().optional(),
      notes: z.string().nullable().optional(),
    }),
  ),
  eventCharacters: z.array(
    z.object({
      eventId: z.string().min(1),
      characterId: z.string().min(1),
    }),
  ),
  props: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().nullable().optional(),
      category: z.string().nullable().optional(),
      imageUrl: z.string().nullable().optional(),
    }),
  ).default([]),
  eventProps: z.array(
    z.object({
      eventId: z.string().min(1),
      propId: z.string().min(1),
      notes: z.string().nullable().optional(),
    }),
  ).default([]),
  eventCharacterProps: z.array(
    z.object({
      eventId: z.string().min(1),
      characterId: z.string().min(1),
      propId: z.string().min(1),
      notes: z.string().nullable().optional(),
    }),
  ).default([]),
  makeup: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().nullable().optional(),
    }),
  ).default([]),
  wardrobe: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().nullable().optional(),
    }),
  ).default([]),
  hairstyles: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().nullable().optional(),
    }),
  ).default([]),
  eventCharacterMakeup: z.array(
    z.object({
      eventId: z.string().min(1),
      characterId: z.string().min(1),
      makeupId: z.string().min(1),
      notes: z.string().nullable().optional(),
    }),
  ).default([]),
  eventCharacterWardrobe: z.array(
    z.object({
      eventId: z.string().min(1),
      characterId: z.string().min(1),
      wardrobeId: z.string().min(1),
      notes: z.string().nullable().optional(),
    }),
  ).default([]),
  eventCharacterHairstyles: z.array(
    z.object({
      eventId: z.string().min(1),
      characterId: z.string().min(1),
      hairstyleId: z.string().min(1),
      notes: z.string().nullable().optional(),
    }),
  ).default([]),
});

export type ContinuityImportBundle = z.infer<typeof continuityImportSchema>;

export function parseContinuityImportJson(rawJson: string) {
  const parsedJson = JSON.parse(rawJson);
  return continuityImportSchema.parse(parsedJson);
}

export function createImportedProjectTitle(title: string) {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `${title} (import ${timestamp})`;
}
