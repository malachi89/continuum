"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/continuity/data";
import { prisma } from "@/lib/prisma";
import {
  assignMvpToCharacter,
  assignPropToCharacter,
  assignPropToEvent,
  removeMvpFromCharacter,
  removePropFromCharacter,
  removePropFromEvent,
  type ProductionMvpType,
} from "@/lib/production/assignments";

export type CrudActionState = {
  error?: string;
  success?: string;
};

const optionalText = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().optional());

const requiredText = z.string().trim().min(1);

const propCatalogSchema = z.object({
  itemId: optionalText,
  projectId: requiredText,
  redirectTo: requiredText,
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: optionalText,
  category: optionalText,
  imageUrl: optionalText,
});

const catalogSchema = z.object({
  itemId: optionalText,
  projectId: requiredText,
  redirectTo: requiredText,
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: optionalText,
});

const deleteCatalogSchema = z.object({
  itemId: requiredText,
  projectId: requiredText,
  redirectTo: requiredText,
});

const propAssignmentSchema = z.object({
  projectId: requiredText,
  eventId: requiredText,
  characterId: optionalText,
  propId: requiredText,
  notes: optionalText,
});

const removePropAssignmentSchema = z.object({
  projectId: requiredText,
  eventId: requiredText,
  characterId: optionalText,
  propId: requiredText,
});

const mvpAssignmentSchema = z.object({
  projectId: requiredText,
  eventId: requiredText,
  characterId: requiredText,
  type: z.enum(["makeup", "wardrobe", "hairstyle"]),
  itemId: requiredText,
  notes: optionalText,
});

const removeMvpAssignmentSchema = z.object({
  projectId: requiredText,
  eventId: requiredText,
  characterId: requiredText,
  type: z.enum(["makeup", "wardrobe", "hairstyle"]),
  itemId: requiredText,
});

function invalidFormState(message: string): CrudActionState {
  return { error: message };
}

