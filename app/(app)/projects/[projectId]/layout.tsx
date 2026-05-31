import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getOwnedProject } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    activeProject: "Proyecto activo",
    noDescription: "Sin descripción registrada todavía.",
    characters: "personajes",
    locations: "locaciones",
    events: "eventos",
    switchProject: "Cambiar proyecto",
  },
  en: {
    activeProject: "Active project",
    noDescription: "No description has been recorded yet.",
    characters: "characters",
    locations: "locations",
    events: "events",
    switchProject: "Switch project",
  },
} as const;

export default async function ProjectLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}>) {
  const { projectId } = await params;
  const project = await getOwnedProject(projectId);
  const language = await getServerLanguage();
  const text = copy[language];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {text.activeProject}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{project.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              {project.description ?? text.noDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{project.type}</Badge>
            <Badge>
              {project._count.characters} {text.characters}
            </Badge>
            <Badge>
              {project._count.locations} {text.locations}
            </Badge>
            <Badge tone="success">
              {project._count.events} {text.events}
            </Badge>
            <Link
              href="/projects"
              className="rounded-full border border-line bg-canvas/70 px-3 py-1 text-xs font-semibold text-ink transition hover:border-accent hover:bg-surface"
            >
              {text.switchProject}
            </Link>
          </div>
        </div>

      </section>

      {children}
    </div>
  );
}
