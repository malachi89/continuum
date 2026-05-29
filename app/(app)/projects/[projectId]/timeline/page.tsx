import { TimelineBoard } from "@/components/projects/TimelineBoard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOwnedProjectTimeline } from "@/lib/continuity/data";
import { buildTimelineEventCards } from "@/lib/continuity/timeline";

export default async function ProjectTimelinePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { project, characters, locations, events } = await getOwnedProjectTimeline(projectId);

  if (events.length === 0) {
    return (
      <EmptyState
        eyebrow="TL"
        title="Todavia no hay eventos para esta timeline"
        body={`Crea eventos dentro de ${project.title} y luego usa esta vista para filtrar, ordenar y asignar personajes.`}
        actionLabel="Ir a eventos"
        actionHref={`/projects/${projectId}/events`}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-line bg-surface p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          Timeline
        </p>
        <h3 className="mt-3 text-2xl font-semibold">Seguimiento temporal de {project.title}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Arrastra personajes desde la paleta hacia eventos existentes. La vista puede
          alternar entre orden cronologico y orden narrativo, sin cambiar fechas del canon.
        </p>
      </div>

      <TimelineBoard
        projectId={projectId}
        characters={characters}
        availableLocations={locations.map((location) => ({
          id: location.id,
          name: location.name,
        }))}
        events={buildTimelineEventCards(events)}
      />
    </section>
  );
}
