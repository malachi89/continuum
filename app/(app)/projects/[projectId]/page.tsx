import Link from "next/link";
import { deleteProjectAction, updateProjectAction } from "@/app/(app)/projects/actions";
import { DeleteResourceForm } from "@/components/forms/DeleteResourceForm";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { prisma } from "@/lib/prisma";
import { getOwnedProject } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    quickAccess: "Accesos rapidos",
    openEvents: "Abrir editor de eventos",
    recentCharacters: "Personajes recientes",
    noCharacters: "Aun no hay personajes.",
    recentLocations: "Locaciones base",
    noLocations: "Aun no hay locaciones.",
    recentEvents: "Primeros eventos",
    noEvents: "Aun no hay eventos.",
    configuration: "Configuracion",
    editProject: "Editar proyecto",
    saveChanges: "Guardar cambios",
    dangerZone: "Zona delicada",
    deleteProject: "Borrar proyecto",
    deleteProjectBody:
      "Esta accion elimina tambien personajes, locaciones, eventos y relaciones asociadas por cascada.",
    deleteButton: "Borrar proyecto",
  },
  en: {
    quickAccess: "Quick access",
    openEvents: "Open events editor",
    recentCharacters: "Recent characters",
    noCharacters: "There are no characters yet.",
    recentLocations: "Base locations",
    noLocations: "There are no locations yet.",
    recentEvents: "First events",
    noEvents: "There are no events yet.",
    configuration: "Configuration",
    editProject: "Edit project",
    saveChanges: "Save changes",
    dangerZone: "Danger zone",
    deleteProject: "Delete project",
    deleteProjectBody:
      "This action also deletes associated characters, locations, events, and links through cascade.",
    deleteButton: "Delete project",
  },
} as const;

export default async function ProjectSummaryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getOwnedProject(projectId);
  const language = await getServerLanguage();
  const text = copy[language];
  const [recentCharacters, recentLocations, recentEvents] = await Promise.all([
    prisma.character.findMany({
      where: { projectId },
      orderBy: { name: "asc" },
      take: 4,
    }),
    prisma.location.findMany({
      where: { projectId },
      orderBy: { name: "asc" },
      take: 4,
    }),
    prisma.event.findMany({
      where: { projectId },
      orderBy: { internalStart: "asc" },
      take: 4,
    }),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        <div className="rounded-[28px] border border-line bg-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold">{text.quickAccess}</h3>
            <Link href={`/projects/${projectId}/events`} className="text-sm font-semibold text-accent">
              {text.openEvents}
            </Link>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            <article className="rounded-[24px] border border-line bg-canvas/60 p-4">
              <h4 className="font-semibold">{text.recentCharacters}</h4>
              {recentCharacters.length === 0 ? (
                <p className="mt-3 text-sm text-muted">{text.noCharacters}</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {recentCharacters.map((character) => (
                    <li key={character.id}>{character.name}</li>
                  ))}
                </ul>
              )}
            </article>
            <article className="rounded-[24px] border border-line bg-canvas/60 p-4">
              <h4 className="font-semibold">{text.recentLocations}</h4>
              {recentLocations.length === 0 ? (
                <p className="mt-3 text-sm text-muted">{text.noLocations}</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {recentLocations.map((location) => (
                    <li key={location.id}>{location.name}</li>
                  ))}
                </ul>
              )}
            </article>
            <article className="rounded-[24px] border border-line bg-canvas/60 p-4">
              <h4 className="font-semibold">{text.recentEvents}</h4>
              {recentEvents.length === 0 ? (
                <p className="mt-3 text-sm text-muted">{text.noEvents}</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {recentEvents.map((event) => (
                    <li key={event.id}>{event.title}</li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            {text.configuration}
          </p>
          <h3 className="mt-3 text-xl font-semibold">{text.editProject}</h3>
          <div className="mt-5">
            <ProjectForm
              action={updateProjectAction}
              submitLabel={text.saveChanges}
              redirectTo={`/projects/${projectId}`}
              initialValues={project}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-accent/20 bg-accent/5 p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-strong">
            {text.dangerZone}
          </p>
          <h3 className="mt-3 text-xl font-semibold">{text.deleteProject}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">{text.deleteProjectBody}</p>
          <div className="mt-5">
            <DeleteResourceForm
              action={deleteProjectAction}
              resourceIdName="projectId"
              resourceId={projectId}
              redirectTo="/projects"
              label={text.deleteButton}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
