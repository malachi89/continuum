import Link from "next/link";
import { createProjectAction } from "@/app/(app)/projects/actions";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOwnedProjects } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    dashboard: "Tablero",
    title: "Proyectos",
    description:
      "Crea y administra universos privados por usuario. Desde cada proyecto podras abrir su workspace de personajes, locaciones y eventos.",
    newProject: "Nuevo proyecto",
    newProjectTitle: "Arrancar un nuevo canon",
    createProject: "Crear proyecto",
    emptyEyebrow: "P01",
    emptyTitle: "Todavia no hay proyectos",
    emptyBody:
      "Crea el primero para empezar a cargar personajes, locaciones y eventos con control por usuario.",
    private: "Privado",
    noDescription: "Sin descripcion por ahora.",
    characters: "personajes",
    locations: "locaciones",
    events: "eventos",
  },
  en: {
    dashboard: "Dashboard",
    title: "Projects",
    description:
      "Create and manage private universes per user. From each project you can open its characters, locations, and events workspace.",
    newProject: "New project",
    newProjectTitle: "Launch a new canon",
    createProject: "Create project",
    emptyEyebrow: "P01",
    emptyTitle: "There are no projects yet",
    emptyBody:
      "Create the first one to start adding characters, locations, and events with per-user ownership.",
    private: "Private",
    noDescription: "No description yet.",
    characters: "characters",
    locations: "locations",
    events: "events",
  },
} as const;

export default async function ProjectsPage() {
  const projects = await getOwnedProjects();
  const language = await getServerLanguage();
  const text = copy[language];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            {text.dashboard}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{text.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            {text.description}
          </p>
        </div>

        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            {text.newProject}
          </p>
          <h3 className="mt-3 text-xl font-semibold">{text.newProjectTitle}</h3>
          <div className="mt-5">
            <ProjectForm
              action={createProjectAction}
              submitLabel={text.createProject}
              redirectTo="/projects"
            />
          </div>
        </div>
      </section>

      {projects.length === 0 ? (
        <EmptyState
          eyebrow={text.emptyEyebrow}
          title={text.emptyTitle}
          body={text.emptyBody}
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
                <Badge tone="accent">{text.private}</Badge>
              </div>

              <p className="mt-3 text-sm leading-6 text-muted">
                {project.description ?? text.noDescription}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge>
                  {project._count.characters} {text.characters}
                </Badge>
                <Badge>
                  {project._count.locations} {text.locations}
                </Badge>
                <Badge tone="success">
                  {project._count.events} {text.events}
                </Badge>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
