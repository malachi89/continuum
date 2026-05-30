import { createEventAction } from "@/app/(app)/projects/actions";
import Link from "next/link";
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

  const formatDate = (value: Date) =>
    new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(value);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          Nuevo evento
        </p>
        <h3 className="mt-3 text-2xl font-semibold">
          Eventos de {project.title}
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
        <section className="rounded-[28px] border border-line bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                Registro
              </p>
              <h3 className="mt-2 text-xl font-semibold">Eventos registrados</h3>
            </div>
            <Badge tone="success">{events.length} eventos</Badge>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-[0.18em] text-muted">
                  <th className="py-3 pr-4 font-medium">Evento</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Rango interno</th>
                  <th className="px-4 py-3 font-medium">Locaciones</th>
                  <th className="px-4 py-3 font-medium">Personajes</th>
                  <th className="py-3 pl-4 text-right font-medium">Accion</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-line/70 last:border-0">
                    <td className="py-4 pr-4">
                      <div>
                        <span className="font-semibold text-ink">{event.title}</span>
                        <p className="mt-1 text-muted">
                          {event.chapterOrEpisode ?? "Sin capitulo"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone="accent">{event.eventType}</Badge>
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {formatDate(event.internalStart)} {"->"} {formatDate(event.internalEnd)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {event.startLocation ? <Badge>{event.startLocation.name}</Badge> : null}
                        {event.endLocation && event.endLocation.id !== event.startLocation?.id ? (
                          <Badge>{event.endLocation.name}</Badge>
                        ) : null}
                        {!event.startLocation && !event.endLocation ? (
                          <span className="text-muted">Sin definir</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {event.characters.length > 0
                        ? `${event.characters.length} vinculados`
                        : "Sin personajes"}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <Link
                        href={`/projects/${projectId}/events/${event.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-line bg-canvas/70 px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:bg-surface"
                      >
                        Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
