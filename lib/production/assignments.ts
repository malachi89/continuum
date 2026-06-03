import { prisma } from "@/lib/prisma";

export function assignPropToEvent(eventId: string, propId: string, notes?: string | null) {
  return prisma.eventProp.upsert({
    where: {
      eventId_propId: {
        eventId,
        propId,
      },
    },
    update: {
      notes: notes ?? null,
    },
    create: {
      eventId,
      propId,
      notes: notes ?? null,
    },
  });
}

export function removePropFromEvent(eventId: string, propId: string) {
  return prisma.eventProp.delete({
    where: {
      eventId_propId: {
        eventId,
        propId,
      },
    },
  });
}

export function assignPropToCharacter(
  eventId: string,
  characterId: string,
  propId: string,
  notes?: string | null,
) {
  return prisma.eventCharacterProp.upsert({
    where: {
      eventId_characterId_propId: {
        eventId,
        characterId,
        propId,
      },
    },
    update: {
      notes: notes ?? null,
    },
    create: {
      eventId,
      characterId,
      propId,
      notes: notes ?? null,
    },
  });
}

export function removePropFromCharacter(eventId: string, characterId: string, propId: string) {
  return prisma.eventCharacterProp.delete({
    where: {
      eventId_characterId_propId: {
        eventId,
        characterId,
        propId,
      },
    },
  });
}

export type ProductionMvpType = "makeup" | "wardrobe" | "hairstyle";

export function assignMvpToCharacter(
  type: ProductionMvpType,
  eventId: string,
  characterId: string,
  itemId: string,
  notes?: string | null,
) {
  switch (type) {
    case "makeup":
      return prisma.eventCharacterMakeup.upsert({
        where: {
          eventId_characterId_makeupId: {
            eventId,
            characterId,
            makeupId: itemId,
          },
        },
        update: {
          notes: notes ?? null,
        },
        create: {
          eventId,
          characterId,
          makeupId: itemId,
          notes: notes ?? null,
        },
      });
    case "wardrobe":
      return prisma.eventCharacterWardrobe.upsert({
        where: {
          eventId_characterId_wardrobeId: {
            eventId,
            characterId,
            wardrobeId: itemId,
          },
        },
        update: {
          notes: notes ?? null,
        },
        create: {
          eventId,
          characterId,
          wardrobeId: itemId,
          notes: notes ?? null,
        },
      });
    case "hairstyle":
      return prisma.eventCharacterHairstyle.upsert({
        where: {
          eventId_characterId_hairstyleId: {
            eventId,
            characterId,
            hairstyleId: itemId,
          },
        },
        update: {
          notes: notes ?? null,
        },
        create: {
          eventId,
          characterId,
          hairstyleId: itemId,
          notes: notes ?? null,
        },
      });
  }
}

export function removeMvpFromCharacter(
  type: ProductionMvpType,
  eventId: string,
  characterId: string,
  itemId: string,
) {
  switch (type) {
    case "makeup":
      return prisma.eventCharacterMakeup.delete({
        where: {
          eventId_characterId_makeupId: {
            eventId,
            characterId,
            makeupId: itemId,
          },
        },
      });
    case "wardrobe":
      return prisma.eventCharacterWardrobe.delete({
        where: {
          eventId_characterId_wardrobeId: {
            eventId,
            characterId,
            wardrobeId: itemId,
          },
        },
      });
    case "hairstyle":
      return prisma.eventCharacterHairstyle.delete({
        where: {
          eventId_characterId_hairstyleId: {
            eventId,
            characterId,
            hairstyleId: itemId,
          },
        },
      });
  }
}
