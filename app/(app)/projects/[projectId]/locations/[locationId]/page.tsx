import {
  deleteLocationAction,
  updateLocationAction,
} from "@/app/(app)/projects/actions";
import Link from "next/link";
import { DeleteResourceForm } from "@/components/forms/DeleteResourceForm";
import { LocationForm } from "@/components/forms/LocationForm";
import { Badge } from "@/components/ui/Badge";
import { getOwnedProjectLocation } from "@/lib/continuity/data";

function formatCoordinate(value: number | null) {
  return value !== null ? String(value) : "Sin definir";
}

export default async function ProjectLocationDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; locationId: string }>;
}) {
  const { projectId, locationId } = await params;
  const location = await getOwnedProjectLocation(projectId, locationId);
  const locationsPath = `/projects/${projectId}/locations`;
  const detailPath = `${locationsPath}/${locationId}`;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              Locacion
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{location.name}</h3>
            <p className="mt-2 text-sm text-muted">
              {location.project.title} · {location.description ?? "Sin descripcion"}
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
            Volver a locaciones
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            Detalle
          </p>
          <h3 className="mt-3 text-xl font-semibold">Ficha de locacion</h3>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-ink">Descripcion</dt>
              <dd className="mt-1 leading-6 text-muted">
                {location.description ?? "Sin descripcion registrada."}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Notas</dt>
              <dd className="mt-1 leading-6 text-muted">
                {location.notes ?? "Sin notas registradas."}
              </dd>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-ink">Latitud</dt>
                <dd className="mt-1 text-muted">{formatCoordinate(location.latitude)}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Longitud</dt>
                <dd className="mt-1 text-muted">{formatCoordinate(location.longitude)}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Eventos que inician aqui</dt>
                <dd className="mt-1 text-muted">{location._count.startEvents}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Eventos que terminan aqui</dt>
                <dd className="mt-1 text-muted">{location._count.endEvents}</dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            Edicion
          </p>
          <h3 className="mt-3 text-xl font-semibold">Actualizar locacion</h3>
          <div className="mt-5">
            <LocationForm
              action={updateLocationAction}
              submitLabel="Guardar locacion"
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
              label="Borrar locacion"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
