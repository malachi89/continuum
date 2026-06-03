import {
  createHairstyleAction,
  createMakeupAction,
  createPropAction,
  createWardrobeAction,
  deleteHairstyleAction,
  deleteMakeupAction,
  deletePropAction,
  deleteWardrobeAction,
  updateHairstyleAction,
  updateMakeupAction,
  updatePropAction,
  updateWardrobeAction,
} from "@/app/(app)/projects/production-actions";
import { MvpCatalogForm } from "@/components/forms/MvpCatalogForm";
import { PropForm } from "@/components/forms/PropForm";
import { CatalogDeleteForm } from "@/components/production/CatalogDeleteForm";
import { Badge } from "@/components/ui/Badge";
import { getOwnedProject } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";
import { getOwnedProjectProductionCatalog } from "@/lib/production/queries";

const copy = {
  es: {
    title: "Produccion",
    description:
      "Centraliza props reutilizables y estados visuales para luego asignarlos por escena.",
    props: "Props",
    makeup: "Maquillaje",
    wardrobe: "Vestuario",
    hairstyles: "Peinado",
    createProp: "Crear prop",
    createItem: "Crear item",
    save: "Guardar",
    usage: "usos",
    noDescription: "Sin descripcion.",
    category: "Categoria",
    eventAssignments: "escena",
    characterAssignments: "personaje",
  },
  en: {
    title: "Production",
    description:
      "Centralize reusable props and visual states before assigning them per scene.",
    props: "Props",
    makeup: "Makeup",
    wardrobe: "Wardrobe",
    hairstyles: "Hairstyle",
    createProp: "Create prop",
    createItem: "Create item",
    save: "Save",
    usage: "uses",
    noDescription: "No description.",
    category: "Category",
    eventAssignments: "scene",
    characterAssignments: "character",
  },
} as const;

export default async function ProjectProductionPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [project, catalog, language] = await Promise.all([
    getOwnedProject(projectId),
    getOwnedProjectProductionCatalog(projectId),
    getServerLanguage(),
  ]);
  const text = copy[language];
  const redirectTo = `/projects/${projectId}/production`;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">{text.title}</p>
            <h3 className="mt-3 text-2xl font-semibold">{project.title}</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{text.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{catalog.props.length} {text.props}</Badge>
            <Badge>{catalog.makeup.length} {text.makeup}</Badge>
            <Badge>{catalog.wardrobe.length} {text.wardrobe}</Badge>
            <Badge tone="success">{catalog.hairstyles.length} {text.hairstyles}</Badge>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">{text.props}</p>
          <h3 className="mt-3 text-xl font-semibold">{text.createProp}</h3>
          <div className="mt-5">
            <PropForm
              action={createPropAction}
              submitLabel={text.createProp}
              projectId={projectId}
              redirectTo={redirectTo}
            />
          </div>
        </div>

        <div className="space-y-4">
          {catalog.props.map((item) => (
            <details key={item.id} className="rounded-[24px] border border-line bg-surface p-5">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold">{item.name}</h4>
                    <p className="mt-1 text-sm text-muted">{item.description ?? text.noDescription}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.category ? <Badge>{text.category}: {item.category}</Badge> : null}
                    <Badge>{item.eventCount} {text.eventAssignments}</Badge>
                    <Badge>{item.characterCount} {text.characterAssignments}</Badge>
                  </div>
                </div>
              </summary>
              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto]">
                <PropForm
                  action={updatePropAction}
                  submitLabel={text.save}
                  projectId={projectId}
                  redirectTo={redirectTo}
                  initialValues={item}
                />
                <CatalogDeleteForm
                  action={deletePropAction}
                  itemId={item.id}
                  projectId={projectId}
                  redirectTo={redirectTo}
                />
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">{text.makeup}</p>
          <h3 className="text-xl font-semibold">{text.createItem}</h3>
          <MvpCatalogForm
            action={createMakeupAction}
            submitLabel={text.createItem}
            projectId={projectId}
            redirectTo={redirectTo}
          />
          <div className="space-y-4">
            {catalog.makeup.map((item) => (
              <details key={item.id} className="rounded-[22px] border border-line bg-canvas/45 p-4">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="mt-1 text-sm text-muted">{item.description ?? text.noDescription}</p>
                    </div>
                    <Badge>{item.assignmentCount} {text.usage}</Badge>
                  </div>
                </summary>
                <div className="mt-4 space-y-4">
                  <MvpCatalogForm
                    action={updateMakeupAction}
                    submitLabel={text.save}
                    projectId={projectId}
                    redirectTo={redirectTo}
                    initialValues={item}
                  />
                  <CatalogDeleteForm
                    action={deleteMakeupAction}
                    itemId={item.id}
                    projectId={projectId}
                    redirectTo={redirectTo}
                  />
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">{text.wardrobe}</p>
          <h3 className="text-xl font-semibold">{text.createItem}</h3>
          <MvpCatalogForm
            action={createWardrobeAction}
            submitLabel={text.createItem}
            projectId={projectId}
            redirectTo={redirectTo}
          />
          <div className="space-y-4">
            {catalog.wardrobe.map((item) => (
              <details key={item.id} className="rounded-[22px] border border-line bg-canvas/45 p-4">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="mt-1 text-sm text-muted">{item.description ?? text.noDescription}</p>
                    </div>
                    <Badge>{item.assignmentCount} {text.usage}</Badge>
                  </div>
                </summary>
                <div className="mt-4 space-y-4">
                  <MvpCatalogForm
                    action={updateWardrobeAction}
                    submitLabel={text.save}
                    projectId={projectId}
                    redirectTo={redirectTo}
                    initialValues={item}
                  />
                  <CatalogDeleteForm
                    action={deleteWardrobeAction}
                    itemId={item.id}
                    projectId={projectId}
                    redirectTo={redirectTo}
                  />
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">{text.hairstyles}</p>
          <h3 className="text-xl font-semibold">{text.createItem}</h3>
          <MvpCatalogForm
            action={createHairstyleAction}
            submitLabel={text.createItem}
            projectId={projectId}
            redirectTo={redirectTo}
          />
          <div className="space-y-4">
            {catalog.hairstyles.map((item) => (
              <details key={item.id} className="rounded-[22px] border border-line bg-canvas/45 p-4">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="mt-1 text-sm text-muted">{item.description ?? text.noDescription}</p>
                    </div>
                    <Badge>{item.assignmentCount} {text.usage}</Badge>
                  </div>
                </summary>
                <div className="mt-4 space-y-4">
                  <MvpCatalogForm
                    action={updateHairstyleAction}
                    submitLabel={text.save}
                    projectId={projectId}
                    redirectTo={redirectTo}
                    initialValues={item}
                  />
                  <CatalogDeleteForm
                    action={deleteHairstyleAction}
                    itemId={item.id}
                    projectId={projectId}
                    redirectTo={redirectTo}
                  />
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
