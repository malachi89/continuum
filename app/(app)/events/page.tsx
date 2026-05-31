import { ProjectRoutePicker } from "@/components/projects/ProjectRoutePicker";
import { getOwnedProjects } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    title: "Eventos",
    description:
      "Selecciona el proyecto donde quieres crear, editar y vincular eventos con personajes.",
    sectionLabel: "Ruta",
    emptyEyebrow: "PICK",
    emptyTitle: "Primero crea un proyecto",
    emptyBody:
      "Estas vistas trabajan dentro del contexto de un proyecto. Apenas tengas uno, podras entrar directo a sus personajes, locaciones o eventos.",
    emptyActionLabel: "Ir a proyectos",
  },
  en: {
    title: "Events",
    description:
      "Select the project where you want to create, edit, and link events to characters.",
    sectionLabel: "Route",
    emptyEyebrow: "PICK",
    emptyTitle: "Create a project first",
    emptyBody:
      "These views work inside a project context. Once you have one, you can jump straight into its characters, locations, or events.",
    emptyActionLabel: "Go to projects",
  },
} as const;

export default async function EventsPage() {
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
      routeSuffix="/events"
      projects={projects}
    />
  );
}
