import { createLocationAction, deleteLocationAction, updateLocationAction } from "@/app/(app)/projects/actions";
import { DeleteResourceForm } from "@/components/forms/DeleteResourceForm";
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
        <section className="grid gap-4">
          {locations.map((location) => (
            <article key={location.id} className="rounded-[28px] border border-line bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{location.name}</h3>
                  <p className="mt-1 text-sm text-muted">{location.description ?? "Sin descripcion"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="accent">{location.type}</Badge>
                  {location.latitude !== null && location.longitude !== null ? (
                    <Badge tone="success">
                      {location.latitude}, {location.longitude}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="mt-5">
                <LocationForm
                  action={updateLocationAction}
                  submitLabel="Guardar locacion"
                  projectId={projectId}
                  redirectTo={redirectTo}
                  initialValues={location}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <DeleteResourceForm
                  action={deleteLocationAction}
                  resourceIdName="locationId"
                  resourceId={location.id}
                  projectId={projectId}
                  redirectTo={redirectTo}
                  label="Borrar locacion"
                />
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
