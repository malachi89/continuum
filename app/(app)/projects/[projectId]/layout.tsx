import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
import { getOwnedProject } from "@/lib/continuity/data";

export default async function ProjectLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}>) {
  const { projectId } = await params;
  const project = await getOwnedProject(projectId);

  return (
    <div className="space-y-6">
      <section className="sticky top-4 z-20 rounded-[28px] border border-line bg-surface/95 p-6 shadow-[0_18px_50px_rgba(91,71,36,0.1)] backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              Proyecto activo
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{project.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              {project.description ?? "Sin descripción registrada todavía."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{project.type}</Badge>
            <Badge>{project._count.characters} personajes</Badge>
            <Badge>{project._count.locations} locaciones</Badge>
            <Badge tone="success">{project._count.events} eventos</Badge>
            <Link
              href="/projects"
              className="rounded-full border border-line bg-canvas/70 px-3 py-1 text-xs font-semibold text-ink transition hover:border-accent hover:bg-surface"
            >
              Cambiar proyecto
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <ProjectWorkspaceNav projectId={projectId} />
        </div>
      </section>

      {children}
    </div>
  );
}
