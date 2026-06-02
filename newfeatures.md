# Nuevos Features: Props y MVP (Maquillaje, Vestuario, Peinado)

## Contexto

Continuum es un MVP en Next.js (App Router) con Prisma + SQLite para tracking de continuidad narrativa. Actualmente soporta proyectos, personajes, locaciones, eventos (escenas), timeline con asignación de personajes, motor de análisis de continuidad y relación evento↔personaje.

**Restricción crítica:** No se modifica la lógica existente de `lib/continuity`, el comportamiento del timeline, la asignación actual de personajes a eventos, ni se rompen tests existentes.

---

## Objetivo

Diseñar e implementar dos features opcionales e independientes del flujo actual:

1. **Props** — objetos que pueden estar asociados a una escena completa o a un personaje dentro de una escena, con soporte para reutilización entre eventos y tracking por instancia.
2. **MVP (Maquillaje, Vestuario, Peinado)** — estado visual de un personaje en un momento dado, siempre asignado a un personaje dentro de un evento.

Ambos features se integran como extensión modular, con catálogos reutilizables por proyecto y preparados para crecimiento futuro.

---

## 1. Prisma Schema

### Modelos nuevos

```prisma
// ── PROPS ──────────────────────────────────────────

model Prop {
  id          String          @id @default(cuid())
  projectId   String
  name        String
  description String?
  category    String?                              // opcional: weapon, tool, document, etc.
  imageUrl    String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  project     Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  events      EventProp[]
  characters  EventCharacterProp[]

  @@unique([projectId, name])                      // evita duplicados por proyecto
  @@index([projectId])
}

// Prop asignado a un evento completo (escena)
model EventProp {
  eventId     String
  propId      String
  notes       String?                              // estado del prop en esta escena: "roto", "perdido", etc.

  event       Event   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  prop        Prop    @relation(fields: [propId], references: [id], onDelete: Cascade)

  @@id([eventId, propId])
  @@index([propId])
}

// Prop asignado a un personaje dentro de un evento
model EventCharacterProp {
  eventId     String
  characterId String
  propId      String
  notes       String?                              // estado específico del prop para ese personaje

  event     Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  character Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  prop      Prop      @relation(fields: [propId], references: [id], onDelete: Cascade)

  @@id([eventId, characterId, propId])
  @@index([propId])
  @@index([characterId])
}

// ── MVP (Maquillaje, Vestuario, Peinado) ──────────

model Makeup {
  id          String    @id @default(cuid())
  projectId   String
  name        String
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignments EventCharacterMakeup[]

  @@unique([projectId, name])
  @@index([projectId])
}

model EventCharacterMakeup {
  eventId     String
  characterId String
  makeupId    String
  notes       String?

  event     Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  character Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  makeup    Makeup    @relation(fields: [makeupId], references: [id], onDelete: Cascade)

  @@id([eventId, characterId, makeupId])
  @@index([makeupId])
}

model Wardrobe {
  id          String    @id @default(cuid())
  projectId   String
  name        String
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignments EventCharacterWardrobe[]

  @@unique([projectId, name])
  @@index([projectId])
}

model EventCharacterWardrobe {
  eventId     String
  characterId String
  wardrobeId  String
  notes       String?

  event     Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  character Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  wardrobe  Wardrobe  @relation(fields: [wardrobeId], references: [id], onDelete: Cascade)

  @@id([eventId, characterId, wardrobeId])
  @@index([wardrobeId])
}

model Hairstyle {
  id          String    @id @default(cuid())
  projectId   String
  name        String
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignments EventCharacterHairstyle[]

  @@unique([projectId, name])
  @@index([projectId])
}

model EventCharacterHairstyle {
  eventId     String
  characterId String
  hairstyleId String
  notes       String?

  event     Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  character Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  hairstyle Hairstyle @relation(fields: [hairstyleId], references: [id], onDelete: Cascade)

  @@id([eventId, characterId, hairstyleId])
  @@index([hairstyleId])
}
```

