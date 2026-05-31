import { ProjectRoutePicker } from "@/components/projects/ProjectRoutePicker";
import { getOwnedProjects } from "@/lib/continuity/data";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    title: "Personajes",
    description:
      "Elige el proyecto donde quieres crear, editar o borrar personajes. Cada pantalla verifica ownership antes de tocar datos.",
    sectionLabel: "Ruta",
    emptyEyebrow: "PICK",
    emptyTitle: "Primero crea un proyecto",
    emptyBody:
      "Estas vistas trabajan dentro del contexto de un proyecto. Apenas tengas uno, podras entrar directo a sus personajes, locaciones o eventos.",
    emptyActionLabel: "Ir a proyectos",
  },
  en: {
    title: "Characters",
    description:
      "Choose the project where you want to create, edit, or delete characters. Each screen checks ownership before touching data.",
    sectionLabel: "Route",
    emptyEyebrow: "PICK",
    emptyTitle: "Create a project first",
    emptyBody:
      "These views work inside a project context. Once you have one, you can jump straight into its characters, locations, or events.",
    emptyActionLabel: "Go to projects",
  },
} as const;

export default async function CharactersPage() {
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
      routeSuffix="/characters"
      projects={projects}
    />
  );
}
