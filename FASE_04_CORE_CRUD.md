# Fase 04: CRUD principal

## Objetivo
Implementar pantallas reales para crear, editar, listar y borrar proyectos, personajes, locaciones y eventos.

## Decisiones
- Usar Server Actions para mutaciones cuando sea practico.
- Usar componentes reutilizables de formulario y tabla.
- Validar entradas con `zod`.
- Mostrar errores de forma visible en la UI.

## Pantallas
- `/projects`: dashboard de proyectos.
- `/projects/[projectId]`: resumen del proyecto.
- `/projects/[projectId]/characters`: personajes.
- `/projects/[projectId]/locations`: locaciones.
- `/projects/[projectId]/events`: eventos y editor rapido.

## Tareas por modulo
1. Proyectos:
   - listar proyectos del usuario actual
   - crear proyecto
   - editar titulo, tipo y descripcion
   - borrar proyecto con confirmacion
2. Personajes:
   - crear, editar, borrar
   - color visual
   - alias, descripcion, notas
   - velocidad maxima y modo de traslado
   - estado y fecha interna de estado
3. Locaciones:
   - crear, editar, borrar
   - coordenadas opcionales
   - tipo y notas
4. Eventos:
   - crear, editar, borrar
   - titulo, descripcion, inicio, fin
   - locacion inicial/final
   - tipo de evento
   - capitulo/episodio
   - orden narrativo
   - selector multiple de personajes
   - notas

## Componentes esperados
- `components/forms/ProjectForm.tsx`
- `components/forms/CharacterForm.tsx`
- `components/forms/LocationForm.tsx`
- `components/forms/EventForm.tsx`
- `components/ui/*` para botones, inputs, selectores, badges y estados vacios.

## Reglas de seguridad
- Cada accion debe verificar usuario actual.
- Cada accion debe verificar que el recurso pertenece a un proyecto del usuario.
- Importante: nunca confiar solo en IDs recibidos desde formularios.

## Criterios de aceptacion
- Usuario autenticado puede crear un proyecto nuevo.
- Usuario autenticado solo ve sus proyectos.
- CRUD completo funciona para personajes, locaciones y eventos.
- Un evento puede tener varios personajes.
- Los formularios mantienen una experiencia compacta y usable.

## Notas para futuras sesiones
- No bloquear eventos con hora final anterior a inicial en el formulario; el analizador debe detectarlo como error. Se puede mostrar advertencia visual.
- Permitir locaciones vacias para que el analizador pueda reportar escenas sin locacion.