### Diagrama lógico de relaciones

```
Project
  ├── Prop ───────────── EventProp ───────────── Event
  │         └──── EventCharacterProp ──┐
  │                                    ├── Character
  │    Makeup ───── EventCharacter_Makeup ─────┘
  │    Wardrobe ─── EventCharacter_Wardrobe ────┘
  │    Hairstyle ── EventCharacter_Hairstyle ───┘
  │
  └── Character ──── EventCharacter ──── Event
                     (existente, @@id[eventId, characterId])
```

### Estrategia para evitar duplicados

- `@@unique([projectId, name])` en todos los catálogos: Prop, Makeup, Wardrobe, Hairstyle.
- Las tablas de asignación usan `@@id` compuestos que impiden duplicar la misma combinación.
- El upsert en server actions hace que re-asignar sea idempotente.

---

## 2. Data Access Layer

Ubicación: `lib/production/` (nueva carpeta, separada de `lib/continuity`)

### `lib/production/types.ts`

```typescript
export type ProductionCatalogItem = {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
};

export type PropWithAssignments = ProductionCatalogItem & {
  category: string | null;
  imageUrl: string | null;
  eventCount: number;
  characterCount: number;
};

export type CharacterVisualState = {
  makeup: Array<{ id: string; name: string; notes: string | null }>;
  wardrobe: Array<{ id: string; name: string; notes: string | null }>;
  hairstyle: Array<{ id: string; name: string; notes: string | null }>;
};

export type EventProductionState = {
  eventId: string;
  sceneProps: Array<{ propId: string; propName: string; notes: string | null }>;
  characterStates: Map<string, CharacterVisualState & {
    props: Array<{ propId: string; propName: string; notes: string | null }>;
  }>;
};
```

### `lib/production/catalogs.ts`

Helpers CRUD para Prop, Makeup, Wardrobe, Hairstyle.

```typescript
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/continuity/data";

// ── Props ──

export async function getProjectProps(projectId: string) {
  await requireCurrentUser();
  return prisma.prop.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { events: true, characters: true } },
    },
  });
}

export async function getPropById(propId: string, projectId: string) {
  return prisma.prop.findFirst({
    where: { id: propId, projectId },
  });
}

export async function createProp(data: {
  projectId: string;
  name: string;
  description?: string | null;
  category?: string | null;
}) {
  return prisma.prop.create({ data });
}

export async function updateProp(propId: string, data: {
  name?: string;
  description?: string | null;
  category?: string | null;
}) {
  return prisma.prop.update({ where: { id: propId }, data });
}

export async function deleteProp(propId: string) {
  return prisma.prop.delete({ where: { id: propId } });
}

// ── Makeup ── (mismo patrón)

export async function getProjectMakeup(projectId: string) { ... }
export async function createMakeup(data: { projectId: string; name: string; description?: string | null }) { ... }
export async function updateMakeup(id: string, data: { name?: string; description?: string | null }) { ... }
export async function deleteMakeup(id: string) { ... }

// ── Wardrobe ── (mismo patrón)

export async function getProjectWardrobe(projectId: string) { ... }
export async function createWardrobe(data: { projectId: string; name: string; description?: string | null }) { ... }
export async function updateWardrobe(id: string, data: { name?: string; description?: string | null }) { ... }
export async function deleteWardrobe(id: string) { ... }

// ── Hairstyle ── (mismo patrón)

export async function getProjectHairstyle(projectId: string) { ... }
export async function createHairstyle(data: { projectId: string; name: string; description?: string | null }) { ... }
export async function updateHairstyle(id: string, data: { name?: string; description?: string | null }) { ... }
export async function deleteHairstyle(id: string) { ... }
```

### `lib/production/assignments.ts`

Helpers para asignar/remover props y MVP a eventos y personajes.

