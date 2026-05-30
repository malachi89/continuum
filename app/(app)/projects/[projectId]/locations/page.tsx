import { createLocationAction } from "@/app/(app)/projects/actions";
import Link from "next/link";
import { LocationForm } from "@/components/forms/LocationForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOwnedProject, getOwnedProjectLocations } from "@/lib/continuity/data";

export default async function ProjectLocationsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [project, locations] = await Promise.all([
    getOwnedProject(projectId),
    getOwnedProjectLocations(projectId),
  ]);
  const redirectTo = `/projects/${projectId}/locations`;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          Nueva locacion
        </p>
        <h3 className="mt-3 text-2xl font-semibold">Mapa narrativo de {project.title}</h3>
        <div className="mt-5">
          <LocationForm
            action={createLocationAction}
            submitLabel="Crear locacion"
            projectId={projectId}
            redirectTo={redirectTo}
          />
        </div>
      </section>

      {locations.length === 0 ? (
        <EmptyState
          eyebrow="LO"
          title="No hay locaciones todavia"
          body="Puedes cargar lugares exactos o dejar escenas sin locacion para que el analizador lo marque despues."
        />
      ) : (
        <section className="rounded-[28px] border border-line bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                Registro
              </p>
              <h3 className="mt-2 text-xl font-semibold">Locaciones registradas</h3>
            </div>
            <Badge tone="success">{locations.length} locaciones</Badge>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-[0.18em] text-muted">
                  <th className="py-3 pr-4 font-medium">Locación</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Coordenadas</th>
                  <th className="px-4 py-3 font-medium">Notas</th>
                  <th className="py-3 pl-4 text-right font-medium">Accion</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id} className="border-b border-line/70 last:border-0">
                    <td className="py-4 pr-4">
                      <div>
                        <span className="font-semibold text-ink">{location.name}</span>
                        <p className="mt-1 line-clamp-2 text-muted">
                          {location.description ?? "Sin descripcion"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone="accent">{location.type}</Badge>
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {location.latitude !== null && location.longitude !== null
                        ? `${location.latitude}, ${location.longitude}`
                        : "Sin definir"}
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {location.notes ? "Con notas" : "Sin notas"}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <Link
                        href={`/projects/${projectId}/locations/${location.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-line bg-canvas/70 px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:bg-surface"
                      >
                        Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
