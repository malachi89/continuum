import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireCurrentUser: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
  assignMvpToCharacter: vi.fn(),
  prisma: {
    project: {
      findFirst: vi.fn(),
    },
    event: {
      findFirst: vi.fn(),
    },
    eventCharacter: {
      findFirst: vi.fn(),
    },
    prop: {
      findFirst: vi.fn(),
    },
    makeup: {
      findFirst: vi.fn(),
    },
    wardrobe: {
      findFirst: vi.fn(),
    },
    hairstyle: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/continuity/data", () => ({
  requireCurrentUser: mocks.requireCurrentUser,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

vi.mock("@/lib/production/assignments", () => ({
  assignMvpToCharacter: mocks.assignMvpToCharacter,
  assignPropToCharacter: vi.fn(),
  assignPropToEvent: vi.fn(),
  removeMvpFromCharacter: vi.fn(),
  removePropFromCharacter: vi.fn(),
  removePropFromEvent: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import { assignMvpToCharacterAction } from "@/app/(app)/projects/production-actions";

describe("production server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireCurrentUser.mockResolvedValue({ id: "user-1" });
    mocks.prisma.eventCharacter.findFirst.mockResolvedValue({ eventId: "event-1" });
    mocks.prisma.makeup.findFirst.mockResolvedValue({ id: "makeup-1" });
    mocks.assignMvpToCharacter.mockResolvedValue({});
  });

  it("assigns makeup to a character already linked to the event", async () => {
    const formData = new FormData();
    formData.set("projectId", "project-1");
    formData.set("eventId", "event-1");
    formData.set("characterId", "character-1");
    formData.set("type", "makeup");
    formData.set("itemId", "makeup-1");
    formData.set("notes", "dusty");

    await assignMvpToCharacterAction(formData);

    expect(mocks.assignMvpToCharacter).toHaveBeenCalledWith(
      "makeup",
      "event-1",
      "character-1",
      "makeup-1",
      "dusty",
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects/project-1/events/event-1/production");
  });

  it("rejects assignments for characters outside the event", async () => {
    mocks.prisma.eventCharacter.findFirst.mockResolvedValue(null);

    const formData = new FormData();
    formData.set("projectId", "project-1");
    formData.set("eventId", "event-1");
    formData.set("characterId", "character-2");
    formData.set("type", "makeup");
    formData.set("itemId", "makeup-1");

    await expect(assignMvpToCharacterAction(formData)).rejects.toThrow(
      "Ese personaje no esta asignado a este evento.",
    );

    expect(mocks.assignMvpToCharacter).not.toHaveBeenCalled();
  });
});
