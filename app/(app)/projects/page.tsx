import Link from "next/link";
import { createProjectAction } from "@/app/(app)/projects/actions";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOwnedProjects } from "@/lib/continuity/data";

export default async function ProjectsPage() {
  const projects = await getOwnedProjects();

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            Tablero
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Proyectos</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Crea y administra universos privados por usuario. Desde cada proyecto
            podras abrir su workspace de personajes, locaciones y eventos.
          </p>
        </div>

        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            Nuevo proyecto
          </p>
          <h3 className="mt-3 text-xl font-semibold">Arrancar un nuevo canon</h3>
          <div className="mt-5">
            <ProjectForm
              action={createProjectAction}
              submitLabel="Crear proyecto"
              redirectTo="/projects"
            />
          </div>
        </div>
      </section>

      {projects.length === 0 ? (
        <EmptyState
          eyebrow="P01"
          title="Todavia no hay proyectos"
          body="Crea el primero para empezar a cargar personajes, locaciones y eventos con control por usuario."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-[24px] border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-accent"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                    {project.type}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{project.title}</h3>
                </div>
                <Badge tone="accent">Privado</Badge>
              </div>

              <p className="mt-3 text-sm leading-6 text-muted">
                {project.description ?? "Sin descripcion por ahora."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge>{project._count.characters} personajes</Badge>
                <Badge>{project._count.locations} locaciones</Badge>
                <Badge tone="success">{project._count.events} eventos</Badge>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
