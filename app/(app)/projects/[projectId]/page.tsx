import Link from "next/link";
import { deleteProjectAction, updateProjectAction } from "@/app/(app)/projects/actions";
import { DeleteResourceForm } from "@/components/forms/DeleteResourceForm";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { prisma } from "@/lib/prisma";
import { getOwnedProject } from "@/lib/continuity/data";

export default async function ProjectSummaryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getOwnedProject(projectId);
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
            <h3 className="text-xl font-semibold">Accesos rapidos</h3>
            <Link href={`/projects/${projectId}/events`} className="text-sm font-semibold text-accent">
              Abrir editor de eventos
            </Link>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            <article className="rounded-[24px] border border-line bg-canvas/60 p-4">
              <h4 className="font-semibold">Personajes recientes</h4>
              {recentCharacters.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Aun no hay personajes.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {recentCharacters.map((character) => (
                    <li key={character.id}>{character.name}</li>
                  ))}
                </ul>
              )}
            </article>
            <article className="rounded-[24px] border border-line bg-canvas/60 p-4">
              <h4 className="font-semibold">Locaciones base</h4>
              {recentLocations.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Aun no hay locaciones.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {recentLocations.map((location) => (
                    <li key={location.id}>{location.name}</li>
                  ))}
                </ul>
              )}
            </article>
            <article className="rounded-[24px] border border-line bg-canvas/60 p-4">
              <h4 className="font-semibold">Primeros eventos</h4>
              {recentEvents.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Aun no hay eventos.</p>
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
            Configuracion
          </p>
          <h3 className="mt-3 text-xl font-semibold">Editar proyecto</h3>
          <div className="mt-5">
            <ProjectForm
              action={updateProjectAction}
              submitLabel="Guardar cambios"
              redirectTo={`/projects/${projectId}`}
              initialValues={project}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-accent/20 bg-accent/5 p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-strong">
            Zona delicada
          </p>
          <h3 className="mt-3 text-xl font-semibold">Borrar proyecto</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            Esta accion elimina tambien personajes, locaciones, eventos y relaciones
            asociadas por cascada.
          </p>
          <div className="mt-5">
            <DeleteResourceForm
              action={deleteProjectAction}
              resourceIdName="projectId"
              resourceId={projectId}
              redirectTo="/projects"
              label="Borrar proyecto"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
