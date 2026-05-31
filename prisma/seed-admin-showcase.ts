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

function iso(date: string, time: string) {
  return new Date(`${date}T${time}:00.000Z`);
}

async function createOrResetProject(params: {
  ownerId: string;
  title: string;
  type: ProjectType;
  description: string;
}) {
  const existingProject = await prisma.project.findFirst({
    where: {
      ownerId: params.ownerId,
      title: params.title,
    },
    select: { id: true },
  });

  if (existingProject) {
    return prisma.project.update({
      where: { id: existingProject.id },
      data: {
        type: params.type,
        description: params.description,
        characters: { deleteMany: {} },
        locations: { deleteMany: {} },
        events: { deleteMany: {} },
      },
    });
  }

  return prisma.project.create({
    data: {
      ownerId: params.ownerId,
      title: params.title,
      type: params.type,
      description: params.description,
    },
  });
}

async function createEvent(params: {
  projectId: string;
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
  const [startDate, startTime] = params.start.split(" ");
  const [endDate, endTime] = params.end.split(" ");

  return prisma.event.create({
    data: {
      projectId: params.projectId,
      title: params.title,
      eventType: params.type,
      internalStart: iso(startDate, startTime),
      internalEnd: iso(endDate, endTime),
      startLocationId: params.startLoc ?? null,
      endLocationId: params.endLoc ?? null,
      narrativeOrder: params.narrativeOrder,
      chapterOrEpisode: params.chapter ?? null,
      description: params.desc ?? null,
      characters: {
        create: params.characters.map((characterId) => ({ characterId })),
      },
    },
  });
}

async function seedWeekendGuard(adminUserId: string) {
  const project = await createOrResetProject({
    ownerId: adminUserId,
    title: "Guardia de Fin de Semana",
    type: ProjectType.SERIES,
    description:
      "Drama policial contemporáneo. Un turno ordinario termina revelando contradicciones, trayectos imposibles y errores de bitácora útiles para demostrar el análisis de continuidad.",
  });

  const locations = await Promise.all([
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Hospital San Gabriel",
        type: LocationType.BUILDING,
        latitude: 19.4274,
        longitude: -99.1677,
        description: "Hospital público donde Lucía y Mateo cubren la guardia.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Cafetería Lisboa",
        type: LocationType.BUILDING,
        latitude: 19.4312,
        longitude: -99.1625,
        description: "Cafetería de barrio frente a una avenida transitada.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Archivo Municipal",
        type: LocationType.BUILDING,
        latitude: 19.4349,
        longitude: -99.1461,
        description: "Edificio gris con expedientes y cámaras viejas.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Terminal Norte",
        type: LocationType.BUILDING,
        latitude: 19.4789,
        longitude: -99.1238,
        description: "Terminal de autobuses con andenes saturados.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Comisaría Centro",
        type: LocationType.BUILDING,
        latitude: 19.4296,
        longitude: -99.1398,
        description: "Comisaría de guardia donde Nora arma la versión oficial.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Puente de Talleres",
        type: LocationType.OTHER,
        latitude: 19.4637,
        longitude: -99.1145,
        description: "Puente industrial con tráfico pesado y pocos testigos.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Departamento 3B",
        type: LocationType.ROOM,
        latitude: 19.4252,
        longitude: -99.1543,
        description: "Departamento pequeño donde alguien toca la puerta demasiado tarde.",
      },
    }),
  ]);

  const [
    hospital,
    cafeteria,
    archivo,
    terminal,
    comisaria,
    puente,
    departamento,
  ] = locations;

  const characters = await Promise.all([
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Lucía Torres",
        alias: null,
        color: "#C95D63",
        status: CharacterStatus.ALIVE,
        description: "Enfermera de urgencias acostumbrada a reconstruir historias rotas.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Mateo Rivas",
        alias: "Mati",
        color: "#3A86FF",
        status: CharacterStatus.ALIVE,
        description: "Paramédico práctico, rápido para moverse y lento para escribir reportes.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Elena Cruz",
        alias: null,
        color: "#FF9F1C",
        status: CharacterStatus.ALIVE,
        description: "Periodista local que sigue pistas menores hasta que dejan de serlo.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Nora Salas",
        alias: "Nori",
        color: "#2A9D8F",
        status: CharacterStatus.ALIVE,
        description: "Detective que sospecha más de los huecos del relato que de la versión oficial.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Julián Varela",
        alias: null,
        color: "#6D597A",
        status: CharacterStatus.MISSING,
        statusDateInternal: new Date("2026-06-14T20:15:00.000Z"),
        description: "Testigo joven que ve demasiado y luego deja de contestar.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Tomás Ibarra",
        alias: null,
        color: "#264653",
        status: CharacterStatus.ALIVE,
        description: "Chofer con memoria precisa para las horas y dudosa para los nombres.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Bruno Mejía",
        alias: "Bru",
        color: "#8D6A9F",
        status: CharacterStatus.ALIVE,
        description: "Portero nocturno que conoce a todos pero rara vez dice todo lo que sabe.",
      },
    }),
  ]);

  const [lucia, mateo, elena, nora, julian, tomas, bruno] = characters;

  await createEvent({
    projectId: project.id,
    title: "Cambio de turno",
    type: EventType.SCENE,
    start: "2026-06-14 07:00",
    end: "2026-06-14 07:20",
    startLoc: hospital.id,
    endLoc: hospital.id,
    narrativeOrder: 1,
    chapter: "Turno 1",
    characters: [lucia.id, mateo.id],
    desc: "Lucía y Mateo reciben la guardia mientras revisan el pizarrón de pacientes.",
  });

  await createEvent({
    projectId: project.id,
    title: "Café antes del cierre",
    type: EventType.SCENE,
    start: "2026-06-14 07:30",
    end: "2026-06-14 08:00",
    startLoc: cafeteria.id,
    endLoc: cafeteria.id,
    narrativeOrder: 2,
    chapter: "Turno 1",
    characters: [elena.id, bruno.id],
    desc: "Elena escucha a Bruno hablar sobre una mochila olvidada en urgencias.",
  });

  await createEvent({
    projectId: project.id,
    title: "Julián toma el archivo",
    type: EventType.SCENE,
    start: "2026-06-14 08:10",
    end: "2026-06-14 08:40",
    startLoc: archivo.id,
    endLoc: archivo.id,
    narrativeOrder: 3,
    chapter: "Turno 1",
    characters: [julian.id],
    desc: "Julián saca un expediente que no debería seguir en la estantería.",
  });

  await createEvent({
    projectId: project.id,
    title: "Llamada a Nora",
    type: EventType.CONVERSATION,
    start: "2026-06-14 09:00",
    end: "2026-06-14 09:15",
    startLoc: archivo.id,
    endLoc: archivo.id,
    narrativeOrder: 4,
    chapter: "Turno 1",
    characters: [julian.id, nora.id],
    desc: "Julián llama a Nora para decirle que encontró una firma repetida.",
  });

  await createEvent({
    projectId: project.id,
    title: "Traslado al hospital",
    type: EventType.TRAVEL,
    start: "2026-06-14 09:30",
    end: "2026-06-14 10:00",
    startLoc: archivo.id,
    endLoc: hospital.id,
    narrativeOrder: 5,
    chapter: "Turno 1",
    characters: [mateo.id],
    desc: "Mateo cruza la ciudad para apoyar una revisión interna en urgencias.",
  });

  await createEvent({
    projectId: project.id,
    title: "Entrevista en el pasillo",
    type: EventType.SCENE,
    start: "2026-06-14 10:10",
    end: "2026-06-14 11:00",
    startLoc: hospital.id,
    endLoc: hospital.id,
    narrativeOrder: 6,
    chapter: "Turno 2",
    characters: [lucia.id, elena.id, nora.id],
    desc: "Nora presiona con preguntas cortas; Elena escucha más de lo que publica.",
  });

  await createEvent({
    projectId: project.id,
    title: "Declaración en terminal",
    type: EventType.SCENE,
    start: "2026-06-14 11:15",
    end: "2026-06-14 12:00",
    startLoc: terminal.id,
    endLoc: terminal.id,
    narrativeOrder: 7,
    chapter: "Turno 2",
    characters: [nora.id, tomas.id],
    desc: "Tomás insiste en que vio a Julián subir a un taxi distinto del que figura en el reporte.",
  });

  await createEvent({
    projectId: project.id,
    title: "Lucía revisa la mochila",
    type: EventType.SCENE,
    start: "2026-06-14 11:20",
    end: "2026-06-14 12:10",
    startLoc: hospital.id,
    endLoc: hospital.id,
    narrativeOrder: 8,
    chapter: "Turno 2",
    characters: [lucia.id],
    desc: "Lucía encuentra recibos y una llave sin etiqueta dentro de la mochila.",
  });

  await createEvent({
    projectId: project.id,
    title: "Lucía habla con Bruno",
    type: EventType.SCENE,
    start: "2026-06-14 11:40",
    end: "2026-06-14 12:20",
    startLoc: cafeteria.id,
    endLoc: cafeteria.id,
    narrativeOrder: 9,
    chapter: "Turno 2",
    characters: [lucia.id, bruno.id],
    desc: "Bruno jura que la vio hace minutos, aunque también la sigue viendo en el hospital.",
  });

  await createEvent({
    projectId: project.id,
    title: "Mateo firma en comisaría",
    type: EventType.SCENE,
    start: "2026-06-14 12:30",
    end: "2026-06-14 13:00",
    startLoc: comisaria.id,
    endLoc: comisaria.id,
    narrativeOrder: 10,
    chapter: "Turno 2",
    characters: [mateo.id],
    desc: "Mateo firma un parte fuera del hospital sin dejar registrado el trayecto intermedio.",
  });

  await createEvent({
    projectId: project.id,
    title: "Cámara del pasillo",
    type: EventType.SCENE,
    start: "2026-06-14 13:10",
    end: "2026-06-14 13:30",
    startLoc: hospital.id,
    endLoc: hospital.id,
    narrativeOrder: 11,
    chapter: "Turno 2",
    characters: [],
    desc: "El sistema guarda una escena útil para la demo pero nadie quedó asignado al momento.",
  });

  await createEvent({
    projectId: project.id,
    title: "Audio sin origen",
    type: EventType.CONVERSATION,
    start: "2026-06-14 13:40",
    end: "2026-06-14 14:00",
    narrativeOrder: 12,
    chapter: "Turno 2",
    characters: [elena.id, nora.id],
    desc: "Un audio comprimido llega al teléfono de Elena sin metadatos de lugar.",
  });

  await createEvent({
    projectId: project.id,
    title: "Parte corregido a mano",
    type: EventType.ELLIPSIS,
    start: "2026-06-14 14:30",
    end: "2026-06-14 14:10",
    startLoc: comisaria.id,
    endLoc: comisaria.id,
    narrativeOrder: 13,
    chapter: "Turno 2",
    characters: [nora.id],
    desc: "El parte muestra una hora de cierre anterior a la de apertura.",
  });

  await createEvent({
    projectId: project.id,
    title: "Julián desaparece",
    type: EventType.SCENE,
    start: "2026-06-14 20:00",
    end: "2026-06-14 20:15",
    startLoc: puente.id,
    endLoc: puente.id,
    narrativeOrder: 14,
    chapter: "Noche",
    characters: [julian.id],
    desc: "La última vista confirmada de Julián queda registrada cerca del puente.",
  });

  await createEvent({
    projectId: project.id,
    title: "Julián toca la puerta",
    type: EventType.SCENE,
    start: "2026-06-15 09:00",
    end: "2026-06-15 09:20",
    startLoc: departamento.id,
    endLoc: departamento.id,
    narrativeOrder: 15,
    chapter: "Día siguiente",
    characters: [julian.id, lucia.id],
    desc: "Julián aparece al día siguiente como si nunca hubiera desaparecido.",
  });

  return project;
}

