"use server";

import {
  CharacterStatus,
  EventType,
  LocationType,
  Prisma,
  ProjectType,
  TravelMode,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/continuity/data";
import {
  createImportedProjectTitle,
  parseContinuityImportJson,
} from "@/lib/continuity/import-export";

export type CrudActionState = {
  error?: string;
  success?: string;
};

const optionalText = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().optional(),
);

const optionalNumber = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}, z.number().finite().optional());

const optionalDateString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().optional());

const projectSchema = z.object({
  projectId: optionalText,
  redirectTo: z.string().min(1),
  title: z.string().trim().min(1, "El titulo es obligatorio."),
  type: z.nativeEnum(ProjectType, {
    error: "Selecciona un tipo de proyecto valido.",
  }),
  description: optionalText,
});

const characterSchema = z.object({
  characterId: optionalText,
  projectId: z.string().min(1),
  redirectTo: z.string().min(1),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  alias: optionalText,
  description: optionalText,
  notes: optionalText,
  color: z
    .string()
    .trim()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Usa un color hexadecimal valido."),
  maxTravelMode: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.nativeEnum(TravelMode).optional(),
  ),
  maxSpeedKmh: optionalNumber,
  status: z.nativeEnum(CharacterStatus, {
    error: "Selecciona un estado valido.",
  }),
  statusDateInternal: optionalDateString,
});

const locationSchema = z.object({
  locationId: optionalText,
  projectId: z.string().min(1),
  redirectTo: z.string().min(1),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: optionalText,
  latitude: optionalNumber,
  longitude: optionalNumber,
  type: z.nativeEnum(LocationType, {
    error: "Selecciona un tipo de locacion valido.",
  }),
  notes: optionalText,
});

const eventSchema = z.object({
  eventId: optionalText,
  projectId: z.string().min(1),
  redirectTo: z.string().min(1),
  title: z.string().trim().min(1, "El titulo es obligatorio."),
  description: optionalText,
  internalStart: z.string().trim().min(1, "La fecha interna inicial es obligatoria."),
  internalEnd: z.string().trim().min(1, "La fecha interna final es obligatoria."),
  startLocationId: optionalText,
  endLocationId: optionalText,
  eventType: z.nativeEnum(EventType, {
    error: "Selecciona un tipo de evento valido.",
  }),
  chapterOrEpisode: optionalText,
  narrativeOrder: optionalNumber,
  notes: optionalText,
  characterIds: z.array(z.string()).default([]),
});

function invalidFormState(message: string): CrudActionState {
  return { error: message };
}

function parseDateString(value: string, label: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} no tiene un formato valido.`);
  }

  return date;
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

async function assertOwnedLocation(
  projectId: string,
  ownerId: string,
  locationId: string | undefined,
) {
  if (!locationId) {
    return null;
  }

  const location = await prisma.location.findFirst({
    where: {
      id: locationId,
      projectId,
      project: {
        ownerId,
      },
    },
    select: { id: true },
  });

  if (!location) {
    throw new Error("La locacion seleccionada no pertenece a este proyecto.");
  }

  return location.id;
}

async function assertOwnedCharacterIds(
  projectId: string,
  ownerId: string,
  characterIds: string[],
) {
  const uniqueCharacterIds = [...new Set(characterIds.filter(Boolean))];

  if (uniqueCharacterIds.length === 0) {
    return uniqueCharacterIds;
  }

  const ownedCharacters = await prisma.character.findMany({
    where: {
      id: { in: uniqueCharacterIds },
      projectId,
      project: {
        ownerId,
      },
    },
    select: { id: true },
  });

  if (ownedCharacters.length !== uniqueCharacterIds.length) {
    throw new Error("Uno o mas personajes seleccionados no pertenecen a este proyecto.");
  }

  return uniqueCharacterIds;
}

function refreshProjectRoutes(projectId?: string) {
  revalidatePath("/projects");

  if (!projectId) {
    return;
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/characters`);
  revalidatePath(`/projects/${projectId}/locations`);
  revalidatePath(`/projects/${projectId}/events`);
  revalidatePath(`/projects/${projectId}/timeline`);
  revalidatePath("/characters");
  revalidatePath("/locations");
  revalidatePath("/events");
  revalidatePath("/timeline");
}

