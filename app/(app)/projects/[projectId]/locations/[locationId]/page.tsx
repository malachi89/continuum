import Link from "next/link";
import {
  deleteLocationAction,
  updateLocationAction,
} from "@/app/(app)/projects/actions";
import { DeleteResourceForm } from "@/components/forms/DeleteResourceForm";
import { LocationForm } from "@/components/forms/LocationForm";
import { Badge } from "@/components/ui/Badge";
import { getOwnedProjectLocation } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    location: "Locacion",
    back: "Volver a locaciones",
    detail: "Detalle",
    sheet: "Ficha de locacion",
    description: "Descripcion",
    noDescription: "Sin descripcion registrada.",
    notes: "Notas",
    noNotes: "Sin notas registradas.",
    latitude: "Latitud",
    longitude: "Longitud",
    startEvents: "Eventos que inician aqui",
    endEvents: "Eventos que terminan aqui",
    edition: "Edicion",
    updateLocation: "Actualizar locacion",
    saveLocation: "Guardar locacion",
    deleteLocation: "Borrar locacion",
    noDefined: "Sin definir",
  },
  en: {
    location: "Location",
    back: "Back to locations",
    detail: "Detail",
    sheet: "Location sheet",
    description: "Description",
    noDescription: "No description recorded.",
    notes: "Notes",
    noNotes: "No notes recorded.",
    latitude: "Latitude",
    longitude: "Longitude",
    startEvents: "Events that start here",
    endEvents: "Events that end here",
    edition: "Edition",
    updateLocation: "Update location",
    saveLocation: "Save location",
    deleteLocation: "Delete location",
    noDefined: "Unset",
  },
} as const;

function formatCoordinate(value: number | null, noValue: string) {
  return value !== null ? String(value) : noValue;
}

export default async function ProjectLocationDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; locationId: string }>;
}) {
  const { projectId, locationId } = await params;
  const location = await getOwnedProjectLocation(projectId, locationId);
  const language = await getServerLanguage();
  const text = copy[language];
  const locationsPath = `/projects/${projectId}/locations`;
  const detailPath = `${locationsPath}/${locationId}`;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {text.location}
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{location.name}</h3>
            <p className="mt-2 text-sm text-muted">
              {location.project.title} · {location.description ?? text.noDescription}
            </p>
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
          <Link
            href={locationsPath}
            className="inline-flex items-center justify-center rounded-full border border-line bg-canvas/70 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:bg-surface"
          >
            {text.back}
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            {text.detail}
          </p>
          <h3 className="mt-3 text-xl font-semibold">{text.sheet}</h3>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-ink">{text.description}</dt>
              <dd className="mt-1 leading-6 text-muted">
                {location.description ?? text.noDescription}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink">{text.notes}</dt>
              <dd className="mt-1 leading-6 text-muted">
                {location.notes ?? text.noNotes}
              </dd>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-ink">{text.latitude}</dt>
                <dd className="mt-1 text-muted">
                  {formatCoordinate(location.latitude, text.noDefined)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">{text.longitude}</dt>
                <dd className="mt-1 text-muted">
                  {formatCoordinate(location.longitude, text.noDefined)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">{text.startEvents}</dt>
                <dd className="mt-1 text-muted">{location._count.startEvents}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">{text.endEvents}</dt>
                <dd className="mt-1 text-muted">{location._count.endEvents}</dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            {text.edition}
          </p>
          <h3 className="mt-3 text-xl font-semibold">{text.updateLocation}</h3>
          <div className="mt-5">
            <LocationForm
              action={updateLocationAction}
              submitLabel={text.saveLocation}
              projectId={projectId}
              redirectTo={detailPath}
              initialValues={location}
            />
          </div>

          <div className="mt-5 flex justify-end">
            <DeleteResourceForm
              action={deleteLocationAction}
              resourceIdName="locationId"
              resourceId={location.id}
              projectId={projectId}
              redirectTo={locationsPath}
              label={text.deleteLocation}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
