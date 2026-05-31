import { ProjectRoutePicker } from "@/components/projects/ProjectRoutePicker";
import { getOwnedProjects } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    title: "Importar / exportar",
    description:
      "Selecciona un proyecto para ver su JSON portable o crear una copia nueva desde un paquete válido.",
    sectionLabel: "Ruta",
    emptyEyebrow: "PICK",
    emptyTitle: "Primero crea un proyecto",
    emptyBody:
      "Estas vistas trabajan dentro del contexto de un proyecto. Apenas tengas uno, podras entrar directo a sus personajes, locaciones o eventos.",
    emptyActionLabel: "Ir a proyectos",
  },
  en: {
    title: "Export / import",
    description:
      "Select a project to view its portable JSON or create a new copy from a valid bundle.",
    sectionLabel: "Route",
    emptyEyebrow: "PICK",
    emptyTitle: "Create a project first",
    emptyBody:
      "These views work inside a project context. Once you have one, you can jump straight into its characters, locations, or events.",
    emptyActionLabel: "Go to projects",
  },
} as const;

export default async function DataTransferPage() {
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
      routeSuffix="/import-export"
      projects={projects}
    />
  );
}