export async function createProjectAction(
  _prevState: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const parsed = projectSchema.safeParse({
    redirectTo: formData.get("redirectTo"),
    title: formData.get("title"),
    type: formData.get("type"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return invalidFormState(parsed.error.issues[0]?.message ?? "No pudimos crear el proyecto.");
  }

  const user = await requireCurrentUser();

  const project = await prisma.project.create({
    data: {
      ownerId: user.id,
      title: parsed.data.title,
      type: parsed.data.type,
      description: parsed.data.description,
    },
    select: { id: true },
  });

  refreshProjectRoutes(project.id);
  redirect(`/projects/${project.id}`);
}

export async function updateProjectAction(
  _prevState: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const parsed = projectSchema.safeParse({
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
    title: formData.get("title"),
    type: formData.get("type"),
    description: formData.get("description"),
  });

  if (!parsed.success || !parsed.data.projectId) {
    return invalidFormState("No pudimos actualizar el proyecto.");
  }

  const user = await requireCurrentUser();

  try {
    await getOwnedProjectOrThrow(parsed.data.projectId, user.id);

    await prisma.project.update({
      where: { id: parsed.data.projectId },
      data: {
        title: parsed.data.title,
        type: parsed.data.type,
        description: parsed.data.description,
      },
    });
  } catch (error) {
    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos actualizar el proyecto.",
    );
  }

  refreshProjectRoutes(parsed.data.projectId);
  redirect(parsed.data.redirectTo);
}

export async function deleteProjectAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/projects");
  const user = await requireCurrentUser();

  if (!projectId) {
    throw new Error("Project id is required.");
  }

  await getOwnedProjectOrThrow(projectId, user.id);
  await prisma.project.delete({ where: { id: projectId } });
  refreshProjectRoutes(projectId);
  redirect(redirectTo);
}

export async function createCharacterAction(
  _prevState: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const parsed = characterSchema.safeParse({
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
    name: formData.get("name"),
    alias: formData.get("alias"),
    description: formData.get("description"),
    notes: formData.get("notes"),
    color: formData.get("color"),
    maxTravelMode: formData.get("maxTravelMode"),
    maxSpeedKmh: formData.get("maxSpeedKmh"),
    status: formData.get("status"),
    statusDateInternal: formData.get("statusDateInternal"),
  });

  if (!parsed.success) {
    return invalidFormState(parsed.error.issues[0]?.message ?? "No pudimos crear el personaje.");
  }

  const user = await requireCurrentUser();

  try {
    await getOwnedProjectOrThrow(parsed.data.projectId, user.id);

    await prisma.character.create({
      data: {
        projectId: parsed.data.projectId,
        name: parsed.data.name,
        alias: parsed.data.alias,
        description: parsed.data.description,
        notes: parsed.data.notes,
        color: parsed.data.color,
        maxTravelMode: parsed.data.maxTravelMode,
        maxSpeedKmh: parsed.data.maxSpeedKmh,
        status: parsed.data.status,
        statusDateInternal: parsed.data.statusDateInternal
          ? parseDateString(parsed.data.statusDateInternal, "La fecha de estado")
          : null,
      },
    });
  } catch (error) {
    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos crear el personaje.",
    );
  }

  refreshProjectRoutes(parsed.data.projectId);
  redirect(parsed.data.redirectTo);
}

