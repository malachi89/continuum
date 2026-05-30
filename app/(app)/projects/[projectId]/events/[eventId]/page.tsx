import {
  deleteEventAction,
  updateEventAction,
} from "@/app/(app)/projects/actions";
import Link from "next/link";
import { DeleteResourceForm } from "@/components/forms/DeleteResourceForm";
import { EventForm } from "@/components/forms/EventForm";
import { Badge } from "@/components/ui/Badge";
import {
  getOwnedProjectCharacters,
  getOwnedProjectEvent,
  getOwnedProjectLocations,
} from "@/lib/continuity/data";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function ProjectEventDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; eventId: string }>;
}) {
  const { projectId, eventId } = await params;
  const [event, locations, characters] = await Promise.all([
    getOwnedProjectEvent(projectId, eventId),
    getOwnedProjectLocations(projectId),
    getOwnedProjectCharacters(projectId),
  ]);
  const eventsPath = `/projects/${projectId}/events`;
  const detailPath = `${eventsPath}/${eventId}`;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              Evento
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{event.title}</h3>
            <p className="mt-2 text-sm text-muted">
              {event.project.title} · {formatDate(event.internalStart)} {"->"}{" "}
              {formatDate(event.internalEnd)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{event.eventType}</Badge>
            {event.narrativeOrder !== null ? (
              <Badge tone="success">Orden {event.narrativeOrder}</Badge>
            ) : null}
            {event.chapterOrEpisode ? <Badge>{event.chapterOrEpisode}</Badge> : null}
          </div>
        </div>

        <div className="mt-5">
          <Link
            href={eventsPath}
            className="inline-flex items-center justify-center rounded-full border border-line bg-canvas/70 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:bg-surface"
          >
            Volver a eventos
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            Detalle
          </p>
          <h3 className="mt-3 text-xl font-semibold">Ficha del evento</h3>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-ink">Descripcion</dt>
              <dd className="mt-1 leading-6 text-muted">
                {event.description ?? "Sin descripcion registrada."}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Notas</dt>
              <dd className="mt-1 leading-6 text-muted">
                {event.notes ?? "Sin notas registradas."}
              </dd>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-ink">Locacion inicial</dt>
                <dd className="mt-1 text-muted">
                  {event.startLocation?.name ?? "Sin definir"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Locacion final</dt>
                <dd className="mt-1 text-muted">
                  {event.endLocation?.name ?? "Sin definir"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Inicio interno</dt>
                <dd className="mt-1 text-muted">{formatDate(event.internalStart)}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Fin interno</dt>
                <dd className="mt-1 text-muted">{formatDate(event.internalEnd)}</dd>
              </div>
            </div>
          </dl>

          <div className="mt-6">
            <p className="font-medium text-ink">Personajes vinculados</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {event.characters.length === 0 ? (
                <Badge>Sin personajes vinculados</Badge>
              ) : (
                event.characters.map((link) => (
                  <Link
                    key={link.characterId}
                    href={`/projects/${projectId}/characters/${link.characterId}`}
                  >
                    <Badge>{link.character.name}</Badge>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            Edicion
          </p>
          <h3 className="mt-3 text-xl font-semibold">Actualizar evento</h3>
          <div className="mt-5">
            <EventForm
              action={updateEventAction}
              submitLabel="Guardar evento"
              projectId={projectId}
              redirectTo={detailPath}
              locations={locations}
              characters={characters}
              initialValues={{
                ...event,
                selectedCharacterIds: event.characters.map((link) => link.characterId),
              }}
            />
          </div>

          <div className="mt-5 flex justify-end">
            <DeleteResourceForm
              action={deleteEventAction}
              resourceIdName="eventId"
              resourceId={event.id}
              projectId={projectId}
              redirectTo={eventsPath}
              label="Borrar evento"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
