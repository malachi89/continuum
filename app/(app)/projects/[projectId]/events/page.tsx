import { createEventAction, deleteEventAction, updateEventAction } from "@/app/(app)/projects/actions";
import { DeleteResourceForm } from "@/components/forms/DeleteResourceForm";
import { EventForm } from "@/components/forms/EventForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getOwnedProject,
  getOwnedProjectCharacters,
  getOwnedProjectEvents,
  getOwnedProjectLocations,
} from "@/lib/continuity/data";

export default async function ProjectEventsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [project, events, locations, characters] = await Promise.all([
    getOwnedProject(projectId),
    getOwnedProjectEvents(projectId),
    getOwnedProjectLocations(projectId),
    getOwnedProjectCharacters(projectId),
  ]);
  const redirectTo = `/projects/${projectId}/events`;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          Nuevo evento
        </p>
        <h3 className="mt-3 text-2xl font-semibold">
          Editor rapido de eventos de {project.title}
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Puedes guardar eventos aunque el fin sea anterior al inicio. Ese caso se
          detectara despues en el analizador de continuidad.
        </p>
        <div className="mt-5">
          <EventForm
            action={createEventAction}
            submitLabel="Crear evento"
            projectId={projectId}
            redirectTo={redirectTo}
            locations={locations}
            characters={characters}
          />
        </div>
      </section>

      {events.length === 0 ? (
        <EmptyState
          eyebrow="EV"
          title="No hay eventos todavia"
          body="Aqui puedes registrar escenas, viajes, batallas, sueños o cualquier hito narrativo con varios personajes."
        />
      ) : (
        <section className="grid gap-4">
          {events.map((event) => (
            <article key={event.id} className="rounded-[28px] border border-line bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <Badge tone="accent">{event.eventType}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {event.internalStart.toISOString()} {"->"} {event.internalEnd.toISOString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.startLocation ? <Badge>{event.startLocation.name}</Badge> : null}
                  {event.endLocation ? <Badge>{event.endLocation.name}</Badge> : null}
                  {event.narrativeOrder !== null ? (
                    <Badge tone="success">Orden {event.narrativeOrder}</Badge>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {event.characters.length === 0 ? (
                  <Badge>Sin personajes vinculados</Badge>
                ) : (
                  event.characters.map((link) => (
                    <Badge key={link.characterId}>{link.character.name}</Badge>
                  ))
                )}
              </div>

              <div className="mt-5">
                <EventForm
                  action={updateEventAction}
                  submitLabel="Guardar evento"
                  projectId={projectId}
                  redirectTo={redirectTo}
                  locations={locations}
                  characters={characters}
                  initialValues={{
                    ...event,
                    selectedCharacterIds: event.characters.map((link) => link.characterId),
                  }}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <DeleteResourceForm
                  action={deleteEventAction}
                  resourceIdName="eventId"
                  resourceId={event.id}
                  projectId={projectId}
                  redirectTo={redirectTo}
                  label="Borrar evento"
                />
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
