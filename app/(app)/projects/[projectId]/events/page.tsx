import Link from "next/link";
import { createEventAction } from "@/app/(app)/projects/actions";
import { EventForm } from "@/components/forms/EventForm";
import { CharacterPopover } from "@/components/projects/CharacterPopover";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getOwnedProject,
  getOwnedProjectCharacters,
  getOwnedProjectEvents,
  getOwnedProjectLocations,
} from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    newEvent: "Nuevo evento",
    eventsOf: "Eventos de",
    note:
      "Puedes guardar eventos aunque el fin sea anterior al inicio. Ese caso se detectara despues en el analizador de continuidad.",
    createEvent: "Crear evento",
    noEventsTitle: "No hay eventos todavia",
    noEventsBody:
      "Aqui puedes registrar escenas, viajes, batallas, sueños o cualquier hito narrativo con varios personajes.",
    register: "Registro",
    registeredEvents: "Eventos registrados",
    event: "Evento",
    type: "Tipo",
    internalRange: "Rango interno",
    locations: "Locaciones",
    characters: "Personajes",
    action: "Accion",
    noChapter: "Sin capitulo",
    noDefined: "Sin definir",
    linked: "vinculados",
    noCharacters: "Sin personajes",
    detail: "Detalle",
  },
  en: {
    newEvent: "New event",
    eventsOf: "Events for",
    note:
      "You can save events even if the end is earlier than the start. That case will be detected later by the continuity analyzer.",
    createEvent: "Create event",
    noEventsTitle: "There are no events yet",
    noEventsBody:
      "Here you can record scenes, trips, battles, dreams, or any narrative milestone with multiple characters.",
    register: "Registry",
    registeredEvents: "Registered events",
    event: "Event",
    type: "Type",
    internalRange: "Internal range",
    locations: "Locations",
    characters: "Characters",
    action: "Action",
    noChapter: "No chapter",
    noDefined: "Unset",
    linked: "linked",
    noCharacters: "No characters",
    detail: "Detail",
  },
} as const;

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
  const language = await getServerLanguage();
  const text = copy[language];
  const redirectTo = `/projects/${projectId}/events`;

  const formatDate = (value: Date) =>
    new Intl.DateTimeFormat(language === "es" ? "es-MX" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(value);

  return (
    <div className="space-y-6">
      <details className="rounded-[28px] border border-line bg-surface p-6">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {text.newEvent}
            </p>
            <h3 className="mt-3 text-2xl font-semibold">
              {text.eventsOf} {project.title}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{text.note}</p>
          </div>
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-canvas/70 text-2xl leading-none text-ink transition">
            +
          </span>
        </summary>
        <div className="mt-5">
          <EventForm
            action={createEventAction}
            submitLabel={text.createEvent}
            projectId={projectId}
            redirectTo={redirectTo}
            locations={locations}
            characters={characters}
          />
        </div>
      </details>

      {events.length === 0 ? (
        <EmptyState
          eyebrow="EV"
          title={text.noEventsTitle}
          body={text.noEventsBody}
        />
      ) : (
        <section className="rounded-[28px] border border-line bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                {text.register}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{text.registeredEvents}</h3>
            </div>
            <Badge tone="success">{events.length} {text.event.toLowerCase()}</Badge>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-[0.18em] text-muted">
                  <th className="py-3 pr-4 font-medium">{text.event}</th>
                  <th className="px-4 py-3 font-medium">{text.type}</th>
                  <th className="px-4 py-3 font-medium">{text.internalRange}</th>
                  <th className="px-4 py-3 font-medium">{text.locations}</th>
                  <th className="px-4 py-3 font-medium">{text.characters}</th>
                  <th className="py-3 pl-4 text-right font-medium">{text.action}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-line/70 last:border-0">
                    <td className="py-4 pr-4">
                      <div>
                        <span className="font-semibold text-ink">{event.title}</span>
                        <p className="mt-1 text-muted">{event.chapterOrEpisode ?? text.noChapter}</p>
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
                          <span className="text-muted">{text.noDefined}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {event.characters.length > 0 ? (
                        <CharacterPopover
                          label={`${event.characters.length} ${text.linked}`}
                          characters={event.characters}
                          projectId={projectId}
                        />
                      ) : (
                        text.noCharacters
                      )}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <Link
                        href={`/projects/${projectId}/events/${event.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-line bg-canvas/70 px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:bg-surface"
                      >
                        {text.detail}
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