async function seedRatCaravan(adminUserId: string) {
  const project = await createOrResetProject({
    ownerId: adminUserId,
    title: "La Caravana de las Ratas de Andrómeda",
    type: ProjectType.COMIC,
    description:
      "Ópera espacial de ratas nómadas. Un convoy cruza puertos imposibles, archivos vivos y jardines orbitales sin romper la continuidad del viaje.",
  });

  const locations = await Promise.all([
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Muelle de Caronte",
        type: LocationType.OTHER,
        latitude: 12.4,
        longitude: 48.2,
        description: "Dársena mineral donde la caravana despierta entre neblina magnética.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Ascensor Solar de Kepler-442b",
        type: LocationType.BUILDING,
        latitude: 24.1,
        longitude: 67.8,
        description: "Torre orbital que sube cargamentos hacia una cinta de luz.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Mercado de Cascaras de Titan Lejano",
        type: LocationType.CITY,
        latitude: 36.7,
        longitude: 82.4,
        description: "Mercado interestelar hecho de caparazones huecos y vapor dulce.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Archivo Fractal de Tau Ceti",
        type: LocationType.BUILDING,
        latitude: 44.9,
        longitude: 94.5,
        description: "Biblioteca viva donde los mapas se pliegan cuando alguien miente.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Astillero de Deneb",
        type: LocationType.BUILDING,
        latitude: 52.6,
        longitude: 109.2,
        description: "Astillero suspendido sobre una marea de chatarra estelar.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Faro Gravitacional NGC-7318",
        type: LocationType.BUILDING,
        latitude: 61.2,
        longitude: 123.7,
        description: "Faro que curva rutas enteras para convoyes demasiado lentos.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Jardines de Proxima Umbral",
        type: LocationType.PLANET,
        latitude: 73.1,
        longitude: 140.8,
        description: "Jardines de bioluz roja donde termina el cruce de la caravana.",
      },
    }),
  ]);

  const [muelle, ascensor, mercado, archivo, astillero, faro, jardines] = locations;

  const characters = await Promise.all([
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Capitana Mica",
        alias: "Nube",
        color: "#A8DADC",
        status: CharacterStatus.ALIVE,
        description: "Capitana de la caravana y lectora de corrientes solares.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Riel",
        alias: null,
        color: "#457B9D",
        status: CharacterStatus.ALIVE,
        description: "Mecánico de arneses magnéticos y rutas silenciosas.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Doctora Clado",
        alias: null,
        color: "#E9C46A",
        status: CharacterStatus.ALIVE,
        description: "Botánica orbital que conserva semillas de gravedad baja.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Púa",
        alias: "Siete Colas",
        color: "#F4A261",
        status: CharacterStatus.ALIVE,
        description: "Mercader veloz con talento para regatear hasta con faros automáticos.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Vanta",
        alias: null,
        color: "#6D597A",
        status: CharacterStatus.ALIVE,
        description: "Piloto de apoyo que vigila la retaguardia del convoy.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Grisel",
        alias: "Tiza",
        color: "#84A98C",
        status: CharacterStatus.ALIVE,
        description: "Cronista del viaje y guardiana de los mapas de semillas.",
      },
    }),
  ]);

  const [mica, riel, clado, pua, vanta, grisel] = characters;
  const caravan = [mica.id, riel.id, clado.id, pua.id, vanta.id, grisel.id];

  await createEvent({
    projectId: project.id,
    title: "Despertar en el muelle",
    type: EventType.SCENE,
    start: "2438-08-02 06:00",
    end: "2438-08-02 06:30",
    startLoc: muelle.id,
    endLoc: muelle.id,
    narrativeOrder: 1,
    chapter: "Trayecto 1",
    characters: caravan,
    desc: "La caravana despierta entre grúas bajas y motores de algas negras.",
  });

  await createEvent({
    projectId: project.id,
    title: "Ruta al ascensor solar",
    type: EventType.TRAVEL,
    start: "2438-08-02 06:45",
    end: "2438-08-02 08:00",
    startLoc: muelle.id,
    endLoc: ascensor.id,
    narrativeOrder: 2,
    chapter: "Trayecto 1",
    characters: caravan,
    desc: "La columna sube por la rampa térmica hasta el elevador orbital.",
  });

  await createEvent({
    projectId: project.id,
    title: "Trueque de agua negra",
    type: EventType.SCENE,
    start: "2438-08-02 08:10",
    end: "2438-08-02 09:00",
    startLoc: mercado.id,
    endLoc: mercado.id,
    narrativeOrder: 3,
    chapter: "Trayecto 1",
    characters: [mica.id, pua.id, vanta.id, grisel.id],
    desc: "Púa negocia agua negra mientras Grisel registra los términos del acuerdo.",
  });

  await createEvent({
    projectId: project.id,
    title: "Tránsito al mercado de Titan Lejano",
    type: EventType.TRAVEL,
    start: "2438-08-02 08:00",
    end: "2438-08-02 08:10",
    startLoc: ascensor.id,
    endLoc: mercado.id,
    narrativeOrder: 4,
    chapter: "Trayecto 1",
    characters: [mica.id, pua.id, vanta.id, grisel.id],
    desc: "La avanzada cruza cápsulas de carga hacia el mercado.",
  });

  await createEvent({
    projectId: project.id,
    title: "Salto al archivo fractal",
    type: EventType.TRAVEL,
    start: "2438-08-02 09:10",
    end: "2438-08-02 10:20",
    startLoc: mercado.id,
    endLoc: archivo.id,
    narrativeOrder: 5,
    chapter: "Trayecto 2",
    characters: [mica.id, clado.id, grisel.id],
    desc: "Mica, Clado y Grisel parten con el mapa incompleto hacia Tau Ceti.",
  });

  await createEvent({
    projectId: project.id,
    title: "Lectura del mapa de semillas",
    type: EventType.SCENE,
    start: "2438-08-02 10:30",
    end: "2438-08-02 11:20",
    startLoc: archivo.id,
    endLoc: archivo.id,
    narrativeOrder: 6,
    chapter: "Trayecto 2",
    characters: [mica.id, clado.id, grisel.id],
    desc: "Las capas del mapa se abren solo cuando Clado nombra la especie correcta.",
  });

  await createEvent({
    projectId: project.id,
    title: "Deriva hacia Deneb",
    type: EventType.TRAVEL,
    start: "2438-08-02 11:40",
    end: "2438-08-02 13:10",
    startLoc: archivo.id,
    endLoc: astillero.id,
    narrativeOrder: 7,
    chapter: "Trayecto 3",
    characters: [riel.id, mica.id, vanta.id],
    desc: "Riel conduce un remolque ligero hasta el astillero para reforzar el casco.",
  });

  await createEvent({
    projectId: project.id,
    title: "Reparación del casco",
    type: EventType.SCENE,
    start: "2438-08-02 13:20",
    end: "2438-08-02 14:10",
    startLoc: astillero.id,
    endLoc: astillero.id,
    narrativeOrder: 8,
    chapter: "Trayecto 3",
    characters: [riel.id, mica.id, vanta.id],
    desc: "Riel sella una fisura con vidrio salino antes del siguiente cruce.",
  });

  await createEvent({
    projectId: project.id,
    title: "Cruce del faro gravitacional",
    type: EventType.TRAVEL,
    start: "2438-08-02 14:30",
    end: "2438-08-02 16:00",
    startLoc: astillero.id,
    endLoc: faro.id,
    narrativeOrder: 9,
    chapter: "Trayecto 4",
    characters: caravan,
    desc: "La caravana vuelve a reunirse para curvar su ruta en torno al faro.",
  });

  await createEvent({
    projectId: project.id,
    title: "Consejo bajo vidrio rojo",
    type: EventType.SCENE,
    start: "2438-08-02 16:15",
    end: "2438-08-02 17:00",
    startLoc: faro.id,
    endLoc: faro.id,
    narrativeOrder: 10,
    chapter: "Trayecto 4",
    characters: caravan,
    desc: "El convoy decide dejar parte de la carga para entrar más liviano al umbral.",
  });

  await createEvent({
    projectId: project.id,
    title: "Tránsito a los jardines",
    type: EventType.TRAVEL,
    start: "2438-08-02 17:10",
    end: "2438-08-02 18:00",
    startLoc: faro.id,
    endLoc: jardines.id,
    narrativeOrder: 11,
    chapter: "Trayecto 5",
    characters: caravan,
    desc: "El faro los suelta en una órbita suave que cae hacia Proxima Umbral.",
  });

  await createEvent({
    projectId: project.id,
    title: "Entrada a los jardines",
    type: EventType.SCENE,
    start: "2438-08-02 18:10",
    end: "2438-08-02 19:00",
    startLoc: jardines.id,
    endLoc: jardines.id,
    narrativeOrder: 12,
    chapter: "Trayecto 5",
    characters: caravan,
    desc: "Las ratas atraviesan el arco de bioluz y siembran la primera caja de raíces.",
  });

  return project;
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

  const weekendProject = await seedWeekendGuard(adminUser.id);
  const ratProject = await seedRatCaravan(adminUser.id);

  const adminProjects = await prisma.project.findMany({
    where: { ownerId: adminUser.id },
    orderBy: { title: "asc" },
    select: {
      title: true,
      type: true,
      _count: {
        select: {
          characters: true,
          locations: true,
          events: true,
        },
      },
    },
  });

  console.log("Carga demo del admin completada.\n");
  console.log(`Usuario: ${adminUser.email} / admin`);
  console.log(`Proyecto realista: ${weekendProject.title}`);
  console.log(`Proyecto futurista: ${ratProject.title}`);
  console.log("\nProyectos actuales del admin:\n");

  for (const project of adminProjects) {
    console.log(
      `- ${project.title} [${project.type}] — ${project._count.characters} personajes, ${project._count.locations} locaciones, ${project._count.events} eventos`,
    );
  }

  console.log("\nTodo listo — inicia sesión como admin / admin");
  console.log("Si prefieres usar correo, también funciona admin@continuity.local / admin");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
