import Link from "next/link";
import {
  deleteCharacterAction,
  updateCharacterAction,
} from "@/app/(app)/projects/actions";
import { CharacterForm } from "@/components/forms/CharacterForm";
import { DeleteResourceForm } from "@/components/forms/DeleteResourceForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOwnedCharacterTimeline } from "@/lib/continuity/data";
import { buildCharacterTracking } from "@/lib/continuity/timeline";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    tracking: "Seguimiento",
    back: "Volver a personajes",
    detail: "Detalle",
    sheet: "Ficha del personaje",
    description: "Descripcion",
    noDescription: "Sin descripcion registrada.",
    notes: "Notas",
    noNotes: "Sin notas registradas.",
    statusDate: "Fecha interna del estado",
    noDate: "Sin fecha",
    project: "Proyecto",
    edition: "Edicion",
    updateCharacter: "Actualizar personaje",
    saveCharacter: "Guardar personaje",
    deleteCharacter: "Borrar personaje",
    noTimelineTitle: "Este personaje todavia no aparece en eventos",
    noTimelineBody:
      "Puedes asignarlo desde el formulario de eventos o arrastrarlo dentro de la línea de tiempo del proyecto.",
    openTimeline: "Abrir línea de tiempo",
    sequence: "Secuencia",
    chronologicalAppearances: "Apariciones cronologicas",
    appearances: "apariciones",
    intervalFromPrevious: "Intervalo desde el evento anterior:",
    noStartLocation: "Sin ubicación inicial",
    conflicts: "Conflictos",
    relevantSignals: "Señales relevantes para este personaje",
    noConflicts:
      "No detectamos conflictos visibles en la secuencia actual de este personaje.",
    warning: "Advertencia",
    info: "Información",
    alias: "Sin alias",
    overlapFlag: "Superposición",
  },
  en: {
    tracking: "Tracking",
    back: "Back to characters",
    detail: "Detail",
    sheet: "Character sheet",
    description: "Description",
    noDescription: "No description recorded.",
    notes: "Notes",
    noNotes: "No notes recorded.",
    statusDate: "Status internal date",
    noDate: "No date",
    project: "Project",
    edition: "Edition",
    updateCharacter: "Update character",
    saveCharacter: "Save character",
    deleteCharacter: "Delete character",
    noTimelineTitle: "This character does not appear in events yet",
    noTimelineBody:
      "You can assign them from the event form or drag them into the project timeline.",
    openTimeline: "Open timeline",
    sequence: "Sequence",
    chronologicalAppearances: "Chronological appearances",
    appearances: "appearances",
    intervalFromPrevious: "Interval from previous event:",
    noStartLocation: "No initial location",
    conflicts: "Conflicts",
    relevantSignals: "Relevant signals for this character",
    noConflicts:
      "We did not detect visible conflicts in this character's current sequence.",
    warning: "Warning",
    info: "Info",
    alias: "No alias",
    overlapFlag: "Overlap",
  },
} as const;

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatOptionalDate(value: Date | string | null | undefined, language: string, noValue: string) {
  if (!value) {
    return noValue;
  }

  return formatDate(value instanceof Date ? value.toISOString() : value, language);
}

export default async function CharacterTrackingPage({
  params,
}: {
  params: Promise<{ projectId: string; characterId: string }>;
}) {
  const { projectId, characterId } = await params;
  const { character, events } = await getOwnedCharacterTimeline(projectId, characterId);
  const language = await getServerLanguage();
  const text = copy[language];
  const { timeline, conflicts } = buildCharacterTracking(events, language);
  const charactersPath = `/projects/${projectId}/characters`;
  const detailPath = `${charactersPath}/${characterId}`;

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
                {text.tracking}
              </p>
              <h3 className="mt-2 text-2xl font-semibold">{character.name}</h3>
              <p className="mt-2 text-sm text-muted">
                {character.project.title} · {character.alias ?? text.alias}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{character.status}</Badge>
          </div>
        </div>

        <div className="mt-5">
          <Link
            href={charactersPath}
            className="inline-flex items-center justify-center rounded-full border border-line bg-canvas/70 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:bg-surface"
          >
            {text.back}
          </Link>
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
                {character.description ?? text.noDescription}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink">{text.notes}</dt>
              <dd className="mt-1 leading-6 text-muted">
                {character.notes ?? text.noNotes}
              </dd>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-ink">{text.statusDate}</dt>
                <dd className="mt-1 text-muted">
                  {formatOptionalDate(character.statusDateInternal, language, text.noDate)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">{text.project}</dt>
                <dd className="mt-1 text-muted">{character.project.title}</dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            {text.edition}
          </p>
          <h3 className="mt-3 text-xl font-semibold">{text.updateCharacter}</h3>
          <div className="mt-5">
            <CharacterForm
              action={updateCharacterAction}
              submitLabel={text.saveCharacter}
              projectId={projectId}
              redirectTo={detailPath}
              initialValues={character}
            />
          </div>

          <div className="mt-5 flex justify-end">
            <DeleteResourceForm
              action={deleteCharacterAction}
              resourceIdName="characterId"
              resourceId={character.id}
              projectId={projectId}
              redirectTo={charactersPath}
              label={text.deleteCharacter}
            />
          </div>
        </div>
      </section>

      {timeline.length === 0 ? (
        <EmptyState
          eyebrow="CH"
          title={text.noTimelineTitle}
          body={text.noTimelineBody}
          actionLabel={text.openTimeline}
          actionHref={`/projects/${projectId}/timeline`}
        />
      ) : (
        <>
          <section className="rounded-[28px] border border-line bg-surface p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                  {text.sequence}
                </p>
                <h3 className="mt-2 text-xl font-semibold">
                  {text.chronologicalAppearances}
                </h3>
              </div>
              <Badge tone="success">
                {timeline.length} {text.appearances}
              </Badge>
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
                        {formatDate(item.internalStartIso, language)} {"->"} {formatDate(item.internalEndIso, language)}
                      </p>
                    </div>

                    {index > 0 && item.gapLabel ? (
                      <div className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
                        {text.intervalFromPrevious} {item.gapLabel}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.startLocationName ? <Badge>{item.startLocationName}</Badge> : <Badge>{text.noStartLocation}</Badge>}
                    {item.endLocationName && item.endLocationName !== item.startLocationName ? (
                      <Badge>{item.endLocationName}</Badge>
                    ) : null}
                    {item.flags.map((flag) => (
                      <Badge key={flag} tone={flag === text.overlapFlag ? "accent" : "default"}>
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
                  {text.conflicts}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{text.relevantSignals}</h3>
              </div>
              <Badge>{conflicts.length}</Badge>
            </div>

            {conflicts.length === 0 ? (
              <p className="mt-5 text-sm text-muted">{text.noConflicts}</p>
            ) : (
              <div className="mt-5 space-y-3">
                {conflicts.map((conflict) => (
                  <article
                    key={conflict.id}
                    className="rounded-[22px] border border-line bg-canvas/55 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Badge tone={conflict.severity === "warning" ? "accent" : "default"}>
                        {conflict.severity === "warning" ? text.warning : text.info}
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
