import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

type ProjectSummary = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  _count: {
    characters: number;
    locations: number;
    events: number;
  };
};

export function ProjectRoutePicker({
  title,
  description,
  routeSuffix,
  projects,
}: {
  title: string;
  description: string;
  routeSuffix:
    | "/characters"
    | "/locations"
    | "/events"
    | "/timeline"
    | "/analysis";
  projects: ProjectSummary[];
}) {
  if (projects.length === 0) {
    return (
      <EmptyState
        eyebrow="PICK"
        title="Primero crea un proyecto"
        body="Estas vistas trabajan dentro del contexto de un proyecto. Apenas tengas uno, podras entrar directo a sus personajes, locaciones o eventos."
        actionLabel="Ir a proyectos"
        actionHref="/projects"
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-line bg-surface/80 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">Ruta</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{description}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}${routeSuffix}`}
            className="rounded-[24px] border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-accent"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                  {project.type}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{project.title}</h3>
              </div>
              <Badge tone="accent">{project._count.events} eventos</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              {project.description ?? "Sin descripcion todavia."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{project._count.characters} personajes</Badge>
              <Badge>{project._count.locations} locaciones</Badge>
              <Badge>{project._count.events} eventos</Badge>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
