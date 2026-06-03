import Link from "next/link";
import { CharacterMvpPanel } from "@/components/production/CharacterMvpPanel";
import { EventPropsPanel } from "@/components/production/EventPropsPanel";
import { Badge } from "@/components/ui/Badge";
import { getServerLanguage } from "@/lib/i18n/server";
import { getOwnedEventProductionContext } from "@/lib/production/queries";

const copy = {
  es: {
    title: "Produccion por escena",
    back: "Volver al evento",
    noCharacters: "Este evento no tiene personajes vinculados todavia.",
  },
  en: {
    title: "Scene production",
    back: "Back to event",
    noCharacters: "This event has no linked characters yet.",
  },
} as const;

function formatDate(value: Date, language: "es" | "en") {
  return new Intl.DateTimeFormat(language === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function EventProductionPage({
  params,
}: {
  params: Promise<{ projectId: string; eventId: string }>;
}) {
  const { projectId, eventId } = await params;
  const language = await getServerLanguage();
  const text = copy[language];
  const { event, catalog, production } = await getOwnedEventProductionContext(projectId, eventId);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">{text.title}</p>
            <h3 className="mt-3 text-2xl font-semibold">{event.title}</h3>
            <p className="mt-3 text-sm text-muted">
              {event.project.title} · {formatDate(event.internalStart, language)} {"->"}{" "}
              {formatDate(event.internalEnd, language)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{event.eventType}</Badge>
            <Badge>{production.sceneProps.length} props</Badge>
            <Badge tone="success">{production.characters.length} cast</Badge>
          </div>
        </div>

        <div className="mt-5">
          <Link
            href={`/projects/${projectId}/events/${eventId}`}
            className="inline-flex items-center justify-center rounded-full border border-line bg-canvas/70 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:bg-surface"
          >
            {text.back}
          </Link>
        </div>
      </section>

      <EventPropsPanel
        projectId={projectId}
        eventId={eventId}
        language={language}
        propsCatalog={catalog.props.map((item) => ({ id: item.id, name: item.name }))}
        sceneProps={production.sceneProps}
      />

      {production.characters.length === 0 ? (
        <section className="rounded-[28px] border border-line bg-surface p-6">
          <p className="text-sm text-muted">{text.noCharacters}</p>
        </section>
      ) : (
        <section className="grid gap-6">
          {production.characters.map((character) => (
            <CharacterMvpPanel
              key={character.characterId}
              projectId={projectId}
              eventId={eventId}
              characterId={character.characterId}
              characterName={character.characterName}
              characterColor={character.characterColor}
              language={language}
              visual={character.visual}
              propsCatalog={catalog.props.map((item) => ({ id: item.id, name: item.name }))}
              makeupCatalog={catalog.makeup.map((item) => ({ id: item.id, name: item.name }))}
              wardrobeCatalog={catalog.wardrobe.map((item) => ({ id: item.id, name: item.name }))}
              hairstylesCatalog={catalog.hairstyles.map((item) => ({ id: item.id, name: item.name }))}
            />
          ))}
        </section>
      )}
    </div>
  );
}
