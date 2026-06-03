import {
  assignPropToEventAction,
  removePropFromEventAction,
} from "@/app/(app)/projects/production-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { AssignmentChip } from "@/lib/production/types";

const copy = {
  es: {
    title: "Props de escena",
    empty: "Sin props de escena todavia.",
    add: "Agregar prop",
    notes: "Notas",
    remove: "Quitar",
    pickOne: "Selecciona un prop",
  },
  en: {
    title: "Scene props",
    empty: "No scene props yet.",
    add: "Add prop",
    notes: "Notes",
    remove: "Remove",
    pickOne: "Pick a prop",
  },
} as const;

export function EventPropsPanel({
  projectId,
  eventId,
  language,
  propsCatalog,
  sceneProps,
}: {
  projectId: string;
  eventId: string;
  language: "es" | "en";
  propsCatalog: Array<{ id: string; name: string }>;
  sceneProps: AssignmentChip[];
}) {
  const text = copy[language];

  return (
    <section className="rounded-[24px] border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{text.title}</h3>
        <span className="rounded-full border border-line bg-canvas px-3 py-1 text-xs text-muted">
          {sceneProps.length}
        </span>
      </div>

      <form action={assignPropToEventAction} className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="eventId" value={eventId} />
        <Select name="propId" defaultValue="">
          <option value="">{text.pickOne}</option>
          {propsCatalog.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Input name="notes" placeholder={text.notes} />
        <Button type="submit">{text.add}</Button>
      </form>

      <div className="mt-4 space-y-3">
        {sceneProps.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-canvas/60 px-4 py-3 text-sm text-muted">
            {text.empty}
          </p>
        ) : (
          sceneProps.map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-canvas/55 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{item.name}</p>
                {item.notes ? <p className="mt-1 text-sm text-muted">{item.notes}</p> : null}
              </div>

              <form action={removePropFromEventAction}>
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="propId" value={item.id} />
                <Button type="submit" variant="secondary">
                  {text.remove}
                </Button>
              </form>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
