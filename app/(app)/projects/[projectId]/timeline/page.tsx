import { TimelineBoard } from "@/components/projects/TimelineBoard";
import { getOwnedProjectTimeline } from "@/lib/continuity/data";
import { buildTimelineEventCards } from "@/lib/continuity/timeline";

export default async function ProjectTimelinePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { project, characters, locations, events } = await getOwnedProjectTimeline(projectId);
  const timelineEvents = buildTimelineEventCards(events);
  const timelineStateKey = timelineEvents
    .map((event) =>
      [
        event.id,
        event.title,
        event.internalStartIso,
        event.internalEndIso,
        event.narrativeOrder ?? "",
        event.characterIds.join(","),
      ].join(":"),
    )
    .join("|");

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-line bg-surface p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          Línea de tiempo
        </p>
        <h3 className="mt-3 text-2xl font-semibold">Seguimiento temporal de {project.title}</h3>
      </div>

      <TimelineBoard
        key={timelineStateKey}
        projectId={projectId}
        characters={characters}
        availableLocations={locations.map((location) => ({
          id: location.id,
          name: location.name,
        }))}
        events={timelineEvents}
      />
    </section>
  );
}