```typescript
import { prisma } from "@/lib/prisma";

// ── Event Props (escena global) ──

export async function assignPropToEvent(
  eventId: string, propId: string, notes?: string | null
) {
  return prisma.eventProp.upsert({
    where: { eventId_propId: { eventId, propId } },
    update: { notes },
    create: { eventId, propId, notes },
  });
}

export async function removePropFromEvent(eventId: string, propId: string) {
  return prisma.eventProp.delete({
    where: { eventId_propId: { eventId, propId } },
  });
}

// ── Character Props (personaje en escena) ──

export async function assignPropToCharacter(
  eventId: string, characterId: string, propId: string, notes?: string | null
) {
  return prisma.eventCharacterProp.upsert({
    where: { eventId_characterId_propId: { eventId, characterId, propId } },
    update: { notes },
    create: { eventId, characterId, propId, notes },
  });
}

export async function removePropFromCharacter(
  eventId: string, characterId: string, propId: string
) {
  return prisma.eventCharacterProp.delete({
    where: { eventId_characterId_propId: { eventId, characterId, propId } },
  });
}

// ── MVP (Makeup / Wardrobe / Hairstyle) ──

type MvpType = "makeup" | "wardrobe" | "hairstyle";

// Helper unificado: cada tipo usa su propia tabla
const MVP_DELEGATE: Record<MvpType, {
  upsert: typeof prisma.eventCharacterMakeup.upsert;
  delete: typeof prisma.eventCharacterMakeup.delete;
}> = {
  makeup: prisma.eventCharacterMakeup,
  wardrobe: prisma.eventCharacterWardrobe,
  hairstyle: prisma.eventCharacterHairstyle,
} as any;

function getWhere(type: MvpType, eventId: string, characterId: string, itemId: string) {
  return { eventId_characterId_makeupId: { eventId, characterId, makeupId: itemId } };
}

export async function assignMvpToCharacter(
  type: MvpType,
  eventId: string,
  characterId: string,
  itemId: string,
  notes?: string | null,
) {
  // cada tabla tiene upsert con su propia forma.
  // Se implementa con switch o mapping explícito.
}

export async function removeMvpFromCharacter(
  type: MvpType,
  eventId: string,
  characterId: string,
  itemId: string,
) {
  // análogo
}
```

### `lib/production/queries.ts`

Queries optimizadas que cargan producción junto con eventos.

```typescript
import { prisma } from "@/lib/prisma";

// Carga todos los datos de producción de un proyecto para un evento específico
export async function getEventProductionState(eventId: string, projectId: string) {
  const [sceneProps, characterProps, makeup, wardrobe, hairstyle] = await Promise.all([
    prisma.eventProp.findMany({
      where: { eventId },
      include: { prop: true },
    }),
    prisma.eventCharacterProp.findMany({
      where: { eventId },
      include: { prop: true, character: true },
    }),
    prisma.eventCharacterMakeup.findMany({
      where: { eventId },
      include: { makeup: true, character: true },
    }),
    prisma.eventCharacterWardrobe.findMany({
      where: { eventId },
      include: { wardrobe: true, character: true },
    }),
    prisma.eventCharacterHairstyle.findMany({
      where: { eventId },
      include: { hairstyle: true, character: true },
    }),
  ]);

  return { sceneProps, characterProps, makeup, wardrobe, hairstyle };
}

// Carga datos de producción para timeline de personaje
export async function getCharacterProductionTimeline(
  projectId: string, characterId: string
) {
  // join events + eventCharacter + mvp/props donde characterId aparece
  return prisma.eventCharacter.findMany({
    where: {
      characterId,
      event: { projectId },
    },
    include: {
      event: true,
    },
  });
}
```

---

## 3. Server Actions

Archivo: `app/(app)/projects/production-actions.ts`

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser, getOwnedProjectOrThrow } from "@/lib/continuity/data";

export type CrudActionState = { error?: string; success?: string };

// ── Schemas ──

const propCatalogSchema = z.object({
  projectId: z.string().min(1),
  propId: z.string().optional(),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z.string().optional(),
  category: z.string().optional(),
});

