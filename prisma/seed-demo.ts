import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  CharacterStatus,
  EventType,
  LocationType,
  PrismaClient,
  ProjectType,
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

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "Admin", passwordHash: adminPasswordHash },
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
    },
  });

  const adminUser = await prisma.user.findUniqueOrThrow({
    where: { email: adminEmail },
  });

  const existingProject = await prisma.project.findFirst({
    where: { ownerId: adminUser.id, title: "Cromosoma Rojo" },
    select: { id: true },
  });

  const project = existingProject
    ? await prisma.project.update({
        where: { id: existingProject.id },
        data: {
          type: ProjectType.FILM,
          description:
            "Thriller ciberpunk. El detective Alex Cruz investiga la desaparición de la científica Valeria Kane y descubre una conspiración de tráfico de datos genéticos, un asesino fantasma y una IA que desafía la realidad.",
          characters: { deleteMany: {} },
          locations: { deleteMany: {} },
          events: { deleteMany: {} },
        },
      })
    : await prisma.project.create({
        data: {
          ownerId: adminUser.id,
          title: "Cromosoma Rojo",
          type: ProjectType.FILM,
          description:
            "Thriller ciberpunk. El detective Alex Cruz investiga la desaparición de la científica Valeria Kane y descubre una conspiración de tráfico de datos genéticos, un asesino fantasma y una IA que desafía la realidad.",
        },
      });

  // ── LOCATIONS ──
  const locData = [
    { name: "Oficina de Alex", type: LocationType.ROOM, lat: 19.4326, lon: -99.1332, desc: "Oficina del detective Alex Cruz, llena de monitores y archivos." },
    { name: "Laboratorio Genómica", type: LocationType.BUILDING, lat: 19.44, lon: -99.14, desc: "Laboratorio de investigación genética donde trabajaba Valeria." },
    { name: "Bar El Búnker", type: LocationType.BUILDING, lat: 19.43, lon: -99.145, desc: "Bar clandestino en el bajo mundo, punto de encuentro de informantes." },
    { name: "Puerto Oscuro", type: LocationType.CITY, lat: 19.41, lon: -99.125, desc: "Zona portuaria industrial, lugar de transacciones ilegales." },
    { name: "Comisaría Central", type: LocationType.BUILDING, lat: 19.445, lon: -99.13, desc: "Sede de la policía metropolitana." },
    { name: "Distrito Zero", type: LocationType.CITY, lat: 19.425, lon: -99.135, desc: "Barrio tecnológico, hogar de hackers y mercado negro digital." },
    { name: "Azotea Nexus", type: LocationType.ROOM, lat: 19.45, lon: -99.138, desc: "Azotea del edificio más alto de la ciudad." },
    { name: "Hospital Central", type: LocationType.BUILDING, lat: 19.438, lon: -99.128, desc: "Hospital público donde trabaja el doctor Chen." },
    { name: "Museo de Datos", type: LocationType.BUILDING, lat: 19.435, lon: -99.142, desc: "Museo interactivo de datos genéticos y archivos digitales." },
    { name: "Bóveda Subterránea", type: LocationType.ROOM, lat: 19.42, lon: -99.15, desc: "Búnker secreto bajo la ciudad, donde se guarda el código fuente de Iris." },
  ] as const;

  const locations = await Promise.all(
    locData.map((loc) =>
      prisma.location.create({
        data: {
          projectId: project.id,
          name: loc.name,
          type: loc.type,
          latitude: loc.lat,
          longitude: loc.lon,
          description: loc.desc,
        },
      }),
    ),
  );

  const [
    oficinaAlex,
    laboratorio,
    barBunker,
    puertoOscuro,
    comisaria,
    distritoZero,
    azoteaNexus,
    hospital,
    museoDatos,
    boveda,
  ] = locations;

  // ── CHARACTERS ──
  const charData: {
    name: string;
    alias: string | null;
    color: string;
    status: CharacterStatus;
    statusDate?: Date;
    desc: string;
  }[] = [
    { name: "Alex Cruz", alias: "El Detective", color: "#2B59C3", status: CharacterStatus.ALIVE, desc: "Detective privado con experiencia en casos corporativos. Persistente y callejero." },
    { name: "Valeria Kane", alias: "Dra. Kane", color: "#E9C46A", status: CharacterStatus.MISSING, statusDate: new Date("2026-03-25T22:00:00.000Z"), desc: "Científica genética desaparecida. Sus descubrimientos podrían cambiar el mundo." },
    { name: "Zero", alias: null, color: "#9B5DE5", status: CharacterStatus.ALIVE, desc: "Hacktivista enmascarado dueño del Distrito Zero. Nadie conoce su rostro." },
    { name: "Capitán Rojas", alias: "Sofía", color: "#2D6A4F", status: CharacterStatus.ALIVE, desc: "Capitana de policía, vieja aliada de Alex. Cree en la ley pero no duda en romperla." },
    { name: "Sombra", alias: "El Asesino Fantasma", color: "#000000", status: CharacterStatus.DEAD, statusDate: new Date("2026-04-01T03:00:00.000Z"), desc: "Asesino a sueldo letal, se pensaba invencible. Su cuerpo nunca fue recuperado." },
    { name: "Lena Orozco", alias: null, color: "#F4845F", status: CharacterStatus.ALIVE, desc: "Periodista de investigación obsesionada con el caso Valeria Kane." },
    { name: "El Curador", alias: null, color: "#F15BB5", status: CharacterStatus.ALIVE, desc: "Traficante de datos genéticos del mercado negro. Amoral y calculador." },
    { name: "Iris", alias: "IA", color: "#00BBF9", status: CharacterStatus.UNKNOWN, desc: "Inteligencia artificial autoconsciente creada por Valeria. Existe en la red." },
    { name: "Jagua", alias: null, color: "#00F5D4", status: CharacterStatus.ALIVE, desc: "Mercenaria letal con código propio. Trabaja para quien pague mejor." },
    { name: "Doctor Chen", alias: "Wei", color: "#FEE440", status: CharacterStatus.ALIVE, desc: "Forense del hospital, amigo de Alex. Siempre encuentra la pista que falta." },
  ];

  const characters = await Promise.all(
    charData.map((ch) =>
      prisma.character.create({
        data: {
          projectId: project.id,
          name: ch.name,
          alias: ch.alias,
          color: ch.color,
          status: ch.status,
          statusDateInternal: ch.statusDate ?? null,
          description: ch.desc,
        },
      }),
    ),
  );

  const [
    alex,
    valeria,
    zero,
    rojas,
    sombra,
    lena,
    curador,
    iris,
    jagua,
    chen,
  ] = characters;

  // ── EVENT HELPERS ──
  function iso(date: string, time: string) {
    return new Date(`2026-${date}T${time}:00.000Z`);
  }

  async function createEvent(params: {
    title: string;
    type: EventType;
    start: string;
    end: string;
    startLoc?: string;
    endLoc?: string;
    narrativeOrder: number;
    characters: string[];
    chapter?: string;
    desc?: string;
  }) {
    const [sDate, sTime] = params.start.split(" ");
    const [eDate, eTime] = params.end.split(" ");

    return prisma.event.create({
      data: {
        projectId: project.id,
        title: params.title,
        eventType: params.type,
        internalStart: iso(sDate, sTime),
        internalEnd: iso(eDate, eTime),
        startLocationId: params.startLoc ?? null,
        endLocationId: params.endLoc ?? null,
        narrativeOrder: params.narrativeOrder,
        chapterOrEpisode: params.chapter ?? null,
        description: params.desc ?? null,
        characters: {
          create: params.characters.map((id) => ({ characterId: id })),
        },
      },
    });
  }

  // ────────────────────────────────────────────
  // ACTO 1 — EL CASO (8 eventos normales)
  // ────────────────────────────────────────────
  await createEvent({
    title: "El detective espera",
    type: EventType.SCENE,
    start: "03-25 08:00", end: "03-25 08:20",
    startLoc: oficinaAlex.id, endLoc: oficinaAlex.id,
    narrativeOrder: 1, chapter: "Acto 1",
    characters: [alex.id],
    desc: "Alex revisa archivos en su oficina. Todo parece un día normal.",
  });

  await createEvent({
    title: "La llamada de Valeria",
    type: EventType.SCENE,
    start: "03-25 08:20", end: "03-25 08:50",
    startLoc: oficinaAlex.id, endLoc: oficinaAlex.id,
    narrativeOrder: 2, chapter: "Acto 1",
    characters: [alex.id, valeria.id],
    desc: "Valeria llama a Alex, preocupada. Algo descubrió en el laboratorio.",
  });

  await createEvent({
    title: "Camino a comisaría",
    type: EventType.TRAVEL,
    start: "03-25 08:50", end: "03-25 09:20",
    startLoc: oficinaAlex.id, endLoc: comisaria.id,
    narrativeOrder: 3, chapter: "Acto 1",
    characters: [alex.id],
    desc: "Alex viaja a la comisaría para reunirse con Rojas.",
  });

  await createEvent({
    title: "El caso oficial",
    type: EventType.SCENE,
    start: "03-25 09:20", end: "03-25 10:00",
    startLoc: comisaria.id, endLoc: comisaria.id,
    narrativeOrder: 4, chapter: "Acto 1",
    characters: [alex.id, rojas.id],
    desc: "Rojas asigna el caso a Alex extraoficialmente. Algo grande se cocina.",
  });

  await createEvent({
    title: "Autopsia de datos",
    type: EventType.SCENE,
    start: "03-25 10:30", end: "03-25 12:00",
    startLoc: hospital.id, endLoc: hospital.id,
    narrativeOrder: 5, chapter: "Acto 1",
    characters: [alex.id, chen.id],
    desc: "Chen muestra a Alex los primeros indicios: manipulación genética.",
  });

  await createEvent({
    title: "Regreso a la oficina",
    type: EventType.TRAVEL,
    start: "03-25 12:00", end: "03-25 12:30",
    startLoc: hospital.id, endLoc: oficinaAlex.id,
    narrativeOrder: 6, chapter: "Acto 1",
    characters: [alex.id],
    desc: "Alex vuelve a su oficina a procesar la información.",
  });

  await createEvent({
    title: "El hacker del distrito",
    type: EventType.SCENE,
    start: "03-25 13:00", end: "03-25 14:30",
    startLoc: distritoZero.id, endLoc: distritoZero.id,
    narrativeOrder: 7, chapter: "Acto 1",
    characters: [alex.id, zero.id],
    desc: "Zero accede a ayudar a Alex. Tienen una deuda pendiente.",
  });

  await createEvent({
    title: "Periodista en el bar",
    type: EventType.SCENE,
    start: "03-25 15:00", end: "03-25 16:30",
    startLoc: barBunker.id, endLoc: barBunker.id,
    narrativeOrder: 8, chapter: "Acto 1",
    characters: [lena.id],
    desc: "Lena investiga por su cuenta en el bar clandestino.",
  });

  // ────────────────────────────────────────────
  // ACTO 2 — PIEZAS DEL ROMPECABEZAS (7 eventos normales)
  // ────────────────────────────────────────────
  await createEvent({
    title: "Zero y Alex al bar",
    type: EventType.TRAVEL,
    start: "03-25 16:30", end: "03-25 17:00",
    startLoc: distritoZero.id, endLoc: barBunker.id,
    narrativeOrder: 9, chapter: "Acto 2",
    characters: [alex.id, zero.id],
    desc: "Zero guía a Alex por los túneles hacia el Bar El Búnker.",
  });

  await createEvent({
    title: "Reunión en El Búnker",
    type: EventType.SCENE,
    start: "03-25 17:00", end: "03-25 18:30",
    startLoc: barBunker.id, endLoc: barBunker.id,
    narrativeOrder: 10, chapter: "Acto 2",
    characters: [alex.id, zero.id, lena.id],
    desc: "El trío comparte información. Las piezas empiezan a encajar.",
  });

  await createEvent({
    title: "El forense nocturno",
    type: EventType.SCENE,
    start: "03-25 19:00", end: "03-25 20:00",
    startLoc: hospital.id, endLoc: hospital.id,
    narrativeOrder: 11, chapter: "Acto 2",
    characters: [chen.id],
    desc: "Chen analiza las muestras genéticas. Descubre un patrón alarmante.",
  });

  await createEvent({
    title: "Valeria desaparece",
    type: EventType.SCENE,
    start: "03-25 20:30", end: "03-25 21:00",
    startLoc: laboratorio.id, endLoc: laboratorio.id,
    narrativeOrder: 12, chapter: "Acto 2",
    characters: [valeria.id],
    desc: "Valeria es interceptada en el laboratorio.",
  });

  await createEvent({
    title: "Carrera al laboratorio",
    type: EventType.TRAVEL,
    start: "03-25 21:30", end: "03-25 22:00",
    startLoc: oficinaAlex.id, endLoc: laboratorio.id,
    narrativeOrder: 13, chapter: "Acto 2",
    characters: [alex.id],
    desc: "Alex corre al laboratorio al recibir la alerta.",
  });

  await createEvent({
    title: "La escena vacía",
    type: EventType.SCENE,
    start: "03-25 22:00", end: "03-25 23:00",
    startLoc: laboratorio.id, endLoc: laboratorio.id,
    narrativeOrder: 14, chapter: "Acto 2",
    characters: [alex.id, chen.id],
    desc: "El laboratorio está revuelto. Valeria no está. Solo queda un mensaje cifrado.",
  });

  await createEvent({
    title: "El Curador recibe visita",
    type: EventType.SCENE,
    start: "03-26 09:00", end: "03-26 10:30",
    startLoc: museoDatos.id, endLoc: museoDatos.id,
    narrativeOrder: 15, chapter: "Acto 2",
    characters: [alex.id, curador.id, lena.id],
    desc: "El Curador ofrece un trato: información a cambio de protección.",
  });

  // ────────────────────────────────────────────
  // ACTO 3 — COLISIONES INTENCIONALES
  // ────────────────────────────────────────────
  await createEvent({
    title: "Contrato en el puerto",
    type: EventType.SCENE,
    start: "03-26 11:00", end: "03-26 12:00",
    startLoc: puertoOscuro.id, endLoc: puertoOscuro.id,
    narrativeOrder: 16, chapter: "Acto 3",
    characters: [jagua.id, sombra.id],
    desc: "Jagua recibe el encargo de eliminar a Valeria. Sombra observa desde las sombras.",
  });

  // --- COLLISION 1: Alex se solapa en dos escenas (CHARACTER_OVERLAPPING_EVENTS) ---
  await createEvent({
    title: "Puerto Oscuro",
    type: EventType.SCENE,
    start: "03-26 14:00", end: "03-26 16:00",
    startLoc: puertoOscuro.id, endLoc: puertoOscuro.id,
    narrativeOrder: 17, chapter: "Acto 3",
    characters: [alex.id, jagua.id],
    desc: "Alex interroga a Jagua sobre el contrato.",
  });
  await createEvent({
    title: "De vuelta al bunker",
    type: EventType.SCENE,
    start: "03-26 15:00", end: "03-26 16:30",
    startLoc: barBunker.id, endLoc: barBunker.id,
    narrativeOrder: 18, chapter: "Acto 3",
    characters: [alex.id, zero.id],
    desc: "Zero llama a Alex para una reunión urgente… pero Alex ya está en el puerto.",
  });

  // --- COLLISION 2: Zero cambia de locación sin TRAVEL (CHARACTER_APPEARS_WITHOUT_TRAVEL) ---
  await createEvent({
    title: "Rojas presiona",
    type: EventType.SCENE,
    start: "03-26 17:00", end: "03-26 18:00",
    startLoc: comisaria.id, endLoc: comisaria.id,
    narrativeOrder: 19, chapter: "Acto 3",
    characters: [rojas.id, lena.id],
    desc: "Rojas exige resultados. Lena filtra información sensible.",
  });
  await createEvent({
    title: "Zero hackea el sistema",
    type: EventType.SCENE,
    start: "03-26 18:30", end: "03-26 19:30",
    startLoc: distritoZero.id, endLoc: distritoZero.id,
    narrativeOrder: 20, chapter: "Acto 3",
    characters: [zero.id],
    desc: "Zero penetra la base de datos del laboratorio desde su guarida.",
  });
  await createEvent({
    title: "Zero en el laboratorio",
    type: EventType.SCENE,
    start: "03-26 19:40", end: "03-26 20:30",
    startLoc: laboratorio.id, endLoc: laboratorio.id,
    narrativeOrder: 21, chapter: "Acto 3",
    characters: [zero.id, chen.id],
    desc: "Zero aparece en el laboratorio sin explicación de cómo llegó.",
  });

  // --- COLLISION 3: Evento termina antes de empezar (EVENT_END_BEFORE_START) ---
  await createEvent({
    title: "Error en la bitácora",
    type: EventType.ELLIPSIS,
    start: "03-26 21:00", end: "03-26 20:30",
    startLoc: comisaria.id, endLoc: comisaria.id,
    narrativeOrder: 22, chapter: "Acto 3",
    characters: [rojas.id],
    desc: "Un error administrativo en el sistema de bitácoras.",
  });

  // --- COLLISION 4: Escena sin personajes (SCENE_WITHOUT_CHARACTERS) ---
  await createEvent({
    title: "Servidores vacíos",
    type: EventType.SCENE,
    start: "03-26 22:00", end: "03-26 23:00",
    startLoc: laboratorio.id, endLoc: laboratorio.id,
    narrativeOrder: 23, chapter: "Acto 3",
    characters: [],
    desc: "Los servidores del laboratorio funcionan solos. Algo se ejecuta en la red.",
  });

  // --- COLLISION 5: Escena sin locación (SCENE_WITHOUT_LOCATION) ---
  await createEvent({
    title: "Llamada cifrada",
    type: EventType.CONVERSATION,
    start: "03-27 08:00", end: "03-27 08:30",
    startLoc: undefined, endLoc: undefined,
    narrativeOrder: 24, chapter: "Acto 3",
    characters: [alex.id, zero.id],
    desc: "Zero contacta a Alex por canal encriptado. Nadie sabe desde dónde.",
  });

  // --- COLLISION 6: Valeria aparece después de estar MISSING (CHARACTER_APPEARS_AFTER_STATUS) ---
  await createEvent({
    title: "Valeria reaparece",
    type: EventType.SCENE,
    start: "03-27 10:00", end: "03-27 11:00",
    startLoc: museoDatos.id, endLoc: museoDatos.id,
    narrativeOrder: 25, chapter: "Acto 3",
    characters: [alex.id, valeria.id, curador.id],
    desc: "Valeria aparece en el museo. ¿Cómo escapó? ¿Dónde estuvo?",
  });

  // --- COLLISION 7: Jagua se solapa (CHARACTER_OVERLAPPING_EVENTS) ---
  await createEvent({
    title: "Pelea en el puerto",
    type: EventType.BATTLE,
    start: "03-27 14:00", end: "03-27 15:00",
    startLoc: puertoOscuro.id, endLoc: puertoOscuro.id,
    narrativeOrder: 26, chapter: "Acto 3",
    characters: [jagua.id, zero.id],
    desc: "Jagua y Zero se enfrentan en los muelles.",
  });
  await createEvent({
    title: "Jagua negocia",
    type: EventType.SCENE,
    start: "03-27 14:30", end: "03-27 15:30",
    startLoc: museoDatos.id, endLoc: museoDatos.id,
    narrativeOrder: 27, chapter: "Acto 3",
    characters: [jagua.id, curador.id],
    desc: "Jagua está al mismo tiempo negociando con el Curador en el museo.",
  });

  // ────────────────────────────────────────────
  // ACTO 4 — DESENLACE (3 eventos, COLLISION con Sombra)
  // ────────────────────────────────────────────
  await createEvent({
    title: "Estrategia final",
    type: EventType.SCENE,
    start: "04-01 07:00", end: "04-01 08:30",
    startLoc: barBunker.id, endLoc: barBunker.id,
    narrativeOrder: 28, chapter: "Acto 4",
    characters: [alex.id, zero.id, rojas.id, jagua.id],
    desc: "El equipo planea el asalto final a la bóveda.",
  });

  // --- COLLISION 8: Sombra aparece después de muerto (CHARACTER_APPEARS_AFTER_STATUS) ---
  await createEvent({
    title: "Sombra en la azotea",
    type: EventType.SCENE,
    start: "04-01 10:00", end: "04-01 11:30",
    startLoc: azoteaNexus.id, endLoc: azoteaNexus.id,
    narrativeOrder: 29, chapter: "Acto 4",
    characters: [alex.id, rojas.id, sombra.id],
    desc: "Sombra aparece en la azotea a pesar de haber muerto días antes.",
  });

  await createEvent({
    title: "Viaje a la bóveda",
    type: EventType.TRAVEL,
    start: "04-01 08:30", end: "04-01 11:45",
    startLoc: barBunker.id, endLoc: boveda.id,
    narrativeOrder: 30, chapter: "Acto 4",
    characters: [alex.id, zero.id, rojas.id, jagua.id],
    desc: "El equipo viaja desde el bar hacia la bóveda subterránea.",
  });

  await createEvent({
    title: "Asalto a la bóveda",
    type: EventType.BATTLE,
    start: "04-01 12:00", end: "04-01 14:00",
    startLoc: boveda.id, endLoc: boveda.id,
    narrativeOrder: 31, chapter: "Acto 4",
    characters: [alex.id, zero.id, jagua.id, rojas.id, curador.id],
    desc: "El enfrentamiento final. Iris se manifiesta por primera vez.",
  });

  await createEvent({
    title: "Iris despierta",
    type: EventType.CONVERSATION,
    start: "04-01 14:00", end: "04-01 14:30",
    startLoc: boveda.id, endLoc: boveda.id,
    narrativeOrder: 32, chapter: "Acto 4",
    characters: [alex.id, iris.id, valeria.id],
    desc: "Iris habla a través de los monitores. Valeria regresa para despedirse.",
  });

  // ────────────────────────────────────────────
  // REPORTE
  // ────────────────────────────────────────────
  const fullProject = await prisma.project.findUnique({
    where: { id: project.id },
    include: {
      characters: true,
      locations: true,
      events: {
        orderBy: { narrativeOrder: "asc" },
        include: {
          characters: { include: { character: true } },
        },
      },
    },
  });

  console.log("Proyecto creado exitosamente:\n");
  console.log(`  Título:    ${fullProject?.title}`);
  console.log(`  Tipo:      ${fullProject?.type}`);
  console.log(`  Personajes: ${fullProject?.characters.length}`);
  console.log(`  Locaciones: ${fullProject?.locations.length}`);
  console.log(`  Eventos:   ${fullProject?.events.length}`);
  console.log("\n--- COLISIONES INTENCIONALES ---\n");

  console.log("1. CHARACTER_OVERLAPPING_EVENTS — Alex en \"Puerto Oscuro\" (14:00-16:00) y \"De vuelta al bunker\" (15:00-16:30)");
  console.log("2. CHARACTER_APPEARS_WITHOUT_TRAVEL — Zero: Distrito Zero → Laboratorio sin viaje");
  console.log("3. EVENT_END_BEFORE_START — \"Error en la bitácora\" termina antes de empezar");
  console.log("4. SCENE_WITHOUT_CHARACTERS — \"Servidores vacíos\" sin personajes asignados");
  console.log("5. SCENE_WITHOUT_LOCATION — \"Llamada cifrada\" sin locación");
  console.log("6. CHARACTER_APPEARS_AFTER_STATUS — Valeria (MISSING) reaparece");
  console.log("7. CHARACTER_OVERLAPPING_EVENTS — Jagua: \"Pelea en el puerto\" y \"Jagua negocia\"");
  console.log("8. CHARACTER_APPEARS_AFTER_STATUS — Sombra (DEAD) aparece en azotea");
  console.log("\nAdemás, se generarán colisiones adicionales por la estructura normal del proyecto (viajes faltantes entre secuencias).");
  console.log("\nTodo listo — inicia sesión como admin@continuity.local / admin");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
