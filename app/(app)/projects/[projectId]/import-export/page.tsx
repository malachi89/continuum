import { ProjectImportForm } from "@/components/forms/ProjectImportForm";
import { Badge } from "@/components/ui/Badge";
import { getOwnedProjectExportBundle } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    export: "Exportar",
    title: "Paquete JSON portable",
    description:
      "Este bloque contiene proyecto, personajes, locaciones, eventos, relaciones evento-personaje y datos de produccion del proyecto actual.",
    import: "Importar",
    importTitle: "Crear copia nueva",
    importDescription:
      "Pega un JSON valido y la app creara un proyecto nuevo para tu usuario actual, sin sobrescribir proyectos existentes.",
    characters: "personajes",
    locations: "locaciones",
    events: "eventos",
  },
  en: {
    export: "Export",
    title: "Portable JSON bundle",
    description:
      "This block includes the current project's project record, characters, locations, events, event-character links, and production data.",
    import: "Import",
    importTitle: "Create a new copy",
    importDescription:
      "Paste valid JSON and the app will create a new project for your current user without overwriting existing projects.",
    characters: "characters",
    locations: "locations",
    events: "events",
  },
} as const;

export default async function ProjectImportExportPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const exportBundle = await getOwnedProjectExportBundle(projectId);
  const exportJson = JSON.stringify(exportBundle, null, 2);
  const language = await getServerLanguage();
  const text = copy[language];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {text.export}
            </p>
            <h3 className="mt-3 text-2xl font-semibold">{text.title}</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{text.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{exportBundle.characters.length} {text.characters}</Badge>
            <Badge>{exportBundle.locations.length} {text.locations}</Badge>
            <Badge tone="success">{exportBundle.events.length} {text.events}</Badge>
          </div>
        </div>

        <pre className="mt-5 overflow-x-auto rounded-[24px] border border-line bg-canvas/70 p-4 text-xs leading-6 text-ink">
          {exportJson}
        </pre>
      </section>

      <section className="rounded-[28px] border border-line bg-surface p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          {text.import}
        </p>
        <h3 className="mt-3 text-2xl font-semibold">{text.importTitle}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{text.importDescription}</p>

        <div className="mt-5">
          <ProjectImportForm
            sourceProjectId={projectId}
            redirectTo={`/projects/${projectId}/import-export`}
          />
        </div>
      </section>
    </div>
  );
}