const mvpCatalogSchema = z.object({
  projectId: z.string().min(1),
  itemId: z.string().optional(),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z.string().optional(),
});

// ── Validación helpers ──

async function assertEventCharacter(
  projectId: string,
  ownerId: string,
  eventId: string,
  characterId: string,
) {
  await getOwnedProjectOrThrow(projectId, ownerId);
  const link = await prisma.eventCharacter.findUnique({
    where: { eventId_characterId: { eventId, characterId } },
    select: { eventId: true },
  });
  if (!link) {
    throw new Error("Ese personaje no está asignado a este evento.");
  }
}

// ── Prop Catalog Actions ──

export async function createPropAction(
  _prev: CrudActionState,
  formData: FormData,
): Promise<CrudActionState> {
  const parsed = propCatalogSchema.safeParse({
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pudimos crear el prop." };
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
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Ya existe un prop con ese nombre en este proyecto." };
    }
    return { error: error instanceof Error ? error.message : "No pudimos crear el prop." };
  }

  revalidatePath(`/projects/${parsed.data.projectId}/production`);
  return { success: "Prop creado." };
}

export async function updatePropAction(...) { /* análogo */ }
export async function deletePropAction(...) { /* previene si tiene asignaciones */ }

// ── MVP Catalog Actions ──

export async function createMakeupAction(...) { ... }
export async function createWardrobeAction(...) { ... }
export async function createHairstyleAction(...) { ... }

// ── Assignment Actions ──

export async function assignPropToEventAction(input: {
  projectId: string;
  eventId: string;
  propId: string;
  notes?: string | null;
}) {
  const user = await requireCurrentUser();
  await getOwnedProjectOrThrow(input.projectId, user.id);
  await prisma.eventProp.upsert({
    where: { eventId_propId: { eventId: input.eventId, propId: input.propId } },
    update: { notes: input.notes ?? null },
    create: { eventId: input.eventId, propId: input.propId, notes: input.notes ?? null },
  });
  revalidatePath(`/projects/${input.projectId}/events/${input.eventId}`);
}

export async function removePropFromEventAction(input: {
  projectId: string;
  eventId: string;
  propId: string;
}) { ... }

export async function assignPropToCharacterAction(input: {
  projectId: string;
  eventId: string;
  characterId: string;
  propId: string;
  notes?: string | null;
}) {
  const user = await requireCurrentUser();
  await assertEventCharacter(input.projectId, user.id, input.eventId, input.characterId);
  await prisma.eventCharacterProp.upsert({
    where: {
      eventId_characterId_propId: {
        eventId: input.eventId,
        characterId: input.characterId,
        propId: input.propId,
      },
    },
    update: { notes: input.notes ?? null },
    create: {
      eventId: input.eventId,
      characterId: input.characterId,
      propId: input.propId,
      notes: input.notes ?? null,
    },
  });
  revalidatePath(`/projects/${input.projectId}/events/${input.eventId}`);
}

export async function removePropFromCharacterAction(...) { ... }

export async function assignMvpToCharacterAction(input: {
  projectId: string;
  eventId: string;
  characterId: string;
  type: "makeup" | "wardrobe" | "hairstyle";
  itemId: string;
  notes?: string | null;
}) {
  const user = await requireCurrentUser();
  await assertEventCharacter(input.projectId, user.id, input.eventId, input.characterId);

  const delegate = {
    makeup: prisma.eventCharacterMakeup,
    wardrobe: prisma.eventCharacterWardrobe,
    hairstyle: prisma.eventCharacterHairstyle,
  }[input.type];

  await (delegate as any).upsert({
    where: {
      eventId_characterId_makeupId: {
        eventId: input.eventId,
        characterId: input.characterId,
        makeupId: input.itemId,
      },
    },
    update: { notes: input.notes ?? null },
    create: {
      eventId: input.eventId,
      characterId: input.characterId,
      [`${input.type}Id`]: input.itemId,
      notes: input.notes ?? null,
    },
  });

  revalidatePath(`/projects/${input.projectId}/events/${input.eventId}`);
}

