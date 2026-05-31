import Link from "next/link";
import { createLocationAction } from "@/app/(app)/projects/actions";
import { LocationForm } from "@/components/forms/LocationForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOwnedProject, getOwnedProjectLocations } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    newLocation: "Nueva locacion",
    map: "Mapa narrativo de",
    createLocation: "Crear locacion",
    noLocationsTitle: "No hay locaciones todavia",
    noLocationsBody:
      "Puedes cargar lugares exactos o dejar escenas sin locacion para que el analizador lo marque despues.",
    register: "Registro",
    registeredLocations: "Locaciones registradas",
    location: "Locación",
    type: "Tipo",
    coordinates: "Coordenadas",
    notes: "Notas",
    action: "Accion",
    noDescription: "Sin descripcion",
    noDefined: "Sin definir",
    withNotes: "Con notas",
    noNotes: "Sin notas",
    detail: "Detalle",
  },
  en: {
    newLocation: "New location",
    map: "Narrative map for",
    createLocation: "Create location",
    noLocationsTitle: "There are no locations yet",
    noLocationsBody:
      "You can load exact places or leave scenes without a location so the analyzer can flag them later.",
    register: "Registry",
    registeredLocations: "Registered locations",
    location: "Location",
    type: "Type",
    coordinates: "Coordinates",
    notes: "Notes",
    action: "Action",
    noDescription: "No description",
    noDefined: "Unset",
    withNotes: "With notes",
    noNotes: "No notes",
    detail: "Detail",
  },
} as const;

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
  const language = await getServerLanguage();
  const text = copy[language];
  const redirectTo = `/projects/${projectId}/locations`;

  return (
    <div className="space-y-6">
      <details className="rounded-[28px] border border-line bg-surface p-6">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {text.newLocation}
            </p>
            <h3 className="mt-3 text-2xl font-semibold">
              {text.map} {project.title}
            </h3>
          </div>
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-canvas/70 text-2xl leading-none text-ink transition">
            +
          </span>
        </summary>
        <div className="mt-5">
          <LocationForm
            action={createLocationAction}
            submitLabel={text.createLocation}
            projectId={projectId}
            redirectTo={redirectTo}
          />
        </div>
      </details>

      {locations.length === 0 ? (
        <EmptyState
          eyebrow="LO"
          title={text.noLocationsTitle}
          body={text.noLocationsBody}
        />
      ) : (
        <section className="rounded-[28px] border border-line bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                {text.register}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{text.registeredLocations}</h3>
            </div>
            <Badge tone="success">{locations.length} {text.location.toLowerCase()}</Badge>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-[0.18em] text-muted">
                  <th className="py-3 pr-4 font-medium">{text.location}</th>
                  <th className="px-4 py-3 font-medium">{text.type}</th>
                  <th className="px-4 py-3 font-medium">{text.coordinates}</th>
                  <th className="px-4 py-3 font-medium">{text.notes}</th>
                  <th className="py-3 pl-4 text-right font-medium">{text.action}</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id} className="border-b border-line/70 last:border-0">
                    <td className="py-4 pr-4">
                      <div>
                        <span className="font-semibold text-ink">{location.name}</span>
                        <p className="mt-1 line-clamp-2 text-muted">
                          {location.description ?? text.noDescription}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone="accent">{location.type}</Badge>
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {location.latitude !== null && location.longitude !== null
                        ? `${location.latitude}, ${location.longitude}`
                        : text.noDefined}
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {location.notes ? text.withNotes : text.noNotes}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <Link
                        href={`/projects/${projectId}/locations/${location.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-line bg-canvas/70 px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:bg-surface"
                      >
                        {text.detail}
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
