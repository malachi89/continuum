import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { getOwnedCharacterTimeline } from "@/lib/continuity/data";
import { buildCharacterTracking } from "@/lib/continuity/timeline";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function CharacterTrackingPage({
  params,
}: {
  params: Promise<{ projectId: string; characterId: string }>;
}) {
  const { projectId, characterId } = await params;
  const { character, events } = await getOwnedCharacterTimeline(projectId, characterId);
  const { timeline, conflicts } = buildCharacterTracking(events);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 rounded-full border border-black/10"
              style={{ backgroundColor: character.color }}
            />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                Tracking
              </p>
              <h3 className="mt-2 text-2xl font-semibold">{character.name}</h3>
              <p className="mt-2 text-sm text-muted">
                {character.project.title} · {character.alias ?? "Sin alias"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{character.status}</Badge>
            {character.maxTravelMode ? <Badge tone="accent">{character.maxTravelMode}</Badge> : null}
            {character.maxSpeedKmh ? <Badge tone="success">{character.maxSpeedKmh} km/h</Badge> : null}
          </div>
        </div>

        <div className="mt-5">
          <Link href={`/projects/${projectId}/characters`}>
            <Button variant="secondary">Volver a personajes</Button>
          </Link>
        </div>
      </section>

      {timeline.length === 0 ? (
        <EmptyState
          eyebrow="CH"
          title="Este personaje todavia no aparece en eventos"
          body="Puedes asignarlo desde el formulario de eventos o arrastrarlo dentro de la timeline del proyecto."
          actionLabel="Abrir timeline"
          actionHref={`/projects/${projectId}/timeline`}
        />
      ) : (
        <>
          <section className="rounded-[28px] border border-line bg-surface p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                  Secuencia
                </p>
                <h3 className="mt-2 text-xl font-semibold">Apariciones cronologicas</h3>
              </div>
              <Badge tone="success">{timeline.length} apariciones</Badge>
            </div>

            <div className="mt-6 space-y-4">
              {timeline.map((item, index) => (
                <article key={item.eventId} className="rounded-[24px] border border-line bg-canvas/55 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-semibold">{item.eventTitle}</h4>
                        <Badge tone="accent">{item.eventType}</Badge>
                        {item.chapterOrEpisode ? <Badge>{item.chapterOrEpisode}</Badge> : null}
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        {formatDate(item.internalStartIso)} {"->"} {formatDate(item.internalEndIso)}
                      </p>
                    </div>

                    {index > 0 && item.gapLabel ? (
                      <div className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
                        Gap desde evento anterior: {item.gapLabel}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.startLocationName ? <Badge>{item.startLocationName}</Badge> : <Badge>Sin locacion inicial</Badge>}
                    {item.endLocationName && item.endLocationName !== item.startLocationName ? (
                      <Badge>{item.endLocationName}</Badge>
                    ) : null}
                    {item.flags.map((flag) => (
                      <Badge key={flag} tone={flag === "Superposicion" ? "accent" : "default"}>
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-surface p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                  Conflictos
                </p>
                <h3 className="mt-2 text-xl font-semibold">Senales relevantes para este personaje</h3>
              </div>
              <Badge>{conflicts.length}</Badge>
            </div>

            {conflicts.length === 0 ? (
              <p className="mt-5 text-sm text-muted">
                No detectamos conflictos visibles en la secuencia actual de este personaje.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {conflicts.map((conflict) => (
                  <article
                    key={conflict.id}
                    className="rounded-[22px] border border-line bg-canvas/55 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Badge tone={conflict.severity === "warning" ? "accent" : "default"}>
                        {conflict.severity === "warning" ? "Warning" : "Info"}
                      </Badge>
                      <h4 className="font-semibold">{conflict.title}</h4>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{conflict.body}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
