import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getOwnedProjects() {
  const user = await requireCurrentUser();

  return prisma.project.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          characters: true,
          locations: true,
          events: true,
        },
      },
    },
  });
}

export async function getOwnedProject(projectId: string) {
  const user = await requireCurrentUser();

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: user.id,
    },
    include: {
      _count: {
        select: {
          characters: true,
          locations: true,
          events: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return project;
}

export async function getOwnedProjectCharacters(projectId: string) {
  await getOwnedProject(projectId);

  return prisma.character.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });
}

export async function getOwnedProjectLocations(projectId: string) {
  await getOwnedProject(projectId);

  return prisma.location.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });
}

export async function getOwnedProjectEvents(projectId: string) {
  await getOwnedProject(projectId);

  return prisma.event.findMany({
    where: { projectId },
    orderBy: [{ internalStart: "asc" }, { narrativeOrder: "asc" }],
    include: {
      startLocation: true,
      endLocation: true,
      characters: {
        include: {
          character: true,
        },
        orderBy: {
          character: {
            name: "asc",
          },
        },
      },
    },
  });
}

export async function getOwnedProjectTimeline(projectId: string) {
  const [project, characters, locations, events] = await Promise.all([
    getOwnedProject(projectId),
    getOwnedProjectCharacters(projectId),
    getOwnedProjectLocations(projectId),
    getOwnedProjectEvents(projectId),
  ]);

  return {
    project,
    characters,
    locations,
    events,
  };
}

export async function getOwnedCharacterTimeline(projectId: string, characterId: string) {
  const user = await requireCurrentUser();

  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      projectId,
      project: {
        ownerId: user.id,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          type: true,
        },
      },
    },
  });

  if (!character) {
    notFound();
  }

  const events = await prisma.event.findMany({
    where: {
      projectId,
      characters: {
        some: {
          characterId,
        },
      },
    },
    orderBy: {
      internalStart: "asc",
    },
    include: {
      startLocation: true,
      endLocation: true,
      characters: {
        include: {
          character: true,
        },
        orderBy: {
          character: {
            name: "asc",
          },
        },
      },
    },
  });

  return {
    character,
    events,
  };
}
