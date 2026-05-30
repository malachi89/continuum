import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireCurrentUser: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
  prisma: {
    project: {
      findFirst: vi.fn(),
    },
    event: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    location: {
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

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import {
  assignLocationToEventAction,
  createBlankTimelineEventAction,
} from "@/app/(app)/projects/actions";

describe("timeline server actions", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    mocks.requireCurrentUser.mockResolvedValue({ id: "user-1" });
  });

  it("creates a blank timeline event with placeholder defaults", async () => {
    const now = new Date("2026-05-30T18:15:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    mocks.prisma.project.findFirst.mockResolvedValue({ id: "project-1" });
    mocks.prisma.event.create.mockResolvedValue({ id: "event-1" });

    const result = await createBlankTimelineEventAction({ projectId: "project-1" });

    expect(result).toEqual({ eventId: "event-1" });
    expect(mocks.prisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: "project-1",
        ownerId: "user-1",
      },
      select: { id: true },
    });
    expect(mocks.prisma.event.create).toHaveBeenCalledWith({
      data: {
        projectId: "project-1",
        title: "Evento sin titulo",
        internalStart: now,
        internalEnd: now,
        eventType: "SCENE",
      },
      select: { id: true },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects/project-1/timeline");
  });

  it("rejects blank event creation for projects outside the current user", async () => {
    mocks.prisma.project.findFirst.mockResolvedValue(null);

    await expect(
      createBlankTimelineEventAction({ projectId: "project-1" }),
    ).rejects.toThrow("No encontramos ese proyecto para tu cuenta.");

    expect(mocks.prisma.event.create).not.toHaveBeenCalled();
  });

  it("assigns a start location without changing the end location", async () => {
    mocks.prisma.event.findFirst.mockResolvedValue({ id: "event-1" });
    mocks.prisma.location.findFirst.mockResolvedValue({ id: "location-1" });
    mocks.prisma.event.update.mockResolvedValue({ id: "event-1" });

    await assignLocationToEventAction({
      projectId: "project-1",
      eventId: "event-1",
      locationId: "location-1",
      side: "start",
    });

    expect(mocks.prisma.event.update).toHaveBeenCalledWith({
      where: { id: "event-1" },
      data: { startLocationId: "location-1" },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects/project-1/timeline");
  });

  it("assigns an end location without changing the start location", async () => {
    mocks.prisma.event.findFirst.mockResolvedValue({ id: "event-1" });
    mocks.prisma.location.findFirst.mockResolvedValue({ id: "location-1" });
    mocks.prisma.event.update.mockResolvedValue({ id: "event-1" });

    await assignLocationToEventAction({
      projectId: "project-1",
      eventId: "event-1",
      locationId: "location-1",
      side: "end",
    });

    expect(mocks.prisma.event.update).toHaveBeenCalledWith({
      where: { id: "event-1" },
      data: { endLocationId: "location-1" },
    });
  });

  it("rejects locations outside the current project", async () => {
    mocks.prisma.event.findFirst.mockResolvedValue({ id: "event-1" });
    mocks.prisma.location.findFirst.mockResolvedValue(null);

    await expect(
      assignLocationToEventAction({
        projectId: "project-1",
        eventId: "event-1",
        locationId: "location-2",
        side: "start",
      }),
    ).rejects.toThrow("La locacion seleccionada no pertenece a este proyecto.");

    expect(mocks.prisma.event.update).not.toHaveBeenCalled();
  });
});