function refreshProductionRoutes(projectId: string, eventId?: string, redirectTo?: string) {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/production`);
  revalidatePath(`/projects/${projectId}/events`);
  revalidatePath(`/projects/${projectId}/timeline`);
  revalidatePath(`/projects/${projectId}/import-export`);

  if (eventId) {
    revalidatePath(`/projects/${projectId}/events/${eventId}`);
    revalidatePath(`/projects/${projectId}/events/${eventId}/production`);
  }

  if (redirectTo) {
    revalidatePath(redirectTo);
  }
}

async function getOwnedProjectOrThrow(projectId: string, ownerId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
    select: { id: true },
  });

  if (!project) {
    throw new Error("No encontramos ese proyecto para tu cuenta.");
  }

  return project;
}

async function assertOwnedEvent(projectId: string, ownerId: string, eventId: string) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      projectId,
      project: {
        ownerId,
      },
    },
    select: { id: true },
  });

  if (!event) {
    throw new Error("No encontramos ese evento dentro de tu proyecto.");
  }
}

async function assertOwnedEventCharacter(
  projectId: string,
  ownerId: string,
  eventId: string,
  characterId: string,
) {
  const link = await prisma.eventCharacter.findFirst({
    where: {
      eventId,
      characterId,
      event: {
        projectId,
        project: {
          ownerId,
        },
      },
      character: {
        projectId,
      },
    },
    select: {
      eventId: true,
    },
  });

  if (!link) {
    throw new Error("Ese personaje no esta asignado a este evento.");
  }
}

async function assertOwnedProp(projectId: string, ownerId: string, propId: string) {
  const prop = await prisma.prop.findFirst({
    where: {
      id: propId,
      projectId,
      project: {
        ownerId,
      },
    },
    select: { id: true },
  });

  if (!prop) {
    throw new Error("No encontramos ese prop dentro de tu proyecto.");
  }
}

async function assertOwnedMvpItem(
  type: ProductionMvpType,
  projectId: string,
  ownerId: string,
  itemId: string,
) {
  const select = { id: true } as const;

  const item =
    type === "makeup"
      ? await prisma.makeup.findFirst({
          where: {
            id: itemId,
            projectId,
            project: { ownerId },
          },
          select,
        })
      : type === "wardrobe"
        ? await prisma.wardrobe.findFirst({
            where: {
              id: itemId,
              projectId,
              project: { ownerId },
            },
            select,
          })
        : await prisma.hairstyle.findFirst({
            where: {
              id: itemId,
              projectId,
              project: { ownerId },
            },
            select,
          });

  if (!item) {
    throw new Error("No encontramos ese item de produccion dentro de tu proyecto.");
  }
}

function toUniqueConstraintMessage(label: string) {
  return `Ya existe ${label} con ese nombre en este proyecto.`;
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createPropAction(
  _prevState: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const parsed = propCatalogSchema.safeParse({
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!parsed.success) {
    return invalidFormState(parsed.error.issues[0]?.message ?? "No pudimos crear el prop.");
  }

  const user = await requireCurrentUser();

  try {
    await getOwnedProjectOrThrow(parsed.data.projectId, user.id);
    await prisma.prop.create({
      data: {
        projectId: parsed.data.projectId,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        category: parsed.data.category ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return invalidFormState(toUniqueConstraintMessage("un prop"));
    }

    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos crear el prop.",
    );
  }

  refreshProductionRoutes(parsed.data.projectId, undefined, parsed.data.redirectTo);
  redirect(parsed.data.redirectTo);
}

export async function updatePropAction(
  _prevState: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const parsed = propCatalogSchema.safeParse({
    itemId: formData.get("itemId"),
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!parsed.success || !parsed.data.itemId) {
    return invalidFormState("No pudimos actualizar el prop.");
  }

  const user = await requireCurrentUser();

  try {
    await assertOwnedProp(parsed.data.projectId, user.id, parsed.data.itemId);
    await prisma.prop.update({
      where: { id: parsed.data.itemId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        category: parsed.data.category ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return invalidFormState(toUniqueConstraintMessage("un prop"));
    }

    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos actualizar el prop.",
    );
  }

  refreshProductionRoutes(parsed.data.projectId, undefined, parsed.data.redirectTo);
  redirect(parsed.data.redirectTo);
}

export async function deletePropAction(
  _prevState: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const parsed = deleteCatalogSchema.safeParse({
    itemId: formData.get("itemId"),
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
  });

  if (!parsed.success) {
    return invalidFormState("No pudimos borrar el prop.");
  }

  const user = await requireCurrentUser();

  try {
    const prop = await prisma.prop.findFirst({
      where: {
        id: parsed.data.itemId,
        projectId: parsed.data.projectId,
        project: { ownerId: user.id },
      },
      include: {
        _count: {
          select: {
            eventAssignments: true,
            characterAssignments: true,
          },
        },
      },
    });

    if (!prop) {
      throw new Error("No encontramos ese prop dentro de tu proyecto.");
    }

    if (prop._count.eventAssignments + prop._count.characterAssignments > 0) {
      throw new Error("No puedes borrar un prop que todavia tiene asignaciones.");
    }

    await prisma.prop.delete({
      where: { id: parsed.data.itemId },
    });
  } catch (error) {
    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos borrar el prop.",
    );
  }

  refreshProductionRoutes(parsed.data.projectId, undefined, parsed.data.redirectTo);
  redirect(parsed.data.redirectTo);
}

async function createCatalogItemAction(
  formData: FormData,
  type: ProductionMvpType,
) {
  const parsed = catalogSchema.safeParse({
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return invalidFormState(parsed.error.issues[0]?.message ?? "No pudimos crear el item.");
  }

  const user = await requireCurrentUser();

  try {
    await getOwnedProjectOrThrow(parsed.data.projectId, user.id);

    if (type === "makeup") {
      await prisma.makeup.create({
        data: {
          projectId: parsed.data.projectId,
          name: parsed.data.name,
          description: parsed.data.description ?? null,
        },
      });
    } else if (type === "wardrobe") {
      await prisma.wardrobe.create({
        data: {
          projectId: parsed.data.projectId,
          name: parsed.data.name,
          description: parsed.data.description ?? null,
        },
      });
    } else {
      await prisma.hairstyle.create({
        data: {
          projectId: parsed.data.projectId,
          name: parsed.data.name,
          description: parsed.data.description ?? null,
        },
      });
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return invalidFormState(toUniqueConstraintMessage("un item"));
    }

    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos crear el item.",
    );
  }

  refreshProductionRoutes(parsed.data.projectId, undefined, parsed.data.redirectTo);
  redirect(parsed.data.redirectTo);
}

async function updateCatalogItemAction(
  formData: FormData,
  type: ProductionMvpType,
) {
  const parsed = catalogSchema.safeParse({
    itemId: formData.get("itemId"),
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success || !parsed.data.itemId) {
    return invalidFormState("No pudimos actualizar el item.");
  }

  const user = await requireCurrentUser();

  try {
    await assertOwnedMvpItem(type, parsed.data.projectId, user.id, parsed.data.itemId);

    if (type === "makeup") {
      await prisma.makeup.update({
        where: { id: parsed.data.itemId },
        data: {
          name: parsed.data.name,
          description: parsed.data.description ?? null,
        },
      });
    } else if (type === "wardrobe") {
      await prisma.wardrobe.update({
        where: { id: parsed.data.itemId },
        data: {
          name: parsed.data.name,
          description: parsed.data.description ?? null,
        },
      });
    } else {
      await prisma.hairstyle.update({
        where: { id: parsed.data.itemId },
        data: {
          name: parsed.data.name,
          description: parsed.data.description ?? null,
        },
      });
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return invalidFormState(toUniqueConstraintMessage("un item"));
    }

    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos actualizar el item.",
    );
  }

  refreshProductionRoutes(parsed.data.projectId, undefined, parsed.data.redirectTo);
  redirect(parsed.data.redirectTo);
}

async function deleteCatalogItemAction(formData: FormData, type: ProductionMvpType) {
  const parsed = deleteCatalogSchema.safeParse({
    itemId: formData.get("itemId"),
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
  });

  if (!parsed.success) {
    return invalidFormState("No pudimos borrar el item.");
  }

  const user = await requireCurrentUser();

  try {
    const item =
      type === "makeup"
        ? await prisma.makeup.findFirst({
            where: {
              id: parsed.data.itemId,
              projectId: parsed.data.projectId,
              project: { ownerId: user.id },
            },
            include: {
              _count: {
                select: {
                  assignments: true,
                },
              },
            },
          })
        : type === "wardrobe"
          ? await prisma.wardrobe.findFirst({
              where: {
                id: parsed.data.itemId,
                projectId: parsed.data.projectId,
                project: { ownerId: user.id },
              },
              include: {
                _count: {
                  select: {
                    assignments: true,
                  },
                },
              },
            })
          : await prisma.hairstyle.findFirst({
              where: {
                id: parsed.data.itemId,
                projectId: parsed.data.projectId,
                project: { ownerId: user.id },
              },
              include: {
                _count: {
                  select: {
                    assignments: true,
                  },
                },
              },
            });

    if (!item) {
      throw new Error("No encontramos ese item dentro de tu proyecto.");
    }

    if (item._count.assignments > 0) {
      throw new Error("No puedes borrar un item que todavia tiene asignaciones.");
    }

    if (type === "makeup") {
      await prisma.makeup.delete({ where: { id: parsed.data.itemId } });
    } else if (type === "wardrobe") {
      await prisma.wardrobe.delete({ where: { id: parsed.data.itemId } });
    } else {
      await prisma.hairstyle.delete({ where: { id: parsed.data.itemId } });
    }
  } catch (error) {
    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos borrar el item.",
    );
  }

  refreshProductionRoutes(parsed.data.projectId, undefined, parsed.data.redirectTo);
  redirect(parsed.data.redirectTo);
}

export async function createMakeupAction(_prevState: CrudActionState, formData: FormData) {
  return createCatalogItemAction(formData, "makeup");
}

export async function updateMakeupAction(_prevState: CrudActionState, formData: FormData) {
  return updateCatalogItemAction(formData, "makeup");
}

export async function deleteMakeupAction(_prevState: CrudActionState, formData: FormData) {
  return deleteCatalogItemAction(formData, "makeup");
}

export async function createWardrobeAction(_prevState: CrudActionState, formData: FormData) {
  return createCatalogItemAction(formData, "wardrobe");
}

export async function updateWardrobeAction(_prevState: CrudActionState, formData: FormData) {
  return updateCatalogItemAction(formData, "wardrobe");
}

export async function deleteWardrobeAction(_prevState: CrudActionState, formData: FormData) {
  return deleteCatalogItemAction(formData, "wardrobe");
}

export async function createHairstyleAction(_prevState: CrudActionState, formData: FormData) {
  return createCatalogItemAction(formData, "hairstyle");
}

export async function updateHairstyleAction(_prevState: CrudActionState, formData: FormData) {
  return updateCatalogItemAction(formData, "hairstyle");
}

export async function deleteHairstyleAction(_prevState: CrudActionState, formData: FormData) {
  return deleteCatalogItemAction(formData, "hairstyle");
}

export async function assignPropToEventAction(formData: FormData) {
  const parsed = propAssignmentSchema.safeParse({
    projectId: formData.get("projectId"),
    eventId: formData.get("eventId"),
    propId: formData.get("propId"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    throw new Error("No pudimos asignar el prop.");
  }

  const user = await requireCurrentUser();
  await assertOwnedEvent(parsed.data.projectId, user.id, parsed.data.eventId);
  await assertOwnedProp(parsed.data.projectId, user.id, parsed.data.propId);
  await assignPropToEvent(parsed.data.eventId, parsed.data.propId, parsed.data.notes ?? null);
  refreshProductionRoutes(parsed.data.projectId, parsed.data.eventId);
}

export async function removePropFromEventAction(formData: FormData) {
  const parsed = removePropAssignmentSchema.safeParse({
    projectId: formData.get("projectId"),
    eventId: formData.get("eventId"),
    propId: formData.get("propId"),
  });

  if (!parsed.success) {
    throw new Error("No pudimos quitar el prop.");
  }

  const user = await requireCurrentUser();
  await assertOwnedEvent(parsed.data.projectId, user.id, parsed.data.eventId);
  await assertOwnedProp(parsed.data.projectId, user.id, parsed.data.propId);
  await removePropFromEvent(parsed.data.eventId, parsed.data.propId);
  refreshProductionRoutes(parsed.data.projectId, parsed.data.eventId);
}

export async function assignPropToCharacterAction(formData: FormData) {
  const parsed = propAssignmentSchema.safeParse({
    projectId: formData.get("projectId"),
    eventId: formData.get("eventId"),
    characterId: formData.get("characterId"),
    propId: formData.get("propId"),
    notes: formData.get("notes"),
  });

  if (!parsed.success || !parsed.data.characterId) {
    throw new Error("No pudimos asignar el prop.");
  }

  const user = await requireCurrentUser();
  await assertOwnedEventCharacter(
    parsed.data.projectId,
    user.id,
    parsed.data.eventId,
    parsed.data.characterId,
  );
  await assertOwnedProp(parsed.data.projectId, user.id, parsed.data.propId);
  await assignPropToCharacter(
    parsed.data.eventId,
    parsed.data.characterId,
    parsed.data.propId,
    parsed.data.notes ?? null,
  );
  refreshProductionRoutes(parsed.data.projectId, parsed.data.eventId);
}

export async function removePropFromCharacterAction(formData: FormData) {
  const parsed = removePropAssignmentSchema.safeParse({
    projectId: formData.get("projectId"),
    eventId: formData.get("eventId"),
    characterId: formData.get("characterId"),
    propId: formData.get("propId"),
  });

  if (!parsed.success || !parsed.data.characterId) {
    throw new Error("No pudimos quitar el prop.");
  }

  const user = await requireCurrentUser();
  await assertOwnedEventCharacter(
    parsed.data.projectId,
    user.id,
    parsed.data.eventId,
    parsed.data.characterId,
  );
  await assertOwnedProp(parsed.data.projectId, user.id, parsed.data.propId);
  await removePropFromCharacter(parsed.data.eventId, parsed.data.characterId, parsed.data.propId);
  refreshProductionRoutes(parsed.data.projectId, parsed.data.eventId);
}

export async function assignMvpToCharacterAction(formData: FormData) {
  const parsed = mvpAssignmentSchema.safeParse({
    projectId: formData.get("projectId"),
    eventId: formData.get("eventId"),
    characterId: formData.get("characterId"),
    type: formData.get("type"),
    itemId: formData.get("itemId"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    throw new Error("No pudimos asignar el item.");
  }

  const user = await requireCurrentUser();
  await assertOwnedEventCharacter(
    parsed.data.projectId,
    user.id,
    parsed.data.eventId,
    parsed.data.characterId,
  );
  await assertOwnedMvpItem(parsed.data.type, parsed.data.projectId, user.id, parsed.data.itemId);
  await assignMvpToCharacter(
    parsed.data.type,
    parsed.data.eventId,
    parsed.data.characterId,
    parsed.data.itemId,
    parsed.data.notes ?? null,
  );
  refreshProductionRoutes(parsed.data.projectId, parsed.data.eventId);
}

export async function removeMvpFromCharacterAction(formData: FormData) {
  const parsed = removeMvpAssignmentSchema.safeParse({
    projectId: formData.get("projectId"),
    eventId: formData.get("eventId"),
    characterId: formData.get("characterId"),
    type: formData.get("type"),
    itemId: formData.get("itemId"),
  });

  if (!parsed.success) {
    throw new Error("No pudimos quitar el item.");
  }

  const user = await requireCurrentUser();
  await assertOwnedEventCharacter(
    parsed.data.projectId,
    user.id,
    parsed.data.eventId,
    parsed.data.characterId,
  );
  await assertOwnedMvpItem(parsed.data.type, parsed.data.projectId, user.id, parsed.data.itemId);
  await removeMvpFromCharacter(
    parsed.data.type,
    parsed.data.eventId,
    parsed.data.characterId,
    parsed.data.itemId,
  );
  refreshProductionRoutes(parsed.data.projectId, parsed.data.eventId);
}