export async function updateCharacterAction(
  _prevState: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const parsed = characterSchema.safeParse({
    characterId: formData.get("characterId"),
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
    name: formData.get("name"),
    alias: formData.get("alias"),
    description: formData.get("description"),
    notes: formData.get("notes"),
    color: formData.get("color"),
    maxTravelMode: formData.get("maxTravelMode"),
    maxSpeedKmh: formData.get("maxSpeedKmh"),
    status: formData.get("status"),
    statusDateInternal: formData.get("statusDateInternal"),
  });

  if (!parsed.success || !parsed.data.characterId) {
    return invalidFormState("No pudimos actualizar el personaje.");
  }

  const user = await requireCurrentUser();

  try {
    await prisma.character.findFirstOrThrow({
      where: {
        id: parsed.data.characterId,
        projectId: parsed.data.projectId,
        project: {
          ownerId: user.id,
        },
      },
      select: { id: true },
    });

    await prisma.character.update({
      where: { id: parsed.data.characterId },
      data: {
        name: parsed.data.name,
        alias: parsed.data.alias,
        description: parsed.data.description,
        notes: parsed.data.notes,
        color: parsed.data.color,
        maxTravelMode: parsed.data.maxTravelMode,
        maxSpeedKmh: parsed.data.maxSpeedKmh,
        status: parsed.data.status,
        statusDateInternal: parsed.data.statusDateInternal
          ? parseDateString(parsed.data.statusDateInternal, "La fecha de estado")
          : null,
      },
    });
  } catch (error) {
    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos actualizar el personaje.",
    );
  }

  refreshProjectRoutes(parsed.data.projectId);
  redirect(parsed.data.redirectTo);
}

