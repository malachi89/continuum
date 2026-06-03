import { notFound } from "next/navigation";
import { getOwnedProject, requireCurrentUser } from "@/lib/continuity/data";
import { prisma } from "@/lib/prisma";
import {
  getProjectHairstyles,
  getProjectMakeup,
  getProjectProps,
  getProjectWardrobe,
} from "@/lib/production/catalogs";
import type {
  AssignmentChip,
  CharacterVisualState,
  EventCharacterProductionState,
  EventProductionState,
  PropWithAssignments,
  ProductionCatalogItem,
} from "@/lib/production/types";

function toAssignmentChip(id: string, name: string, notes: string | null): AssignmentChip {
  return { id, name, notes };
}

function emptyVisualState(): CharacterVisualState {
  return {
    props: [],
    makeup: [],
    wardrobe: [],
    hairstyles: [],
  };
}

export async function getOwnedProjectProductionCatalog(projectId: string) {
  await getOwnedProject(projectId);

  const [props, makeup, wardrobe, hairstyles] = await Promise.all([
    getProjectProps(projectId),
    getProjectMakeup(projectId),
    getProjectWardrobe(projectId),
    getProjectHairstyles(projectId),
  ]);

  return {
    props: props.map(
      (item): PropWithAssignments => ({
        id: item.id,
        projectId: item.projectId,
        name: item.name,
        description: item.description,
        category: item.category,
        imageUrl: item.imageUrl,
        eventCount: item._count.eventAssignments,
        characterCount: item._count.characterAssignments,
      }),
    ),
    makeup: makeup.map(
      (item): ProductionCatalogItem & { assignmentCount: number } => ({
        id: item.id,
        projectId: item.projectId,
        name: item.name,
        description: item.description,
        assignmentCount: item._count.assignments,
      }),
    ),
    wardrobe: wardrobe.map(
      (item): ProductionCatalogItem & { assignmentCount: number } => ({
        id: item.id,
        projectId: item.projectId,
        name: item.name,
        description: item.description,
        assignmentCount: item._count.assignments,
      }),
    ),
    hairstyles: hairstyles.map(
      (item): ProductionCatalogItem & { assignmentCount: number } => ({
        id: item.id,
        projectId: item.projectId,
        name: item.name,
        description: item.description,
        assignmentCount: item._count.assignments,
      }),
    ),
  };
}

export async function getOwnedEventProductionContext(projectId: string, eventId: string) {
  const user = await requireCurrentUser();

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
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
        },
      },
      characters: {
        include: {
          character: true,
          propAssignments: {
            include: {
              prop: true,
            },
            orderBy: {
              prop: {
                name: "asc",
              },
            },
          },
          makeupAssignments: {
            include: {
              makeup: true,
            },
            orderBy: {
              makeup: {
                name: "asc",
              },
            },
          },
          wardrobeAssignments: {
            include: {
              wardrobe: true,
            },
            orderBy: {
              wardrobe: {
                name: "asc",
              },
            },
          },
          hairstyleAssignments: {
            include: {
              hairstyle: true,
            },
            orderBy: {
              hairstyle: {
                name: "asc",
              },
            },
          },
        },
        orderBy: {
          character: {
            name: "asc",
          },
        },
      },
      sceneProps: {
        include: {
          prop: true,
        },
        orderBy: {
          prop: {
            name: "asc",
          },
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const catalog = await getOwnedProjectProductionCatalog(projectId);

  const characters: EventCharacterProductionState[] = event.characters.map((link) => {
    const visual = emptyVisualState();

    visual.props = link.propAssignments.map((assignment) =>
      toAssignmentChip(assignment.propId, assignment.prop.name, assignment.notes),
    );
    visual.makeup = link.makeupAssignments.map((assignment) =>
      toAssignmentChip(assignment.makeupId, assignment.makeup.name, assignment.notes),
    );
    visual.wardrobe = link.wardrobeAssignments.map((assignment) =>
      toAssignmentChip(assignment.wardrobeId, assignment.wardrobe.name, assignment.notes),
    );
    visual.hairstyles = link.hairstyleAssignments.map((assignment) =>
      toAssignmentChip(assignment.hairstyleId, assignment.hairstyle.name, assignment.notes),
    );

    return {
      characterId: link.characterId,
      characterName: link.character.name,
      characterColor: link.character.color,
      visual,
    };
  });

  const production: EventProductionState = {
    eventId: event.id,
    sceneProps: event.sceneProps.map((assignment) =>
      toAssignmentChip(assignment.propId, assignment.prop.name, assignment.notes),
    ),
    characters,
  };

  return {
    event,
    catalog,
    production,
  };
}

export async function getOwnedCharacterProductionTimeline(projectId: string, characterId: string) {
  const user = await requireCurrentUser();

  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      projectId,
      project: {
        ownerId: user.id,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!character) {
    notFound();
  }

  return prisma.eventCharacter.findMany({
    where: {
      characterId,
      event: {
        projectId,
        project: {
          ownerId: user.id,
        },
      },
    },
    orderBy: {
      event: {
        internalStart: "asc",
      },
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          internalStart: true,
          internalEnd: true,
        },
      },
      propAssignments: {
        include: {
          prop: true,
        },
        orderBy: {
          prop: {
            name: "asc",
          },
        },
      },
      makeupAssignments: {
        include: {
          makeup: true,
        },
        orderBy: {
          makeup: {
            name: "asc",
          },
        },
      },
      wardrobeAssignments: {
        include: {
          wardrobe: true,
        },
        orderBy: {
          wardrobe: {
            name: "asc",
          },
        },
      },
      hairstyleAssignments: {
        include: {
          hairstyle: true,
        },
        orderBy: {
          hairstyle: {
            name: "asc",
          },
        },
      },
    },
  });
}
