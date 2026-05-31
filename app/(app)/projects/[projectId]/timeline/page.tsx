import { TimelineBoard } from "@/components/projects/TimelineBoard";
import { analyzeProjectContinuity } from "@/lib/continuity/analyze";
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
  const continuityResults = analyzeProjectContinuity({
    id: project.id,
    title: project.title,
    type: project.type,
    characters: characters.map((character) => ({
      id: character.id,
      name: character.name,
      alias: character.alias,
      color: character.color,
      status: character.status,
      statusDateInternal: character.statusDateInternal?.toISOString() ?? null,
    })),
    locations: locations.map((location) => ({
      id: location.id,
      name: location.name,
      type: location.type,
      latitude: location.latitude,
      longitude: location.longitude,
    })),
    events: events.map((event) => ({
      id: event.id,
      title: event.title,
      eventType: event.eventType,
      description: event.description,
      chapterOrEpisode: event.chapterOrEpisode,
      narrativeOrder: event.narrativeOrder,
      internalStart: event.internalStart.toISOString(),
      internalEnd: event.internalEnd.toISOString(),
      startLocationId: event.startLocationId,
      endLocationId: event.endLocationId,
      characterIds: event.characters.map((link) => link.characterId),
    })),
  });
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
      <TimelineBoard
        key={timelineStateKey}
        projectId={projectId}
        characters={characters}
        events={timelineEvents}
        continuityResults={continuityResults}
      />
    </section>
  );
}
