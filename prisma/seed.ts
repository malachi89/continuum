import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  CharacterStatus,
  EventType,
  LocationType,
  PrismaClient,
  ProjectType,
  TravelMode,
} from "@prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  const adminEmail = "admin@continuity.local";
  const adminPasswordHash = await hashPassword("admin");
  const email = "demo@continuity.local";
  const passwordHash = await hashPassword("continuity123");

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin",
      passwordHash: adminPasswordHash,
    },
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
    },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Demo User",
      passwordHash,
    },
    create: {
      name: "Demo User",
      email,
      passwordHash,
    },
  });

  const existingProject = await prisma.project.findFirst({
    where: {
      ownerId: user.id,
      title: "Demo: Viaje Imposible",
    },
    select: { id: true },
  });

  const project =
    existingProject
      ? await prisma.project.update({
          where: { id: existingProject.id },
          data: {
            type: ProjectType.NOVEL,
            description: "Proyecto demo para validar continuidad narrativa.",
            characters: { deleteMany: {} },
            locations: { deleteMany: {} },
            events: { deleteMany: {} },
          },
        })
      : await prisma.project.create({
          data: {
            ownerId: user.id,
            title: "Demo: Viaje Imposible",
            type: ProjectType.NOVEL,
            description: "Proyecto demo para validar continuidad narrativa.",
          },
        });

  const mexicoCity = await prisma.location.create({
    data: {
      projectId: project.id,
      name: "Ciudad de Mexico",
      latitude: 19.4326,
      longitude: -99.1332,
      type: LocationType.CITY,
      description: "Punto de partida del evento demo.",
    },
  });

  const tokyo = await prisma.location.create({
    data: {
      projectId: project.id,
      name: "Tokio",
      latitude: 35.6762,
      longitude: 139.6503,
      type: LocationType.CITY,
      description: "Destino imposible del evento demo.",
    },
  });

  const bruno = await prisma.character.create({
    data: {
      projectId: project.id,
      name: "Bruno",
      color: "#E85D04",
      maxTravelMode: TravelMode.CAR,
      maxSpeedKmh: 80,
      status: CharacterStatus.UNKNOWN,
      description: "Personaje demo para pruebas de continuidad.",
    },
  });

  const event1 = await prisma.event.create({
    data: {
      projectId: project.id,
      title: "Bruno en Ciudad de Mexico",
      internalStart: new Date("2026-01-01T14:03:00.000Z"),
      internalEnd: new Date("2026-01-01T14:03:00.000Z"),
      startLocationId: mexicoCity.id,
      endLocationId: mexicoCity.id,
      eventType: EventType.SCENE,
      narrativeOrder: 1,
      characters: {
        create: [{ characterId: bruno.id }],
      },
    },
  });

  await prisma.event.create({
    data: {
      projectId: project.id,
      title: "Bruno en Tokio",
      internalStart: new Date("2026-01-01T14:04:00.000Z"),
      internalEnd: new Date("2026-01-01T14:04:00.000Z"),
      startLocationId: tokyo.id,
      endLocationId: tokyo.id,
      eventType: EventType.SCENE,
      narrativeOrder: 2,
      characters: {
        create: [{ characterId: bruno.id }],
      },
    },
  });

  const demoProject = await prisma.project.findUnique({
    where: { id: project.id },
    include: {
      characters: true,
      locations: true,
      events: {
        orderBy: { internalStart: "asc" },
        include: {
          characters: {
            include: {
              character: true,
            },
          },
        },
      },
    },
  });

  console.log(
    JSON.stringify(
      {
        user: { id: user.id, email: user.email },
        project: demoProject,
        firstEventId: event1.id,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
