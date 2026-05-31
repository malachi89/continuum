import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { analyzeProjectContinuity } from "@/lib/continuity/analyze";
import { getOwnedAnalyzableProject } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

type SearchParams = Promise<{
  severity?: string;
}>;

const copy = {
  es: {
    noIssuesTitle: "No encontramos inconsistencias",
    noIssuesBody: (projectTitle: string) =>
      `El proyecto ${projectTitle} no generó errores, advertencias ni notas con las reglas actuales.`,
    analysis: "Análisis",
    engineTitle: (projectTitle: string) => `Motor de continuidad de ${projectTitle}`,
    engineBody:
      "El motor corre fuera de Prisma y Next sobre datos serializables, para detectar errores duros, advertencias editoriales y notas de seguimiento.",
    errors: "errores",
    warnings: "advertencias",
    notes: "notas",
    all: "Todos",
    error: "Errores",
    warning: "Advertencias",
    note: "Notas",
    severity: "Severidad",
    code: "Código",
    explanation: "Explicación",
    character: "Personaje",
    events: "Eventos",
  },
  en: {
    noIssuesTitle: "We found no inconsistencies",
    noIssuesBody: (projectTitle: string) =>
      `The project ${projectTitle} produced no errors, warnings, or notes with the current rules.`,
    analysis: "Analysis",
    engineTitle: (projectTitle: string) => `Continuity engine for ${projectTitle}`,
    engineBody:
      "The engine runs outside Prisma and Next on serializable data to detect hard errors, editorial warnings, and follow-up notes.",
    errors: "errors",
    warnings: "warnings",
    notes: "notes",
    all: "All",
    error: "Errors",
    warning: "Warnings",
    note: "Notes",
    severity: "Severity",
    code: "Code",
    explanation: "Explanation",
    character: "Character",
    events: "Events",
  },
} as const;

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
  const language = await getServerLanguage();
  const text = copy[language];
  const results = analyzeProjectContinuity(project, language);
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
        title={text.noIssuesTitle}
        body={text.noIssuesBody(project.title)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          {text.analysis}
        </p>
        <h3 className="mt-3 text-2xl font-semibold">{text.engineTitle(project.title)}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{text.engineBody}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="accent">{counts.ERROR} {text.errors}</Badge>
          <Badge>{counts.WARNING} {text.warnings}</Badge>
          <Badge tone="success">{counts.NOTE} {text.notes}</Badge>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/projects/${projectId}/analysis`}>
            <Button variant={severityFilter === "ALL" ? "primary" : "secondary"}>{text.all}</Button>
          </Link>
          <Link href={`/projects/${projectId}/analysis?severity=ERROR`}>
            <Button variant={severityFilter === "ERROR" ? "primary" : "secondary"}>{text.error}</Button>
          </Link>
          <Link href={`/projects/${projectId}/analysis?severity=WARNING`}>
            <Button variant={severityFilter === "WARNING" ? "primary" : "secondary"}>{text.warning}</Button>
          </Link>
          <Link href={`/projects/${projectId}/analysis?severity=NOTE`}>
            <Button variant={severityFilter === "NOTE" ? "primary" : "secondary"}>{text.note}</Button>
          </Link>
        </div>
      </section>

      <div className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-line">
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted">
              <th className="px-5 py-4 font-normal">{text.severity}</th>
              <th className="px-5 py-4 font-normal">{text.code}</th>
              <th className="px-5 py-4 font-normal">{text.explanation}</th>
              <th className="px-5 py-4 font-normal">{text.character}</th>
              <th className="px-5 py-4 font-normal">{text.events}</th>
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
