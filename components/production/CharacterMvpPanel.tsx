import {
  assignMvpToCharacterAction,
  assignPropToCharacterAction,
  removeMvpFromCharacterAction,
  removePropFromCharacterAction,
} from "@/app/(app)/projects/production-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { AssignmentChip, CharacterVisualState } from "@/lib/production/types";

const copy = {
  es: {
    props: "Props",
    makeup: "Maquillaje",
    wardrobe: "Vestuario",
    hairstyles: "Peinado",
    notes: "Notas",
    add: "Agregar",
    remove: "Quitar",
    pickProp: "Selecciona un prop",
    pickItem: "Selecciona un item",
    noItems: "Sin asignaciones.",
  },
  en: {
    props: "Props",
    makeup: "Makeup",
    wardrobe: "Wardrobe",
    hairstyles: "Hairstyle",
    notes: "Notes",
    add: "Add",
    remove: "Remove",
    pickProp: "Pick a prop",
    pickItem: "Pick an item",
    noItems: "No assignments.",
  },
} as const;

function AssignmentList({
  items,
  emptyLabel,
  removeForm,
}: {
  items: AssignmentChip[];
  emptyLabel: string;
  removeForm: (item: AssignmentChip) => React.ReactNode;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-canvas/60 px-3 py-3 text-sm text-muted">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <article
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-canvas/55 px-3 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">{item.name}</p>
            {item.notes ? <p className="mt-1 text-sm text-muted">{item.notes}</p> : null}
          </div>
          {removeForm(item)}
        </article>
      ))}
    </div>
  );
}

function AssignmentComposer({
  action,
  projectId,
  eventId,
  characterId,
  selectName,
  selectPlaceholder,
  items,
  type,
  notesLabel,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  projectId: string;
  eventId: string;
  characterId: string;
  selectName: "propId" | "itemId";
  selectPlaceholder: string;
  items: Array<{ id: string; name: string }>;
  type?: "makeup" | "wardrobe" | "hairstyle";
  notesLabel: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-3 md:grid-cols-[1.1fr_1fr_auto]">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="characterId" value={characterId} />
      {type ? <input type="hidden" name="type" value={type} /> : null}
      <Select name={selectName} defaultValue="">
        <option value="">{selectPlaceholder}</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>
      <Input name="notes" placeholder={notesLabel} />
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}

export function CharacterMvpPanel({
  projectId,
  eventId,
  characterId,
  characterName,
  characterColor,
  language,
  visual,
  propsCatalog,
  makeupCatalog,
  wardrobeCatalog,
  hairstylesCatalog,
}: {
  projectId: string;
  eventId: string;
  characterId: string;
  characterName: string;
  characterColor: string;
  language: "es" | "en";
  visual: CharacterVisualState;
  propsCatalog: Array<{ id: string; name: string }>;
  makeupCatalog: Array<{ id: string; name: string }>;
  wardrobeCatalog: Array<{ id: string; name: string }>;
  hairstylesCatalog: Array<{ id: string; name: string }>;
}) {
  const text = copy[language];

  return (
    <section className="rounded-[24px] border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <span
          className="h-4 w-4 rounded-full border border-black/10"
          style={{ backgroundColor: characterColor }}
        />
        <h3 className="text-lg font-semibold">{characterName}</h3>
      </div>

      <div className="mt-4 space-y-5">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-ink">{text.props}</h4>
          <AssignmentComposer
            action={assignPropToCharacterAction}
            projectId={projectId}
            eventId={eventId}
            characterId={characterId}
            selectName="propId"
            selectPlaceholder={text.pickProp}
            items={propsCatalog}
            notesLabel={text.notes}
            submitLabel={text.add}
          />
          <AssignmentList
            items={visual.props}
            emptyLabel={text.noItems}
            removeForm={(item) => (
              <form action={removePropFromCharacterAction}>
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="characterId" value={characterId} />
                <input type="hidden" name="propId" value={item.id} />
                <Button type="submit" variant="secondary">
                  {text.remove}
                </Button>
              </form>
            )}
          />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-ink">{text.makeup}</h4>
          <AssignmentComposer
            action={assignMvpToCharacterAction}
            projectId={projectId}
            eventId={eventId}
            characterId={characterId}
            selectName="itemId"
            selectPlaceholder={text.pickItem}
            items={makeupCatalog}
            type="makeup"
            notesLabel={text.notes}
            submitLabel={text.add}
          />
          <AssignmentList
            items={visual.makeup}
            emptyLabel={text.noItems}
            removeForm={(item) => (
              <form action={removeMvpFromCharacterAction}>
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="characterId" value={characterId} />
                <input type="hidden" name="type" value="makeup" />
                <input type="hidden" name="itemId" value={item.id} />
                <Button type="submit" variant="secondary">
                  {text.remove}
                </Button>
              </form>
            )}
          />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-ink">{text.wardrobe}</h4>
          <AssignmentComposer
            action={assignMvpToCharacterAction}
            projectId={projectId}
            eventId={eventId}
            characterId={characterId}
            selectName="itemId"
            selectPlaceholder={text.pickItem}
            items={wardrobeCatalog}
            type="wardrobe"
            notesLabel={text.notes}
            submitLabel={text.add}
          />
          <AssignmentList
            items={visual.wardrobe}
            emptyLabel={text.noItems}
            removeForm={(item) => (
              <form action={removeMvpFromCharacterAction}>
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="characterId" value={characterId} />
                <input type="hidden" name="type" value="wardrobe" />
                <input type="hidden" name="itemId" value={item.id} />
                <Button type="submit" variant="secondary">
                  {text.remove}
                </Button>
              </form>
            )}
          />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-ink">{text.hairstyles}</h4>
          <AssignmentComposer
            action={assignMvpToCharacterAction}
            projectId={projectId}
            eventId={eventId}
            characterId={characterId}
            selectName="itemId"
            selectPlaceholder={text.pickItem}
            items={hairstylesCatalog}
            type="hairstyle"
            notesLabel={text.notes}
            submitLabel={text.add}
          />
          <AssignmentList
            items={visual.hairstyles}
            emptyLabel={text.noItems}
            removeForm={(item) => (
              <form action={removeMvpFromCharacterAction}>
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="characterId" value={characterId} />
                <input type="hidden" name="type" value="hairstyle" />
                <input type="hidden" name="itemId" value={item.id} />
                <Button type="submit" variant="secondary">
                  {text.remove}
                </Button>
              </form>
            )}
          />
        </div>
      </div>
    </section>
  );
}