export async function deleteCharacterAction(formData: FormData) {
  const characterId = String(formData.get("characterId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/projects");
  const user = await requireCurrentUser();

  await prisma.character.findFirstOrThrow({
    where: {
      id: characterId,
      projectId,
      project: {
        ownerId: user.id,
      },
    },
    select: { id: true },
  });

  await prisma.character.delete({ where: { id: characterId } });
  refreshProjectRoutes(projectId);
  redirect(redirectTo);
}

export async function createLocationAction(
  _prevState: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const parsed = locationSchema.safeParse({
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
    name: formData.get("name"),
    description: formData.get("description"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    type: formData.get("type"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return invalidFormState(parsed.error.issues[0]?.message ?? "No pudimos crear la locacion.");
  }

  const user = await requireCurrentUser();

  try {
    await getOwnedProjectOrThrow(parsed.data.projectId, user.id);

    await prisma.location.create({
      data: {
        projectId: parsed.data.projectId,
        name: parsed.data.name,
        description: parsed.data.description,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        type: parsed.data.type,
        notes: parsed.data.notes,
      },
    });
  } catch (error) {
    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos crear la locacion.",
    );
  }

  refreshProjectRoutes(parsed.data.projectId);
  redirect(parsed.data.redirectTo);
}

export async function updateLocationAction(
  _prevState: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const parsed = locationSchema.safeParse({
    locationId: formData.get("locationId"),
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
    name: formData.get("name"),
    description: formData.get("description"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    type: formData.get("type"),
    notes: formData.get("notes"),
  });

  if (!parsed.success || !parsed.data.locationId) {
    return invalidFormState("No pudimos actualizar la locacion.");
  }

  const user = await requireCurrentUser();

  try {
    await prisma.location.findFirstOrThrow({
      where: {
        id: parsed.data.locationId,
        projectId: parsed.data.projectId,
        project: {
          ownerId: user.id,
        },
      },
      select: { id: true },
    });

    await prisma.location.update({
      where: { id: parsed.data.locationId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        type: parsed.data.type,
        notes: parsed.data.notes,
      },
    });
  } catch (error) {
    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos actualizar la locacion.",
    );
  }

  refreshProjectRoutes(parsed.data.projectId);
  redirect(parsed.data.redirectTo);
}

export async function deleteLocationAction(formData: FormData) {
  const locationId = String(formData.get("locationId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/projects");
  const user = await requireCurrentUser();

  await prisma.location.findFirstOrThrow({
    where: {
      id: locationId,
      projectId,
      project: {
        ownerId: user.id,
      },
    },
    select: { id: true },
  });

  await prisma.location.delete({ where: { id: locationId } });
  refreshProjectRoutes(projectId);
  redirect(redirectTo);
}

export async function createEventAction(
  _prevState: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const parsed = eventSchema.safeParse({
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
    title: formData.get("title"),
    description: formData.get("description"),
    internalStart: formData.get("internalStart"),
    internalEnd: formData.get("internalEnd"),
    startLocationId: formData.get("startLocationId"),
    endLocationId: formData.get("endLocationId"),
    eventType: formData.get("eventType"),
    chapterOrEpisode: formData.get("chapterOrEpisode"),
    narrativeOrder: formData.get("narrativeOrder"),
    notes: formData.get("notes"),
    characterIds: formData.getAll("characterIds"),
  });

  if (!parsed.success) {
    return invalidFormState(parsed.error.issues[0]?.message ?? "No pudimos crear el evento.");
  }

  const user = await requireCurrentUser();

  try {
    await getOwnedProjectOrThrow(parsed.data.projectId, user.id);

    const startLocationId = await assertOwnedLocation(
      parsed.data.projectId,
      user.id,
      parsed.data.startLocationId,
    );
    const endLocationId = await assertOwnedLocation(
      parsed.data.projectId,
      user.id,
      parsed.data.endLocationId,
    );
    const characterIds = await assertOwnedCharacterIds(
      parsed.data.projectId,
      user.id,
      parsed.data.characterIds,
    );

    await prisma.event.create({
      data: {
        projectId: parsed.data.projectId,
        title: parsed.data.title,
        description: parsed.data.description,
        internalStart: parseDateString(parsed.data.internalStart, "La fecha inicial"),
        internalEnd: parseDateString(parsed.data.internalEnd, "La fecha final"),
        startLocationId,
        endLocationId,
        eventType: parsed.data.eventType,
        chapterOrEpisode: parsed.data.chapterOrEpisode,
        narrativeOrder: parsed.data.narrativeOrder,
        notes: parsed.data.notes,
        characters: {
          create: characterIds.map((characterId) => ({ characterId })),
        },
      },
    });
  } catch (error) {
    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos crear el evento.",
    );
  }

  refreshProjectRoutes(parsed.data.projectId);
  redirect(parsed.data.redirectTo);
}

export async function updateEventAction(
  _prevState: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const parsed = eventSchema.safeParse({
    eventId: formData.get("eventId"),
    projectId: formData.get("projectId"),
    redirectTo: formData.get("redirectTo"),
    title: formData.get("title"),
    description: formData.get("description"),
    internalStart: formData.get("internalStart"),
    internalEnd: formData.get("internalEnd"),
    startLocationId: formData.get("startLocationId"),
    endLocationId: formData.get("endLocationId"),
    eventType: formData.get("eventType"),
    chapterOrEpisode: formData.get("chapterOrEpisode"),
    narrativeOrder: formData.get("narrativeOrder"),
    notes: formData.get("notes"),
    characterIds: formData.getAll("characterIds"),
  });

  if (!parsed.success || !parsed.data.eventId) {
    return invalidFormState("No pudimos actualizar el evento.");
  }

  const user = await requireCurrentUser();

  try {
    await prisma.event.findFirstOrThrow({
      where: {
        id: parsed.data.eventId,
        projectId: parsed.data.projectId,
        project: {
          ownerId: user.id,
        },
      },
      select: { id: true },
    });

    const startLocationId = await assertOwnedLocation(
      parsed.data.projectId,
      user.id,
      parsed.data.startLocationId,
    );
    const endLocationId = await assertOwnedLocation(
      parsed.data.projectId,
      user.id,
      parsed.data.endLocationId,
    );
    const characterIds = await assertOwnedCharacterIds(
      parsed.data.projectId,
      user.id,
      parsed.data.characterIds,
    );

    await prisma.event.update({
      where: { id: parsed.data.eventId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        internalStart: parseDateString(parsed.data.internalStart, "La fecha inicial"),
        internalEnd: parseDateString(parsed.data.internalEnd, "La fecha final"),
        startLocationId,
        endLocationId,
        eventType: parsed.data.eventType,
        chapterOrEpisode: parsed.data.chapterOrEpisode,
        narrativeOrder: parsed.data.narrativeOrder,
        notes: parsed.data.notes,
        characters: {
          deleteMany: {},
          create: characterIds.map((characterId) => ({ characterId })),
        },
      },
    });
  } catch (error) {
    return invalidFormState(
      error instanceof Error ? error.message : "No pudimos actualizar el evento.",
    );
  }

  refreshProjectRoutes(parsed.data.projectId);
  redirect(parsed.data.redirectTo);
}

export async function deleteEventAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/projects");
  const user = await requireCurrentUser();

  await prisma.event.findFirstOrThrow({
    where: {
      id: eventId,
      projectId,
      project: {
        ownerId: user.id,
      },
    },
    select: { id: true },
  });

  await prisma.event.delete({ where: { id: eventId } });
  refreshProjectRoutes(projectId);
  redirect(redirectTo);
}

export async function createBlankTimelineEventAction(input: { projectId: string }) {
  const user = await requireCurrentUser();

  await getOwnedProjectOrThrow(input.projectId, user.id);

  const now = new Date();
  const event = await prisma.event.create({
    data: {
      projectId: input.projectId,
      title: "Evento sin titulo",
      internalStart: now,
      internalEnd: now,
      eventType: EventType.SCENE,
    },
    select: { id: true },
  });

  refreshProjectRoutes(input.projectId);

  return { eventId: event.id };
}

export async function assignCharacterToEventAction(input: {
  projectId: string;
  eventId: string;
  characterId: string;
}) {
  const user = await requireCurrentUser();

  const event = await prisma.event.findFirst({
    where: {
      id: input.eventId,
      projectId: input.projectId,
      project: {
        ownerId: user.id,
      },
    },
    select: { id: true },
  });

  if (!event) {
    throw new Error("No encontramos ese evento dentro de tu proyecto.");
  }

  const character = await prisma.character.findFirst({
    where: {
      id: input.characterId,
      projectId: input.projectId,
      project: {
        ownerId: user.id,
      },
    },
    select: { id: true },
  });

  if (!character) {
    throw new Error("No encontramos ese personaje dentro de tu proyecto.");
  }

  await prisma.eventCharacter.upsert({
    where: {
      eventId_characterId: {
        eventId: input.eventId,
        characterId: input.characterId,
      },
    },
    update: {},
    create: {
      eventId: input.eventId,
      characterId: input.characterId,
    },
  });

  refreshProjectRoutes(input.projectId);
}

export async function assignLocationToEventAction(input: {
  projectId: string;
  eventId: string;
  locationId: string;
  side: "start" | "end";
}) {
  const user = await requireCurrentUser();

  const event = await prisma.event.findFirst({
    where: {
      id: input.eventId,
      projectId: input.projectId,
      project: {
        ownerId: user.id,
      },
    },
    select: { id: true },
  });

  if (!event) {
    throw new Error("No encontramos ese evento dentro de tu proyecto.");
  }

  const locationId = await assertOwnedLocation(input.projectId, user.id, input.locationId);

  if (!locationId || (input.side !== "start" && input.side !== "end")) {
    throw new Error("No encontramos esa locacion dentro de tu proyecto.");
  }

  await prisma.event.update({
    where: { id: input.eventId },
    data:
      input.side === "start"
        ? { startLocationId: locationId }
        : { endLocationId: locationId },
  });

  refreshProjectRoutes(input.projectId);
}

export async function removeCharacterFromEventAction(input: {
  projectId: string;
  eventId: string;
  characterId: string;
}) {
  const user = await requireCurrentUser();

  const link = await prisma.eventCharacter.findFirst({
    where: {
      eventId: input.eventId,
      characterId: input.characterId,
      event: {
        projectId: input.projectId,
        project: {
          ownerId: user.id,
        },
      },
      character: {
        projectId: input.projectId,
      },
    },
    select: {
      eventId: true,
      characterId: true,
    },
  });

  if (!link) {
    return;
  }

  await prisma.eventCharacter.delete({
    where: {
      eventId_characterId: {
        eventId: input.eventId,
        characterId: input.characterId,
      },
    },
  });

  refreshProjectRoutes(input.projectId);
}

export async function importProjectJsonAction(
  _prevState: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const sourceProjectId = String(formData.get("sourceProjectId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/projects");
  const rawJson = String(formData.get("rawJson") ?? "").trim();

  if (!sourceProjectId) {
    return { error: "No encontramos el proyecto de destino para esta importacion." };
  }

  if (!rawJson) {
    return { error: "Pega un JSON valido para importar." };
  }

  const user = await requireCurrentUser();

  let bundle;

  try {
    bundle = parseContinuityImportJson(rawJson);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { error: "El JSON no tiene un formato valido." };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { error: "No pudimos procesar la importacion." };
    }

    if (error instanceof Error && "issues" in error) {
      return { error: "El JSON no cumple la estructura minima requerida." };
    }

    return { error: "No pudimos validar el JSON de importacion." };
  }

  try {
    const importedProject = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          ownerId: user.id,
          title: createImportedProjectTitle(bundle.project.title),
          type: bundle.project.type as ProjectType,
          description: bundle.project.description ?? null,
        },
        select: { id: true },
      });

      const locationIdMap = new Map<string, string>();
      const characterIdMap = new Map<string, string>();
      const eventIdMap = new Map<string, string>();

      for (const location of bundle.locations) {
        const created = await tx.location.create({
          data: {
            projectId: project.id,
            name: location.name,
            description: location.description ?? null,
            latitude: location.latitude ?? null,
            longitude: location.longitude ?? null,
            type: location.type as LocationType,
            notes: location.notes ?? null,
          },
          select: { id: true },
        });

        locationIdMap.set(location.id, created.id);
      }

      for (const character of bundle.characters) {
        const created = await tx.character.create({
          data: {
            projectId: project.id,
            name: character.name,
            alias: character.alias ?? null,
            description: character.description ?? null,
            notes: character.notes ?? null,
            color: character.color,
            maxTravelMode: (character.maxTravelMode as TravelMode | null) ?? null,
            maxSpeedKmh: character.maxSpeedKmh ?? null,
            status: character.status as CharacterStatus,
            statusDateInternal: character.statusDateInternal
              ? new Date(character.statusDateInternal)
              : null,
          },
          select: { id: true },
        });

        characterIdMap.set(character.id, created.id);
      }

      for (const event of bundle.events) {
        const created = await tx.event.create({
          data: {
            projectId: project.id,
            title: event.title,
            description: event.description ?? null,
            internalStart: new Date(event.internalStart),
            internalEnd: new Date(event.internalEnd),
            startLocationId: event.startLocationId
              ? locationIdMap.get(event.startLocationId) ?? null
              : null,
            endLocationId: event.endLocationId
              ? locationIdMap.get(event.endLocationId) ?? null
              : null,
            eventType: event.eventType as EventType,
            chapterOrEpisode: event.chapterOrEpisode ?? null,
            narrativeOrder: event.narrativeOrder ?? null,
            notes: event.notes ?? null,
          },
          select: { id: true },
        });

        eventIdMap.set(event.id, created.id);
      }

      for (const link of bundle.eventCharacters) {
        const mappedEventId = eventIdMap.get(link.eventId);
        const mappedCharacterId = characterIdMap.get(link.characterId);

        if (!mappedEventId || !mappedCharacterId) {
          continue;
        }

        await tx.eventCharacter.upsert({
          where: {
            eventId_characterId: {
              eventId: mappedEventId,
              characterId: mappedCharacterId,
            },
          },
          update: {},
          create: {
            eventId: mappedEventId,
            characterId: mappedCharacterId,
          },
        });
      }

      return project;
    });

    refreshProjectRoutes(importedProject.id);
    revalidatePath("/data-transfer");
    redirect(`/projects/${importedProject.id}/import-export`);
  } catch {
    return {
      error:
        "No pudimos importar el proyecto. Revisa enums, fechas y referencias de locaciones o personajes.",
      success: undefined,
    };
  }

  redirect(redirectTo);
}
