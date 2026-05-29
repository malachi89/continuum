import { ProjectImportForm } from "@/components/forms/ProjectImportForm";
import { Badge } from "@/components/ui/Badge";
import { getOwnedProjectExportBundle } from "@/lib/continuity/data";

export default async function ProjectImportExportPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const exportBundle = await getOwnedProjectExportBundle(projectId);
  const exportJson = JSON.stringify(exportBundle, null, 2);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              Exportar
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Bundle JSON portable</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              Este bloque contiene proyecto, personajes, locaciones, eventos y relaciones
              evento-personaje del proyecto actual.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{exportBundle.characters.length} personajes</Badge>
            <Badge>{exportBundle.locations.length} locaciones</Badge>
            <Badge tone="success">{exportBundle.events.length} eventos</Badge>
          </div>
        </div>

        <pre className="mt-5 overflow-x-auto rounded-[24px] border border-line bg-canvas/70 p-4 text-xs leading-6 text-ink">
          {exportJson}
        </pre>
      </section>

      <section className="rounded-[28px] border border-line bg-surface p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          Importar
        </p>
        <h3 className="mt-3 text-2xl font-semibold">Crear copia nueva</h3>
        <p className="mt-3 text-sm leading-6 text-muted">
          Pega un JSON valido y la app creara un proyecto nuevo para tu usuario actual,
          sin sobrescribir proyectos existentes.
        </p>

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
