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

async function seedEldermoria(adminUserId: string) {
  const project = await createOrResetProject({
    ownerId: adminUserId,
    title: "Crónicas de Eldermoria: La Sombra del Rey Sin Trono",
    type: ProjectType.NOVEL,
    description:
      "Fantasía épica multigeneracional. Veintiséis años de saga con coronaciones, asedios, profecías y un convoy de héroes cruzando un continente entero. Incluye flashbacks legítimos y errores intencionales para estresar el motor de continuidad.",
  });

  const locations = await Promise.all([
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Ciudadela de Velmoria Real",
        type: LocationType.CITY,
        latitude: 35.5,
        longitude: -10.2,
        description: "Capital amurallada de Velmoria, asentada sobre el río Aerion.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Bosque Silverleaf",
        type: LocationType.OTHER,
        latitude: 38.2,
        longitude: -15.7,
        description: "Espesura plateada donde los elfos esconden el último refugio del heredero.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Fortaleza Pico Helado",
        type: LocationType.BUILDING,
        latitude: 42.3,
        longitude: -8.1,
        description: "Bastión norteño tallado en la roca; cuartel de la Orden de la Lanza Blanca.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Torre Negra de Aktherion",
        type: LocationType.BUILDING,
        latitude: 28.4,
        longitude: 5.7,
        description: "Aguja basáltica del Señor Oscuro al otro lado del continente.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Puerto Ámbar",
        type: LocationType.CITY,
        latitude: 32.1,
        longitude: -18.3,
        description: "Ciudad portuaria de mercaderes, contrabandistas y bardos cansados.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Cavernas de Drakhan",
        type: LocationType.OTHER,
        latitude: 30.5,
        longitude: 2.1,
        description: "Red de túneles bajo la cordillera oriental, custodiados por enanos.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Pantano de Brumas",
        type: LocationType.OTHER,
        latitude: 26.8,
        longitude: -1.2,
        description: "Marisma sin estaciones donde los ejércitos se hunden en silencio.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Ruinas de Tar-Khalim",
        type: LocationType.OTHER,
        latitude: 22.4,
        longitude: 12.8,
        description: "Vestigios de una civilización anterior, sepultados por la arena roja.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Monasterio del Faro",
        type: LocationType.BUILDING,
        latitude: 34.2,
        longitude: -22.5,
        description: "Isla rocosa con un faro que aún recibe profecías por correspondencia.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Llanura de Khalimund",
        type: LocationType.OTHER,
        latitude: 31.8,
        longitude: -6.4,
        description: "Vasta planicie donde se libró la batalla que rompió la primera dinastía.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Forja del Dios Hueco",
        type: LocationType.BUILDING,
        latitude: 41.5,
        longitude: -3.2,
        description: "Taller volcánico donde los enanos templan armas con sangre de roca.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Vado de Eldenwyr",
        type: LocationType.OTHER,
        latitude: 36.9,
        longitude: -7.3,
        description: "Cruce estrecho del río que separa el reino libre del territorio en disputa.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Valle Escondido",
        type: LocationType.OTHER,
        latitude: 39.7,
        longitude: -5.6,
        description: "Cuenca rodeada por riscos que solo encuentran quienes ya conocen el camino.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Ciudad Flotante de Aerion",
        type: LocationType.CITY,
        latitude: 40.1,
        longitude: 0.8,
        description: "Metrópolis sostenida por anillos de roca encantada, hogar de un dragón sabio.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Tundra de Ymir",
        type: LocationType.OTHER,
        latitude: 48.6,
        longitude: -2.4,
        description: "Llanura helada donde el sol no termina de salir durante meses.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Cámara del Consejo Élfico",
        type: LocationType.ROOM,
        latitude: 37.8,
        longitude: -14.9,
        description: "Salón circular en el corazón de Silverleaf, oculto entre raíces vivas.",
      },
    }),
    prisma.location.create({
      data: {
        projectId: project.id,
        name: "Taberna del Grifo Dormido",
        type: LocationType.BUILDING,
        latitude: 35.2,
        longitude: -11.4,
        description: "Posada en el cruce de caminos donde se forjan y se rompen alianzas.",
      },
    }),
  ]);

  const [
    velmoriaReal,
    bosqueSilverleaf,
    picoHelado,
    torreNegra,
    puertoAmbar,
    cavernasDrakhan,
    pantanoBrumas,
    ruinasTarKhalim,
    monasterioFaro,
    llanuraKhalimund,
    forjaDios,
    vadoEldenwyr,
    valleEscondido,
    ciudadFlotante,
    tundraYmir,
    camaraElfica,
    tabernaGrifo,
  ] = locations;

  const characters = await Promise.all([
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Príncipe Aldric",
        alias: "El Heredero",
        color: "#C0392B",
        status: CharacterStatus.ALIVE,
        description: "Heredero legítimo de Velmoria, criado en el exilio entre los elfos.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Rey Velmund",
        alias: "El Padre Caído",
        color: "#7D3C98",
        status: CharacterStatus.DEAD,
        statusDateInternal: new Date("1252-08-15T18:00:00.000Z"),
        description: "Monarca de la primera dinastía, caído en la Batalla de Khalimund.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Reina Liorel",
        alias: null,
        color: "#D4AC0D",
        status: CharacterStatus.ALIVE,
        description: "Reina viuda que sostiene la corte en la sombra desde el asedio.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Maeron el Hechicero",
        alias: "El Maestro",
        color: "#3498DB",
        status: CharacterStatus.ALIVE,
        description: "Hechicero del concilio que entrenó al heredero durante los años oscuros.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Princesa Cienna",
        alias: "La Lanza Blanca",
        color: "#E67E22",
        status: CharacterStatus.ALIVE,
        description: "Comandante de la Orden de la Lanza, heredera de Pico Helado.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Capitán Elron",
        alias: null,
        color: "#8E44AD",
        status: CharacterStatus.ALIVE,
        description: "Veterano leal a Cienna, conoce cada paso de la cordillera norte.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Bardo Eligius",
        alias: "Cuerda Rota",
        color: "#16A085",
        status: CharacterStatus.DEAD,
        statusDateInternal: new Date("1272-12-12T22:30:00.000Z"),
        description: "Cronista y arpista de la compañía; cae en la emboscada del vado.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Elara Hojaclara",
        alias: null,
        color: "#27AE60",
        status: CharacterStatus.ALIVE,
        description: "Arquera élfica enviada por el consejo como guía y centinela.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Thorek Yunqueheraldo",
        alias: "Yunque",
        color: "#A04000",
        status: CharacterStatus.ALIVE,
        description: "Maestro herrero enano de la Forja del Dios Hueco, leal a la corona caída.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Linka Pielmenuda",
        alias: "Pies Ligeros",
        color: "#F39C12",
        status: CharacterStatus.ALIVE,
        description: "Mediana ladrona contratada en Puerto Ámbar como exploradora.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Aktherion",
        alias: "El Señor Oscuro",
        color: "#1B2631",
        status: CharacterStatus.DEAD,
        statusDateInternal: new Date("1273-08-20T03:15:00.000Z"),
        description: "Hechicero renegado que conquistó las tierras del este y derrocó la dinastía.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Lord Veyra",
        alias: "Mano Negra",
        color: "#6E2C00",
        status: CharacterStatus.ALIVE,
        description: "General principal de Aktherion, estratega frío con armaduras tributarias.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Oráculo Senestria",
        alias: null,
        color: "#BB8FCE",
        status: CharacterStatus.ALIVE,
        description: "Vidente del Faro, lee el destino sin ojos y cobra con secretos antiguos.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Drakar",
        alias: "El Letrado",
        color: "#B03A2E",
        status: CharacterStatus.ALIVE,
        description: "Dragón anciano que mora en la Ciudad Flotante; recuerda dinastías enteras.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Sigrid La Hilandera",
        alias: null,
        color: "#1ABC9C",
        status: CharacterStatus.ALIVE,
        description: "Líder de la resistencia campesina en el sur del reino ocupado.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Espía Corvo",
        alias: "Cuervo",
        color: "#34495E",
        status: CharacterStatus.MISSING,
        statusDateInternal: new Date("1273-03-01T05:00:00.000Z"),
        description: "Agente doble que desaparece tras enviar el último mapa a la compañía.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Sanador Petren",
        alias: null,
        color: "#58D68D",
        status: CharacterStatus.ALIVE,
        description: "Monje herborista del Faro, único capaz de leer las heridas del Vado.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Doncel Pip",
        alias: null,
        color: "#F8C471",
        status: CharacterStatus.ALIVE,
        description: "Escudero adolescente de Cienna, lleva la bitácora oficial del viaje.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Necromante Vassick",
        alias: null,
        color: "#5D6D7E",
        status: CharacterStatus.ALIVE,
        description: "Antiguo alumno de Maeron; sigue al convoy desde las sombras de Drakhan.",
      },
    }),
    prisma.character.create({
      data: {
        projectId: project.id,
        name: "Eldra del Velo",
        alias: null,
        color: "#EC7063",
        status: CharacterStatus.DEAD,
        statusDateInternal: new Date("1246-12-01T00:00:00.000Z"),
        description: "Primera esposa de Velmund, fallecida antes del prólogo; vive en visiones.",
      },
    }),
  ]);

  const [
    aldric,
    velmund,
    liorel,
    maeron,
    cienna,
    elron,
    eligius,
    elara,
    thorek,
    linka,
    aktherion,
    veyra,
    senestria,
    drakar,
    sigrid,
    corvo,
    petren,
    pip,
    vassick,
    eldra,
  ] = characters;

  const compania = [aldric.id, maeron.id, cienna.id, elron.id, eligius.id, elara.id, pip.id];

  await createEvent({
    projectId: project.id,
    title: "Visión que abre la crónica",
    type: EventType.VISION,
    start: "1272-03-01 04:00",
    end: "1272-03-01 04:30",
    narrativeOrder: 1,
    chapter: "Prólogo",
    characters: [aldric.id, eldra.id],
    desc: "Aldric sueña con una mujer del Velo que recita su nombre verdadero.",
  });

  await createEvent({
    projectId: project.id,
    title: "Coronación del Rey Velmund",
    type: EventType.SCENE,
    start: "1247-01-15 11:00",
    end: "1247-01-15 13:00",
    startLoc: velmoriaReal.id,
    endLoc: velmoriaReal.id,
    narrativeOrder: 2,
    chapter: "Prólogo",
    characters: [velmund.id, liorel.id, maeron.id],
    desc: "Velmund asciende al trono frente a la nobleza unificada de Velmoria.",
  });

  await createEvent({
    projectId: project.id,
    title: "Profecía del Oráculo",
    type: EventType.VISION,
    start: "1247-02-20 22:00",
    end: "1247-02-20 22:45",
    narrativeOrder: 3,
    chapter: "Prólogo",
    characters: [senestria.id, liorel.id],
    desc: "Senestria anuncia que la corona caerá y renacerá en una generación impar.",
  });

  await createEvent({
    projectId: project.id,
    title: "Nacimiento del heredero",
    type: EventType.SCENE,
    start: "1247-09-04 03:15",
    end: "1247-09-04 06:00",
    startLoc: velmoriaReal.id,
    endLoc: velmoriaReal.id,
    narrativeOrder: 4,
    chapter: "Prólogo",
    characters: [liorel.id, velmund.id, maeron.id],
    desc: "Liorel da a luz a Aldric mientras una estrella nueva cuelga del cielo.",
  });

  await createEvent({
    projectId: project.id,
    title: "Asedio a Velmoria",
    type: EventType.BATTLE,
    start: "1252-07-30 05:00",
    end: "1252-08-02 19:00",
    startLoc: velmoriaReal.id,
    endLoc: velmoriaReal.id,
    narrativeOrder: 5,
    chapter: "La Caída",
    characters: [velmund.id, liorel.id, maeron.id, veyra.id],
    desc: "Las legiones de Aktherion rompen las murallas tras tres días de bombardeo.",
  });

  await createEvent({
    projectId: project.id,
    title: "Batalla de Khalimund",
    type: EventType.BATTLE,
    start: "1252-08-15 06:00",
    end: "1252-08-15 18:00",
    startLoc: llanuraKhalimund.id,
    endLoc: llanuraKhalimund.id,
    narrativeOrder: 6,
    chapter: "La Caída",
    characters: [velmund.id, veyra.id, aktherion.id],
    desc: "El rey cae al atardecer mientras la línea velmoriana se quiebra.",
  });

  await createEvent({
    projectId: project.id,
    title: "Huida del príncipe",
    type: EventType.TRAVEL,
    start: "1252-08-16 02:00",
    end: "1252-08-22 18:00",
    startLoc: velmoriaReal.id,
    endLoc: bosqueSilverleaf.id,
    narrativeOrder: 7,
    chapter: "La Caída",
    characters: [aldric.id, liorel.id, maeron.id],
    desc: "Maeron escolta al niño hasta Silverleaf por caminos olvidados.",
  });

  await createEvent({
    projectId: project.id,
    title: "Quema de los establos reales",
    type: EventType.SCENE,
    start: "1252-08-18 22:00",
    end: "1252-08-19 02:00",
    startLoc: velmoriaReal.id,
    endLoc: velmoriaReal.id,
    narrativeOrder: 8,
    chapter: "La Caída",
    characters: [],
    desc: "El fuego arrasa las cuadras sin que nadie pueda señalar a los responsables.",
  });

  await createEvent({
    projectId: project.id,
    title: "Vida oculta en Silverleaf",
    type: EventType.SCENE,
    start: "1262-06-10 09:00",
    end: "1262-06-10 12:00",
    startLoc: bosqueSilverleaf.id,
    endLoc: bosqueSilverleaf.id,
    narrativeOrder: 9,
    chapter: "Años Oscuros",
    characters: [aldric.id, elara.id],
    desc: "Aldric, ya adolescente, aprende a moverse en silencio entre los abedules plateados.",
  });

  await createEvent({
    projectId: project.id,
    title: "Maeron regresa al bosque",
    type: EventType.SCENE,
    start: "1262-06-20 17:30",
    end: "1262-06-20 20:00",
    startLoc: bosqueSilverleaf.id,
    endLoc: bosqueSilverleaf.id,
    narrativeOrder: 10,
    chapter: "Años Oscuros",
    characters: [aldric.id, maeron.id, elara.id],
    desc: "El hechicero anuncia que la guerra antigua está a punto de despertar otra vez.",
  });

  await createEvent({
    projectId: project.id,
    title: "Entrenamiento del Claro",
    type: EventType.SCENE,
    start: "1262-08-05 10:00",
    end: "1262-08-05 15:00",
    startLoc: bosqueSilverleaf.id,
    endLoc: bosqueSilverleaf.id,
    narrativeOrder: 11,
    chapter: "Años Oscuros",
    characters: [aldric.id, maeron.id],
    desc: "Aldric domina su primer círculo de runas frente al maestro.",
  });

  await createEvent({
    projectId: project.id,
    title: "La Marca del Destino",
    type: EventType.VISION,
    start: "1272-03-10 03:00",
    end: "1272-03-10 03:40",
    narrativeOrder: 12,
    chapter: "El Llamado",
    characters: [aldric.id, eldra.id],
    desc: "Una marca antigua brilla en el brazo del príncipe sin que la habitación tenga forma.",
  });

  await createEvent({
    projectId: project.id,
    title: "Recuerdo del padre",
    type: EventType.FLASHBACK,
    start: "1247-09-04 06:30",
    end: "1247-09-04 07:00",
    startLoc: velmoriaReal.id,
    endLoc: velmoriaReal.id,
    narrativeOrder: 13,
    chapter: "El Llamado",
    characters: [velmund.id, aldric.id, liorel.id],
    desc: "Aldric recuerda a su padre sosteniéndolo recién nacido frente al sol del invierno.",
  });

  await createEvent({
    projectId: project.id,
    title: "Despedida del bosque",
    type: EventType.SCENE,
    start: "1272-03-20 06:00",
    end: "1272-03-20 09:00",
    startLoc: bosqueSilverleaf.id,
    endLoc: bosqueSilverleaf.id,
    narrativeOrder: 14,
    chapter: "El Llamado",
    characters: [aldric.id, maeron.id, elara.id],
    desc: "El príncipe deja Silverleaf con la espada de su padre envuelta en cuero negro.",
  });

  await createEvent({
    projectId: project.id,
    title: "Travesía hacia Pico Helado",
    type: EventType.TRAVEL,
    start: "1272-03-21 05:00",
    end: "1272-04-10 18:00",
    startLoc: bosqueSilverleaf.id,
    endLoc: picoHelado.id,
    narrativeOrder: 15,
    chapter: "El Llamado",
    characters: [aldric.id, maeron.id, elara.id],
    desc: "Tres semanas de marcha por valles nevados con escaramuzas menores.",
  });

  await createEvent({
    projectId: project.id,
    title: "Encuentro con la princesa Cienna",
    type: EventType.SCENE,
    start: "1272-04-15 11:00",
    end: "1272-04-15 13:30",
    startLoc: picoHelado.id,
    endLoc: picoHelado.id,
    narrativeOrder: 16,
    chapter: "El Llamado",
    characters: [aldric.id, maeron.id, cienna.id, elron.id, pip.id],
    desc: "Cienna acepta acompañar al heredero después de comprobar la marca real.",
  });

  await createEvent({
    projectId: project.id,
    title: "Mensajero llega del sur",
    type: EventType.SCENE,
    start: "1272-04-22 19:00",
    end: "1272-04-22 19:45",
    startLoc: picoHelado.id,
    endLoc: picoHelado.id,
    narrativeOrder: 17,
    chapter: "El Llamado",
    characters: [cienna.id, elron.id, sigrid.id],
    desc: "Sigrid envía aviso: el pantano arde y las aldeas piden refuerzos.",
  });

  await createEvent({
    projectId: project.id,
    title: "Viaje a la Cámara Élfica",
    type: EventType.TRAVEL,
    start: "1272-05-01 05:00",
    end: "1272-06-12 18:00",
    startLoc: picoHelado.id,
    endLoc: camaraElfica.id,
    narrativeOrder: 18,
    chapter: "El Llamado",
    characters: [aldric.id, maeron.id, cienna.id, elara.id, pip.id],
    desc: "El grupo desciende del norte para asistir al consejo convocado en Silverleaf.",
  });

  await createEvent({
    projectId: project.id,
    title: "Reunión del Consejo Élfico",
    type: EventType.CONVERSATION,
    start: "1272-06-15 10:00",
    end: "1272-06-15 17:00",
    startLoc: camaraElfica.id,
    endLoc: camaraElfica.id,
    narrativeOrder: 19,
    chapter: "El Llamado",
    characters: [aldric.id, maeron.id, cienna.id, elara.id, liorel.id, sigrid.id, pip.id],
    desc: "Los consejeros sellan la alianza y trazan la ruta hacia la Torre Negra.",
  });

  await createEvent({
    projectId: project.id,
    title: "Travesía de la cordillera",
    type: EventType.TRAVEL,
    start: "1272-07-02 05:00",
    end: "1272-08-04 18:00",
    startLoc: camaraElfica.id,
    endLoc: forjaDios.id,
    narrativeOrder: 20,
    chapter: "El Viaje",
    characters: compania,
    desc: "Cinco semanas cruzando pasos altos hasta llegar al humo de la forja enana.",
  });

  await createEvent({
    projectId: project.id,
    title: "Pacto con Thorek",
    type: EventType.SCENE,
    start: "1272-08-05 09:00",
    end: "1272-08-05 12:30",
    startLoc: forjaDios.id,
    endLoc: forjaDios.id,
    narrativeOrder: 21,
    chapter: "El Viaje",
    characters: [aldric.id, thorek.id, maeron.id, cienna.id, pip.id],
    desc: "Thorek jura su martillo al heredero y forja la cabeza de la lanza de Cienna.",
  });

  await createEvent({
    projectId: project.id,
    title: "Travesía marítima a la isla del Faro",
    type: EventType.TRAVEL,
    start: "1272-09-01 04:00",
    end: "1272-09-10 17:00",
    startLoc: puertoAmbar.id,
    endLoc: monasterioFaro.id,
    narrativeOrder: 22,
    chapter: "El Viaje",
    characters: [aldric.id, maeron.id, cienna.id, elara.id, linka.id, pip.id],
    desc: "Linka se une en Puerto Ámbar y guía al grupo entre tormentas heladas.",
  });

  await createEvent({
    projectId: project.id,
    title: "Profecía del Faro",
    type: EventType.VISION,
    start: "1272-09-12 23:30",
    end: "1272-09-13 00:30",
    startLoc: monasterioFaro.id,
    endLoc: monasterioFaro.id,
    narrativeOrder: 23,
    chapter: "El Viaje",
    characters: [aldric.id, senestria.id, petren.id],
    desc: "Senestria entrega tres nombres que Aldric debe pronunciar antes del solsticio.",
  });

  await createEvent({
    projectId: project.id,
    title: "La Taberna del Grifo Dormido",
    type: EventType.SCENE,
    start: "1272-11-04 20:00",
    end: "1272-11-05 02:00",
    startLoc: tabernaGrifo.id,
    endLoc: tabernaGrifo.id,
    narrativeOrder: 24,
    chapter: "El Viaje",
    characters: [aldric.id, cienna.id, eligius.id, linka.id, pip.id],
    desc: "Eligius canta una balada que rompe la calma diplomática del posadero.",
  });

  await createEvent({
    projectId: project.id,
    title: "Emboscada en el Vado",
    type: EventType.BATTLE,
    start: "1272-12-12 19:00",
    end: "1272-12-12 23:30",
    startLoc: vadoEldenwyr.id,
    endLoc: vadoEldenwyr.id,
    narrativeOrder: 25,
    chapter: "El Viaje",
    characters: [aldric.id, cienna.id, elara.id, eligius.id, veyra.id, pip.id],
    desc: "Las huestes de Veyra atrapan al convoy entre los pilares del vado.",
  });

  await createEvent({
    projectId: project.id,
    title: "Funeral por Eligius",
    type: EventType.SCENE,
    start: "1272-12-13 09:00",
    end: "1272-12-13 11:30",
    startLoc: vadoEldenwyr.id,
    endLoc: vadoEldenwyr.id,
    narrativeOrder: 26,
    chapter: "El Viaje",
    characters: [aldric.id, cienna.id, elara.id, petren.id, pip.id],
    desc: "El convoy entierra al bardo bajo las raíces de un sauce gigante.",
  });

  await createEvent({
    projectId: project.id,
    title: "Refugio en el Valle Escondido",
    type: EventType.SCENE,
    start: "1273-01-08 14:00",
    end: "1273-01-08 17:00",
    startLoc: valleEscondido.id,
    endLoc: valleEscondido.id,
    narrativeOrder: 27,
    chapter: "El Viaje",
    characters: [aldric.id, cienna.id, elara.id, linka.id, petren.id, pip.id],
    desc: "El valle ofrece tres semanas de descanso, agua tibia y mapas frescos.",
  });

  await createEvent({
    projectId: project.id,
    title: "Memoria de Eldra",
    type: EventType.FLASHBACK,
    start: "1246-05-12 18:00",
    end: "1246-05-12 18:45",
    startLoc: velmoriaReal.id,
    endLoc: velmoriaReal.id,
    narrativeOrder: 28,
    chapter: "El Viaje",
    characters: [velmund.id, eldra.id],
    desc: "Velmund y Eldra caminan por el jardín real antes de la peste invernal.",
  });

  await createEvent({
    projectId: project.id,
    title: "Ascenso a la Ciudad Flotante",
    type: EventType.TRAVEL,
    start: "1273-02-02 05:00",
    end: "1273-02-04 19:00",
    startLoc: valleEscondido.id,
    endLoc: ciudadFlotante.id,
    narrativeOrder: 29,
    chapter: "El Viaje",
    characters: [aldric.id, maeron.id, cienna.id, elara.id, linka.id, pip.id],
    desc: "El convoy abandona los caballos y sube en cadenas de roca encantada.",
  });

  await createEvent({
    projectId: project.id,
    title: "Diálogo con Drakar",
    type: EventType.CONVERSATION,
    start: "1273-02-06 10:00",
    end: "1273-02-06 14:00",
    startLoc: ciudadFlotante.id,
    endLoc: ciudadFlotante.id,
    narrativeOrder: 30,
    chapter: "El Viaje",
    characters: [aldric.id, maeron.id, drakar.id],
    desc: "El dragón letrado explica la cuarta cláusula de la profecía olvidada.",
  });

  await createEvent({
    projectId: project.id,
    title: "Travesía de la Tundra de Ymir",
    type: EventType.TRAVEL,
    start: "1273-03-10 04:00",
    end: "1273-03-28 17:00",
    startLoc: ciudadFlotante.id,
    endLoc: tundraYmir.id,
    narrativeOrder: 31,
    chapter: "El Viaje",
    characters: compania,
    desc: "Dieciocho días de hielo continuo; dos centinelas mueren congelados.",
  });

  await createEvent({
    projectId: project.id,
    title: "Ruinas de Tar-Khalim",
    type: EventType.SCENE,
    start: "1273-04-22 11:00",
    end: "1273-04-22 16:00",
    startLoc: ruinasTarKhalim.id,
    endLoc: ruinasTarKhalim.id,
    narrativeOrder: 32,
    chapter: "El Viaje",
    characters: [aldric.id, maeron.id, cienna.id, vassick.id],
    desc: "Vassick aparece entre columnas caídas y ofrece un mapa de las cavernas.",
  });

  await createEvent({
    projectId: project.id,
    title: "Descenso a las Cavernas de Drakhan",
    type: EventType.TRAVEL,
    start: "1273-05-15 08:00",
    end: "1273-05-18 20:00",
    startLoc: ruinasTarKhalim.id,
    endLoc: cavernasDrakhan.id,
    narrativeOrder: 33,
    chapter: "El Viaje",
    characters: [aldric.id, maeron.id, cienna.id, thorek.id, vassick.id, pip.id],
    desc: "El grupo baja por túneles de espejo guiados por antorchas frías.",
  });

  await createEvent({
    projectId: project.id,
    title: "Asamblea previa a la guerra",
    type: EventType.CONVERSATION,
    start: "1273-06-30 09:00",
    end: "1273-06-30 17:00",
    startLoc: picoHelado.id,
    endLoc: picoHelado.id,
    narrativeOrder: 34,
    chapter: "La Guerra",
    characters: [aldric.id, cienna.id, elron.id, sigrid.id, thorek.id, liorel.id, maeron.id],
    desc: "Se reparten estandartes y se promete la coronación al recuperar la capital.",
  });

  await createEvent({
    projectId: project.id,
    title: "Batalla del Pantano de Brumas",
    type: EventType.BATTLE,
    start: "1273-07-21 04:30",
    end: "1273-07-22 02:00",
    startLoc: pantanoBrumas.id,
    endLoc: pantanoBrumas.id,
    narrativeOrder: 35,
    chapter: "La Guerra",
    characters: [aldric.id, cienna.id, elron.id, sigrid.id, thorek.id, veyra.id, vassick.id],
    desc: "El frente sur del enemigo se rompe gracias a la milicia de Sigrid.",
  });

  await createEvent({
    projectId: project.id,
    title: "Asalto a la Torre Negra",
    type: EventType.BATTLE,
    start: "1273-08-19 23:00",
    end: "1273-08-20 04:00",
    startLoc: torreNegra.id,
    endLoc: torreNegra.id,
    narrativeOrder: 36,
    chapter: "La Guerra",
    characters: [aldric.id, cienna.id, maeron.id, thorek.id, elara.id, aktherion.id, veyra.id],
    desc: "El convoy escala los muros mientras Maeron rompe los sellos exteriores.",
  });

  await createEvent({
    projectId: project.id,
    title: "Caída de Aktherion",
    type: EventType.SCENE,
    start: "1273-08-20 03:00",
    end: "1273-08-20 03:15",
    startLoc: torreNegra.id,
    endLoc: torreNegra.id,
    narrativeOrder: 37,
    chapter: "La Guerra",
    characters: [aldric.id, aktherion.id, maeron.id],
    desc: "Aldric pronuncia el último nombre de la profecía y el Señor Oscuro se quiebra.",
  });

  await createEvent({
    projectId: project.id,
    title: "Retorno del Rey",
    type: EventType.SCENE,
    start: "1273-09-12 12:00",
    end: "1273-09-12 14:00",
    startLoc: velmoriaReal.id,
    endLoc: velmoriaReal.id,
    narrativeOrder: 38,
    chapter: "La Guerra",
    characters: [aldric.id, liorel.id, cienna.id, maeron.id, sigrid.id, thorek.id, elara.id, pip.id],
    desc: "Aldric atraviesa las puertas de la ciudadela bajo lluvia de pétalos blancos.",
  });

  await createEvent({
    projectId: project.id,
    title: "Coronación del nuevo rey",
    type: EventType.SCENE,
    start: "1275-03-21 10:00",
    end: "1275-03-21 12:30",
    startLoc: velmoriaReal.id,
    endLoc: velmoriaReal.id,
    narrativeOrder: 39,
    chapter: "Epílogo",
    characters: [aldric.id, liorel.id, cienna.id, maeron.id, thorek.id, elara.id, sigrid.id, pip.id],
    desc: "Aldric jura sobre la espada de su padre con la corte reconstruida alrededor.",
  });

  await createEvent({
    projectId: project.id,
    title: "Brindis por los caídos",
    type: EventType.FLASHBACK,
    start: "1272-11-04 23:00",
    end: "1272-11-04 23:30",
    startLoc: tabernaGrifo.id,
    endLoc: tabernaGrifo.id,
    narrativeOrder: 40,
    chapter: "Epílogo",
    characters: [aldric.id, eligius.id, cienna.id, pip.id],
    desc: "El rey recuerda al bardo y a Eldra mientras alza la copa en el salón.",
  });

  await createEvent({
    projectId: project.id,
    title: "Aldric en la biblioteca del consejo",
    type: EventType.SCENE,
    start: "1272-06-15 12:00",
    end: "1272-06-15 14:00",
    startLoc: bosqueSilverleaf.id,
    endLoc: bosqueSilverleaf.id,
    narrativeOrder: 41,
    chapter: "Edge cases",
    characters: [aldric.id, elara.id],
    desc: "Edge case: Aldric aparece estudiando rollos mientras el consejo aún sesiona.",
  });

  await createEvent({
    projectId: project.id,
    title: "Sueño extraño en la cripta",
    type: EventType.SCENE,
    start: "1273-10-02 02:00",
    end: "1273-10-02 03:00",
    startLoc: velmoriaReal.id,
    endLoc: velmoriaReal.id,
    narrativeOrder: 42,
    chapter: "Edge cases",
    characters: [aldric.id, velmund.id],
    desc: "Edge case: el rey caído aparece en escena ordinaria, no marcada como sueño ni flashback.",
  });

  await createEvent({
    projectId: project.id,
    title: "Cienna patrulla el bosque sola",
    type: EventType.SCENE,
    start: "1272-04-25 14:00",
    end: "1272-04-25 17:00",
    startLoc: bosqueSilverleaf.id,
    endLoc: bosqueSilverleaf.id,
    narrativeOrder: 43,
    chapter: "Edge cases",
    characters: [cienna.id],
    desc: "Edge case: Cienna cambia de Pico Helado a Silverleaf sin evento de viaje.",
  });

  await createEvent({
    projectId: project.id,
    title: "Escaramuza fronteriza",
    type: EventType.BATTLE,
    start: "1273-05-30 11:00",
    end: "1273-05-30 12:30",
    startLoc: pantanoBrumas.id,
    endLoc: pantanoBrumas.id,
    narrativeOrder: 44,
    chapter: "Edge cases",
    characters: [],
    desc: "Edge case: batalla menor sin personajes asignados; nadie recuerda quién luchó.",
  });

  await createEvent({
    projectId: project.id,
    title: "Cronista se equivoca con las horas",
    type: EventType.ELLIPSIS,
    start: "1273-09-15 18:00",
    end: "1273-09-15 09:00",
    startLoc: velmoriaReal.id,
    endLoc: velmoriaReal.id,
    narrativeOrder: 45,
    chapter: "Edge cases",
    characters: [pip.id],
    desc: "Edge case: la bitácora oficial cierra antes de abrir; Pip jura que fue tinta corrida.",
  });

  await createEvent({
    projectId: project.id,
    title: "Eco sin lugar en la tundra",
    type: EventType.CONVERSATION,
    start: "1273-03-22 19:00",
    end: "1273-03-22 19:20",
    narrativeOrder: 46,
    chapter: "Edge cases",
    characters: [aldric.id, corvo.id],
    desc: "Edge case: el último mensaje del espía Corvo llega como voz sin ubicación.",
  });

  await createEvent({
    projectId: project.id,
    title: "Aktherion habla tras su caída",
    type: EventType.SCENE,
    start: "1274-01-10 23:00",
    end: "1274-01-10 23:30",
    startLoc: torreNegra.id,
    endLoc: torreNegra.id,
    narrativeOrder: 47,
    chapter: "Edge cases",
    characters: [aktherion.id, vassick.id],
    desc: "Edge case: el Señor Oscuro aparece en escena meses después de su muerte registrada.",
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
  const eldermoriaProject = await seedEldermoria(adminUser.id);

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
  console.log(`Proyecto épico: ${eldermoriaProject.title}`);
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
