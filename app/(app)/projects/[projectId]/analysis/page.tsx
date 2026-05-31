import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { analyzeProjectContinuity } from "@/lib/continuity/analyze";
import { getOwnedAnalyzableProject } from "@/lib/continuity/data";

type SearchParams = Promise<{
  severity?: string;
}>;

export default async function ProjectAnalysisPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: SearchParams;
}) {
  const { projectId } = await params;
  const { severity } = await searchParams;
  const project = await getOwnedAnalyzableProject(projectId);
  const results = analyzeProjectContinuity(project);
  const severityFilter =
    severity === "ERROR" || severity === "WARNING" || severity === "NOTE"
      ? severity
      : "ALL";
  const filteredResults =
    severityFilter === "ALL"
      ? results
      : results.filter((result) => result.severity === severityFilter);

  const counts = {
    ERROR: results.filter((result) => result.severity === "ERROR").length,
    WARNING: results.filter((result) => result.severity === "WARNING").length,
    NOTE: results.filter((result) => result.severity === "NOTE").length,
  };

  const characterMap = new Map(project.characters.map((character) => [character.id, character]));
  const eventMap = new Map(project.events.map((event) => [event.id, event]));

  if (results.length === 0) {
    return (
      <EmptyState
        eyebrow="AN"
        title="No encontramos inconsistencias"
        body={`El proyecto ${project.title} no generó errores, advertencias ni notas con las reglas actuales.`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          Análisis
        </p>
        <h3 className="mt-3 text-2xl font-semibold">Motor de continuidad de {project.title}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          El motor corre fuera de Prisma y Next sobre datos serializables, para detectar
          errores duros, advertencias editoriales y notas de seguimiento.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="accent">{counts.ERROR} errores</Badge>
          <Badge>{counts.WARNING} advertencias</Badge>
          <Badge tone="success">{counts.NOTE} notas</Badge>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/projects/${projectId}/analysis`}>
            <Button variant={severityFilter === "ALL" ? "primary" : "secondary"}>Todos</Button>
          </Link>
          <Link href={`/projects/${projectId}/analysis?severity=ERROR`}>
            <Button variant={severityFilter === "ERROR" ? "primary" : "secondary"}>Errores</Button>
          </Link>
          <Link href={`/projects/${projectId}/analysis?severity=WARNING`}>
            <Button variant={severityFilter === "WARNING" ? "primary" : "secondary"}>Advertencias</Button>
          </Link>
          <Link href={`/projects/${projectId}/analysis?severity=NOTE`}>
            <Button variant={severityFilter === "NOTE" ? "primary" : "secondary"}>Notas</Button>
          </Link>
        </div>
      </section>

      <div className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-line">
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted">
              <th className="px-5 py-4 font-normal">Severidad</th>
              <th className="px-5 py-4 font-normal">Código</th>
              <th className="px-5 py-4 font-normal">Explicación</th>
              <th className="px-5 py-4 font-normal">Personaje</th>
              <th className="px-5 py-4 font-normal">Eventos</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, index) => {
              const character = result.characterId ? characterMap.get(result.characterId) : null;

              return (
                <tr key={`${result.code}-${result.eventIds.join("-")}`} className={index !== filteredResults.length - 1 ? "border-b border-line/50" : undefined}>
                  <td className="px-5 py-4">
                    <Badge
                      tone={
                        result.severity === "ERROR"
                          ? "accent"
                          : result.severity === "WARNING"
                            ? "default"
                            : "success"
                      }
                    >
                      {result.severity}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                    {result.code}
                  </td>
                  <td className="px-5 py-4 text-ink">{result.explanation}</td>
                  <td className="px-5 py-4">
                    {character ? (
                      <Link href={`/projects/${projectId}/characters/${character.id}`}>
                        <Button variant="secondary" className="text-xs">
                          {character.name}
                        </Button>
                      </Link>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {result.eventIds.map((eventId) => {
                        const event = eventMap.get(eventId);
                        if (!event) return null;

                        return (
                          <Link key={eventId} href={`/projects/${projectId}/events`}>
                            <Badge>{event.title}</Badge>
                          </Link>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
