import Link from "next/link";
import {
  deleteEventAction,
  updateEventAction,
} from "@/app/(app)/projects/actions";
import { DeleteResourceForm } from "@/components/forms/DeleteResourceForm";
import { EventForm } from "@/components/forms/EventForm";
import { Badge } from "@/components/ui/Badge";
import {
  getOwnedProjectCharacters,
  getOwnedProjectEvent,
  getOwnedProjectLocations,
} from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    event: "Evento",
    back: "Volver a eventos",
    production: "Produccion",
    detail: "Detalle",
    sheet: "Ficha del evento",
    description: "Descripcion",
    noDescription: "Sin descripcion registrada.",
    notes: "Notas",
    noNotes: "Sin notas registradas.",
    startLocation: "Locacion inicial",
    endLocation: "Locacion final",
    internalStart: "Inicio interno",
    internalEnd: "Fin interno",
    linkedCharacters: "Personajes vinculados",
    noLinkedCharacters: "Sin personajes vinculados",
    edition: "Edicion",
    updateEvent: "Actualizar evento",
    saveEvent: "Guardar evento",
    deleteEvent: "Borrar evento",
    order: "Orden",
    noDefined: "Sin definir",
    chapter: "Sin capitulo",
  },
  en: {
    event: "Event",
    back: "Back to events",
    production: "Production",
    detail: "Detail",
    sheet: "Event sheet",
    description: "Description",
    noDescription: "No description recorded.",
    notes: "Notes",
    noNotes: "No notes recorded.",
    startLocation: "Start location",
    endLocation: "End location",
    internalStart: "Internal start",
    internalEnd: "Internal end",
    linkedCharacters: "Linked characters",
    noLinkedCharacters: "No linked characters",
    edition: "Edition",
    updateEvent: "Update event",
    saveEvent: "Save event",
    deleteEvent: "Delete event",
    order: "Order",
    noDefined: "Unset",
    chapter: "No chapter",
  },
} as const;

function formatDate(value: Date, language: string) {
  return new Intl.DateTimeFormat(language === "es" ? "es-MX" : "en-US", {
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
  const language = await getServerLanguage();
  const text = copy[language];
  const eventsPath = `/projects/${projectId}/events`;
  const detailPath = `${eventsPath}/${eventId}`;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {text.event}
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{event.title}</h3>
            <p className="mt-2 text-sm text-muted">
              {event.project.title} · {formatDate(event.internalStart, language)} {"->"}{" "}
              {formatDate(event.internalEnd, language)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{event.eventType}</Badge>
            {event.narrativeOrder !== null ? (
              <Badge tone="success">
                {text.order} {event.narrativeOrder}
              </Badge>
            ) : null}
            {event.chapterOrEpisode ? <Badge>{event.chapterOrEpisode}</Badge> : null}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex flex-wrap gap-3">
            <Link
              href={eventsPath}
              className="inline-flex items-center justify-center rounded-full border border-line bg-canvas/70 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:bg-surface"
            >
              {text.back}
            </Link>
            <Link
              href={`/projects/${projectId}/events/${eventId}/production`}
              className="inline-flex items-center justify-center rounded-full border border-line bg-canvas/70 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:bg-surface"
            >
              {text.production}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            {text.detail}
          </p>
          <h3 className="mt-3 text-xl font-semibold">{text.sheet}</h3>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-ink">{text.description}</dt>
              <dd className="mt-1 leading-6 text-muted">
                {event.description ?? text.noDescription}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink">{text.notes}</dt>
              <dd className="mt-1 leading-6 text-muted">
                {event.notes ?? text.noNotes}
              </dd>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-ink">{text.startLocation}</dt>
                <dd className="mt-1 text-muted">
                  {event.startLocation?.name ?? text.noDefined}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">{text.endLocation}</dt>
                <dd className="mt-1 text-muted">
                  {event.endLocation?.name ?? text.noDefined}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">{text.internalStart}</dt>
                <dd className="mt-1 text-muted">{formatDate(event.internalStart, language)}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">{text.internalEnd}</dt>
                <dd className="mt-1 text-muted">{formatDate(event.internalEnd, language)}</dd>
              </div>
            </div>
          </dl>

          <div className="mt-6">
            <p className="font-medium text-ink">{text.linkedCharacters}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {event.characters.length === 0 ? (
                <Badge>{text.noLinkedCharacters}</Badge>
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
            {text.edition}
          </p>
          <h3 className="mt-3 text-xl font-semibold">{text.updateEvent}</h3>
          <div className="mt-5">
            <EventForm
              action={updateEventAction}
              submitLabel={text.saveEvent}
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
              label={text.deleteEvent}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
