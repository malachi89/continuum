import Link from "next/link";
import { createCharacterAction } from "@/app/(app)/projects/actions";
import { CharacterForm } from "@/components/forms/CharacterForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOwnedProject, getOwnedProjectCharacters } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    newCharacter: "Nuevo personaje",
    cast: "Reparto de",
    createCharacter: "Crear personaje",
    noCharactersTitle: "No hay personajes todavía",
    noCharactersBody:
      "Empieza con protagonistas, secundarios o testigos de continuidad para conectar los eventos del proyecto.",
    register: "Registro",
    registeredCharacters: "Personajes registrados",
    character: "Personaje",
    alias: "Alias",
    status: "Estado",
    action: "Accion",
    noAlias: "Sin alias",
    detail: "Detalle",
  },
  en: {
    newCharacter: "New character",
    cast: "Cast for",
    createCharacter: "Create character",
    noCharactersTitle: "There are no characters yet",
    noCharactersBody:
      "Start with protagonists, supporting characters, or continuity witnesses to connect the project events.",
    register: "Registry",
    registeredCharacters: "Registered characters",
    character: "Character",
    alias: "Alias",
    status: "Status",
    action: "Action",
    noAlias: "No alias",
    detail: "Detail",
  },
} as const;

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
  const language = await getServerLanguage();
  const text = copy[language];
  const redirectTo = `/projects/${projectId}/characters`;

  return (
    <div className="space-y-6">
      <details className="rounded-[28px] border border-line bg-surface p-6">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {text.newCharacter}
            </p>
            <h3 className="mt-3 text-2xl font-semibold">
              {text.cast} {project.title}
            </h3>
          </div>
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-canvas/70 text-2xl leading-none text-ink transition">
            +
          </span>
        </summary>
        <div className="mt-5">
          <CharacterForm
            action={createCharacterAction}
            submitLabel={text.createCharacter}
            projectId={projectId}
            redirectTo={redirectTo}
          />
        </div>
      </details>

      {characters.length === 0 ? (
        <EmptyState
          eyebrow="CH"
          title={text.noCharactersTitle}
          body={text.noCharactersBody}
        />
      ) : (
        <section className="rounded-[28px] border border-line bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                {text.register}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{text.registeredCharacters}</h3>
            </div>
            <Badge tone="success">{characters.length} {text.character.toLowerCase()}</Badge>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-[0.18em] text-muted">
                  <th className="py-3 pr-4 font-medium">{text.character}</th>
                  <th className="px-4 py-3 font-medium">{text.alias}</th>
                  <th className="px-4 py-3 font-medium">{text.status}</th>
                  <th className="py-3 pl-4 text-right font-medium">{text.action}</th>
                </tr>
              </thead>
              <tbody>
                {characters.map((character) => (
                  <tr key={character.id} className="border-b border-line/70 last:border-0">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-4 rounded-full border border-black/10"
                          style={{ backgroundColor: character.color }}
                        />
                        <span className="font-semibold text-ink">{character.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted">{character.alias ?? text.noAlias}</td>
                    <td className="px-4 py-4">
                      <Badge>{character.status}</Badge>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <Link
                        href={`/projects/${projectId}/characters/${character.id}`}
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
