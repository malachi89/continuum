import { prisma } from "@/lib/prisma";

export function getProjectProps(projectId: string) {
  return prisma.prop.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          eventAssignments: true,
          characterAssignments: true,
        },
      },
    },
  });
}

export function getProjectMakeup(projectId: string) {
  return prisma.makeup.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          assignments: true,
        },
      },
    },
  });
}

export function getProjectWardrobe(projectId: string) {
  return prisma.wardrobe.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          assignments: true,
        },
      },
    },
  });
}

export function getProjectHairstyles(projectId: string) {
  return prisma.hairstyle.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          assignments: true,
        },
      },
    },
  });
}