export async function removeMvpFromCharacterAction(...) { ... }
```

---

## 4. Reglas de Negocio

### Props

1. Un `Prop` existe primero en el catálogo del proyecto (`@@unique([projectId, name])`).
2. Se asigna a un `Event` (`EventProp`) para props de escena (sin personaje).
3. Se asigna a un `EventCharacter` (`EventCharacterProp`) para props de personaje.
4. Un mismo `Prop` puede estar activo en ambas mesas simultáneamente.
5. `notes` en las tablas de asignación captura estado *por instancia* (roto, perdido, modificado).
6. No se permite asignar un `Prop` a un `EventCharacter` si el Character no está en ese Event.
7. Eliminar un `Prop` del catálogo se bloquea si tiene asignaciones activas (se muestra advertencia con conteo).

### MVP

1. `Makeup`, `Wardrobe`, `Hairstyle` existen primero en el catálogo del proyecto.
2. Solo se asignan a un `EventCharacter`, nunca a un `Event` suelto.
3. Un personaje puede tener 0..N de cada tipo en un mismo evento.
4. `notes` captura detalles adicionales (color específico, variante).
5. Si un personaje no está en un evento, no puede tener MVP asignado.

### Generales

- Todas las mutaciones verifican ownership del proyecto (`requireCurrentUser` + validación).
- La migración no toca tablas existentes.
- Tests existentes deben seguir pasando sin cambios.

---

## 5. Edge Cases

### Props

| # | Caso | Comportamiento |
|---|---|---|
| 1 | Prop aparece en E1, desaparece en E2 | No hay asignación en E2. Consultando "eventos donde aparece este Prop" se detecta la ausencia. |
| 2 | Prop de escena vs prop de personaje | `EventProp` para escena; `EventCharacterProp` para personaje. Pueden coexistir. |
| 3 | Personaje con prop en E1 sin prop en E2 | Simplemente no hay registro en E2. El analysis futuro puede alertar. |
| 4 | Prop cambia de estado (entero→roto) | Se refleja en `notes` de la asignación. El catálogo mantiene el nombre canónico. |
| 5 | Eliminar catálogo con asignaciones | Se previene: se cuenta `_count` de asignaciones y se muestra error si > 0. |
| 6 | Prop duplicado en mismo evento | `@@id` lo impide. Upsert lo hace idempotente. |
| 7 | Re-asignar mismo prop con distintas notes | Upsert actualiza `notes`. |
| 8 | Importar proyecto con props | El export/import debe incluir los nuevos modelos. |

### MVP

| # | Caso | Comportamiento |
|---|---|---|
| 1 | Personaje sin configuración MVP | Sin filas en tablas de asignación. Estado no definido, no es error. |
| 2 | Cambio de vestuario entre eventos consecutivos | Se detecta comparando `wardrobeId` entre eventos vecinos del mismo personaje. |
| 3 | Múltiples items del mismo tipo | Permitido: la PK es compuesta. Ej: dos prendas de vestir. |
| 4 | Eliminar personaje de evento | `onDelete: Cascade` en Event y Character propaga a tablas MVP/props. |
| 5 | Asignar MVP a personaje no en evento | Server action valida existencia de `EventCharacter` y rechaza. |
| 6 | Catálogo MVP sin uso | Se puede eliminar libremente (validar en server action con `_count`). |

---

## 6. Estrategia de Evolución (integración futura con continuidad)

### Puntos de conexión preparados (sin implementar hoy)

| Feature | Futuro check en análisis | Código sugerido |
|---|---|---|
| Props que desaparecen | Comparar `EventProp` entre eventos consecutivos → alertar si un prop familiar falta sin explicación | `analyze.ts` → nuevo código `PROP_DISAPPEARS` |
| Props que cambian estado | Detectar cambios en `notes` entre eventos vecinos del mismo prop | `analyze.ts` → `PROP_STATE_CHANGE` |
| MVP inconsistente | Vestuario/maquillaje que cambia drásticamente sin evento intermedio | `analyze.ts` → `VISUAL_INCONSISTENCY` |
| Tipos Analyzable extendidos | `AnalyzableEvent` ganaría `props: string[]` y `characterVisual: Map<characterId, VisualState>` | `types.ts` + `data.ts::getOwnedAnalyzableProject` |
| Algoritmo de diff visual | `distance.ts` compararía estados MVP de un personaje entre eventos | `distance.ts` → `visualDistance(a, b)` |

### Lo que NO se toca hoy

- `lib/continuity/analyze.ts`
- `lib/continuity/types.ts` (Analyzable*)
- `lib/continuity/timeline.ts`
- `lib/continuity/distance.ts`
- Tests existentes

### Preparación para el futuro

- `lib/production/` exporta tipos puros que el engine de análisis puede importar.
- Los nuevos modelos tienen `@@index` estratégicos para queries de timeline.
- `notes` en asignaciones es campo libre para un futuro parser semántico.
- La estructura por proyecto permite que cada proyecto evolucione independientemente.

---

## 7. UI (nivel alto)

### Ubicación de componentes

| Componente | Ruta | Propósito |
|---|---|---|
| `PropForm.tsx` | `components/forms/PropForm.tsx` | CRUD catálogo de props |
| `MvpCatalogForm.tsx` | `components/forms/MvpCatalogForm.tsx` | CRUD unificado makeup/wardrobe/hairstyle |
| `EventPropsPanel.tsx` | `components/production/EventPropsPanel.tsx` | Panel para asignar props a escena/personajes |
| `CharacterMvpPanel.tsx` | `components/production/CharacterMvpPanel.tsx` | Panel MVP por personaje en evento |
| `ProductionNav.tsx` | `components/production/ProductionNav.tsx` | Navegación a sección "Producción" |

### Flujo UX

1. **Catálogos**: Nueva pestaña "Producción" en `ProjectWorkspaceNav`. Allí se listan y gestionan Props, Makeup, Wardrobe, Hairstyle.
2. **Asignación en escena**: En la vista de Evento, al lado de la lista de personajes, aparece "Props y MVP". Click abre panel con:
   - Sección "Props de escena" (sin personaje)
   - Por cada personaje: sección "Props" + "Maquillaje" + "Vestuario" + "Peinado"
3. **Timeline**: Cada event card puede mostrar badges "🎭 Tiene props/MVP" si tiene asignaciones.
4. **Character tracking**: La página de timeline de personaje extiende su respuesta para mostrar MVP state por evento.

### UX simplificado

- Selectores `<select>` buscables para asignar desde el catálogo.
- `notes` como textarea inline en cada asignación.
- Botón "x" para remover asignación.
- Si el catálogo está vacío, link "Crear prop" / "Crear maquillaje" que navega al catálogo.

---

## 8. Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `prisma/schema.prisma` | +8 modelos nuevos |
| `lib/production/types.ts` | Crear |
| `lib/production/catalogs.ts` | Crear |
| `lib/production/assignments.ts` | Crear |
| `lib/production/queries.ts` | Crear |
| `app/(app)/projects/production-actions.ts` | Crear |
| `components/forms/PropForm.tsx` | Crear |
| `components/forms/MvpCatalogForm.tsx` | Crear |
| `components/production/EventPropsPanel.tsx` | Crear |
| `components/production/CharacterMvpPanel.tsx` | Crear |
| `components/projects/ProjectWorkspaceNav.tsx` | Modificar (agregar ruta Producción) |
| `app/(app)/projects/[projectId]/production/` | Nuevas rutas de producción |
| `app/(app)/projects/[projectId]/events/[eventId]/production/` | Nuevas rutas de asignación |
