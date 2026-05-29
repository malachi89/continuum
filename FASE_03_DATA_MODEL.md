# Fase 03: Modelo narrativo, Prisma y seed

## Objetivo
Crear el modelo de datos central para proyectos, personajes, locaciones, eventos y relaciones de personajes por evento.

## Decisiones
- Cada proyecto pertenece a un `User`.
- Los proyectos son privados por usuario.
- Fechas internas se guardan como `DateTime`.
- El orden cronologico se calcula por `internalStart`.
- El orden narrativo se guarda como numero opcional.

## Modelos principales
Agregar a Prisma:

```prisma
model Project {
  id          String   @id @default(cuid())
  ownerId     String
  title       String
  type        ProjectType
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  characters  Character[]
  locations   Location[]
  events      Event[]
}

model Character {
  id                 String          @id @default(cuid())
  projectId          String
  name               String
  alias              String?
  description        String?
  notes              String?
  color              String
  maxTravelMode      TravelMode?
  maxSpeedKmh        Float?
  status             CharacterStatus @default(UNKNOWN)
  statusDateInternal DateTime?
  project            Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  eventLinks         EventCharacter[]
}

model Location {
  id          String       @id @default(cuid())
  projectId   String
  name        String
  description String?
  latitude    Float?
  longitude   Float?
  type        LocationType
  notes       String?
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  startEvents Event[]      @relation("EventStartLocation")
  endEvents   Event[]      @relation("EventEndLocation")
}

model Event {
  id               String           @id @default(cuid())
  projectId        String
  title            String
  description      String?
  internalStart    DateTime
  internalEnd      DateTime
  startLocationId  String?
  endLocationId    String?
  eventType        EventType
  chapterOrEpisode String?
  narrativeOrder   Int?
  notes            String?
  project          Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  startLocation    Location?        @relation("EventStartLocation", fields: [startLocationId], references: [id], onDelete: SetNull)
  endLocation      Location?        @relation("EventEndLocation", fields: [endLocationId], references: [id], onDelete: SetNull)
  characters       EventCharacter[]
}

model EventCharacter {
  eventId     String
  characterId String
  event       Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  character   Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  @@id([eventId, characterId])
}
```

## Enums
Incluir:
- `ProjectType`: `NOVEL`, `FILM`, `SERIES`, `COMIC`, `OTHER`
- `TravelMode`: `WALKING`, `CAR`, `PLANE`, `MAGIC_PORTAL`, `OTHER`
- `CharacterStatus`: `ALIVE`, `DEAD`, `MISSING`, `UNKNOWN`
- `LocationType`: `CITY`, `BUILDING`, `ROOM`, `PLANET`, `DIMENSION`, `OTHER`
- `EventType`: `SCENE`, `TRAVEL`, `FLASHBACK`, `DREAM`, `VISION`, `ELLIPSIS`, `BATTLE`, `CONVERSATION`, `OTHER`

## Seed
Crear `prisma/seed.ts` con:
- Usuario demo:
  - email: `demo@continuity.local`
  - password: `continuity123`
- Proyecto: `Demo: Viaje Imposible`
- Personaje: Bruno
  - color visible
  - `maxTravelMode`: `CAR`
  - `maxSpeedKmh`: `80`
- Locaciones:
  - Ciudad de Mexico: `19.4326`, `-99.1332`
  - Tokio: `35.6762`, `139.6503`
- Evento 1:
  - Bruno en Ciudad de Mexico a las `14:03`
- Evento 2:
  - Bruno en Tokio a las `14:04`

## Criterios de aceptacion
- `npx prisma migrate dev` crea la base local.
- `npx prisma db seed` crea usuario y demo.
- Prisma Client puede consultar el proyecto demo con personajes, locaciones y eventos.
- Borrar un usuario borra sus proyectos y datos asociados.

## Notas para futuras sesiones
- Usar siempre queries filtradas por usuario autenticado.
- No exponer proyectos de otros usuarios en import/export, timeline o analisis.
