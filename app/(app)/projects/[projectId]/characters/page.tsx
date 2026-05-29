import { createCharacterAction, deleteCharacterAction, updateCharacterAction } from "@/app/(app)/projects/actions";
import Link from "next/link";
import { CharacterForm } from "@/components/forms/CharacterForm";
import { DeleteResourceForm } from "@/components/forms/DeleteResourceForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOwnedProject, getOwnedProjectCharacters } from "@/lib/continuity/data";

export default async function ProjectCharactersPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [project, characters] = await Promise.all([
    getOwnedProject(projectId),
    getOwnedProjectCharacters(projectId),
  ]);
  const redirectTo = `/projects/${projectId}/characters`;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          Nuevo personaje
        </p>
        <h3 className="mt-3 text-2xl font-semibold">Reparto de {project.title}</h3>
        <div className="mt-5">
          <CharacterForm
            action={createCharacterAction}
            submitLabel="Crear personaje"
            projectId={projectId}
            redirectTo={redirectTo}
          />
        </div>
      </section>

      {characters.length === 0 ? (
        <EmptyState
          eyebrow="CH"
          title="No hay personajes todavia"
          body="Empieza con protagonistas, secundarios o testigos de continuidad para conectar los eventos del proyecto."
        />
      ) : (
        <section className="grid gap-4">
          {characters.map((character) => (
            <article key={character.id} className="rounded-[28px] border border-line bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full border border-black/10"
                    style={{ backgroundColor: character.color }}
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{character.name}</h3>
                    <p className="text-sm text-muted">{character.alias ?? "Sin alias"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{character.status}</Badge>
                  {character.maxTravelMode ? <Badge tone="accent">{character.maxTravelMode}</Badge> : null}
                  {character.maxSpeedKmh ? <Badge tone="success">{character.maxSpeedKmh} km/h</Badge> : null}
                </div>
              </div>

              <div className="mt-4">
                <Link href={`/projects/${projectId}/characters/${character.id}`}>
                  <Button variant="secondary">Ver tracking individual</Button>
                </Link>
              </div>

              <div className="mt-5">
                <CharacterForm
                  action={updateCharacterAction}
                  submitLabel="Guardar personaje"
                  projectId={projectId}
                  redirectTo={redirectTo}
                  initialValues={character}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <DeleteResourceForm
                  action={deleteCharacterAction}
                  resourceIdName="characterId"
                  resourceId={character.id}
                  projectId={projectId}
                  redirectTo={redirectTo}
                  label="Borrar personaje"
                />
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
