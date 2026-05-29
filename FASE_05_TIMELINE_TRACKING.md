# Fase 05: Timeline, drag and drop y tracking por personaje

## Objetivo
Crear la vista visual de timeline y la vista individual de personaje, incluyendo asignacion de personajes a eventos mediante drag and drop.

## Decisiones
- Usar `@dnd-kit/core`.
- Arrastrar personajes a la timeline significa asignarlos a eventos existentes.
- La timeline no crea eventos nuevos ni cambia fechas en el MVP.
- Permitir alternar orden cronologico y orden narrativo.

## Timeline
Ruta:
```text
/projects/[projectId]/timeline
```

Debe incluir:
- filtros por personaje
- filtros por locacion
- filtros por capitulo/episodio
- toggle `orden cronologico` / `orden narrativo`
- paleta lateral o superior de personajes arrastrables
- eventos como zonas droppable
- chips de personajes presentes en cada evento
- boton para quitar personaje de un evento

## Drag and drop
Comportamiento:
1. Usuario arrastra un personaje desde la paleta.
2. Usuario lo suelta sobre un evento.
3. La app crea `EventCharacter`.
4. Si ya estaba asignado, no duplica.
5. UI actualiza el evento con el chip del personaje.

## Tracking por personaje
Ruta:
```text
/projects/[projectId]/characters/[characterId]
```

Debe mostrar:
- eventos del personaje en orden cronologico
- locacion inicial y final por evento
- tiempo transcurrido entre eventos
- huecos temporales visibles
- conflictos relevantes del analizador filtrados para ese personaje

## Criterios de aceptacion
- La timeline puede verse en orden cronologico.
- La timeline puede verse en orden narrativo usando `narrativeOrder` cuando exista.
- Los filtros reducen la lista correctamente.
- Arrastrar Bruno a un evento lo asigna y persiste en SQLite.
- Quitar un personaje de un evento persiste el cambio.
- La vista de personaje muestra secuencia y tiempos entre apariciones.

## Notas para futuras sesiones
- Mantener controles densos y claros, estilo herramienta de produccion.
- No convertir la primera pantalla en landing page.
- Evitar que el drag and drop sea la unica forma de asignar personajes; el formulario de evento tambien debe mantener selector multiple.
