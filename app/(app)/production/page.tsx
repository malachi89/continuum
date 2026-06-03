import { ProjectRoutePicker } from "@/components/projects/ProjectRoutePicker";
import { getOwnedProjects } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    title: "Produccion",
    description:
      "Elige el proyecto donde quieres mantener catalogos de props, maquillaje, vestuario y peinado.",
    sectionLabel: "Ruta",
    emptyEyebrow: "PICK",
    emptyTitle: "Primero crea un proyecto",
    emptyBody:
      "La gestion de produccion vive dentro del contexto de cada proyecto para respetar ownership y reutilizacion de catalogos.",
    emptyActionLabel: "Ir a proyectos",
  },
  en: {
    title: "Production",
    description:
      "Choose the project where you want to manage prop, makeup, wardrobe, and hairstyle catalogs.",
    sectionLabel: "Route",
    emptyEyebrow: "PICK",
    emptyTitle: "Create a project first",
    emptyBody:
      "Production management lives inside each project context so ownership and catalog reuse stay consistent.",
    emptyActionLabel: "Go to projects",
  },
} as const;

export default async function ProductionPage() {
  const projects = await getOwnedProjects();
  const language = await getServerLanguage();
  const text = copy[language];

  return (
    <ProjectRoutePicker
      title={text.title}
      description={text.description}
      sectionLabel={text.sectionLabel}
      emptyEyebrow={text.emptyEyebrow}
      emptyTitle={text.emptyTitle}
      emptyBody={text.emptyBody}
      emptyActionLabel={text.emptyActionLabel}
      routeSuffix="/production"
      projects={projects}
    />
  );
}
