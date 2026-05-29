# Fase 06: Motor de analisis de continuidad

## Objetivo
Implementar la logica independiente que detecta incongruencias narrativas y mostrar los resultados en una pantalla clara.

## Archivos principales
- `lib/continuity/types.ts`
- `lib/continuity/distance.ts`
- `lib/continuity/analyze.ts`
- `app/projects/[projectId]/analysis/page.tsx`

## Tipos esperados
Definir tipos serializables para:
- proyecto analizable
- personaje analizable
- locacion analizable
- evento analizable
- resultado de continuidad

Severidades:
- `ERROR`
- `WARNING`
- `NOTE`

Cada resultado debe incluir:
- severidad
- codigo estable
- personaje involucrado opcional
- eventos involucrados
- explicacion clara
- solucion sugerida

## Reglas
1. Hora final anterior a hora inicial:
   - `ERROR`
   - aplica a cualquier evento.
2. Eventos traslapados:
   - `ERROR`
   - mismo personaje aparece en eventos cuyas ventanas se cruzan.
   - si estan en locaciones diferentes, explicacion debe decir ambas locaciones.
3. Viaje imposible:
   - `ERROR`
   - comparar distancia Haversine entre locaciones y tiempo disponible.
   - si `maxTravelMode` es `MAGIC_PORTAL`, no marcar imposible.
4. Coordenadas faltantes:
   - `WARNING`
   - no bloquear analisis.
5. Muerto/desaparecido aparece despues:
   - `ERROR`
   - comparar `statusDateInternal` con `internalStart`.
   - excepciones: `FLASHBACK`, `DREAM`, `VISION`.
6. Aparece sin viaje previo:
   - `WARNING`
   - si cambia de locacion entre eventos consecutivos y el evento actual no es `TRAVEL`.
7. Escena sin personajes:
   - `WARNING`
8. Escena sin locacion:
   - `WARNING`

## Distancia
`distance.ts` debe exponer:
```ts
export function haversineKm(a: Coordinates, b: Coordinates): number
```

Usar radio terrestre aproximado:
```ts
const EARTH_RADIUS_KM = 6371
```

## Pantalla de analisis
Ruta:
```text
/projects/[projectId]/analysis
```

Debe mostrar:
- conteo por severidad
- filtros por severidad
- lista de resultados
- explicacion y solucion sugerida
- enlaces a eventos/personajes cuando existan

## Criterios de aceptacion
- El proyecto demo marca el viaje imposible de Bruno.
- El mensaje incluye distancia aproximada, tiempo disponible y velocidad requerida.
- Eventos sin coordenadas no fallan, solo advierten.
- El motor puede probarse sin Next ni Prisma.

## Notas para futuras sesiones
- Mantener el motor puro: recibe datos simples y devuelve resultados.
- No meter consultas Prisma dentro de `lib/continuity/analyze.ts`.
