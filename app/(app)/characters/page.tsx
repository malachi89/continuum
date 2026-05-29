import { ProjectRoutePicker } from "@/components/projects/ProjectRoutePicker";
import { getOwnedProjects } from "@/lib/continuity/data";

export default async function CharactersPage() {
  const projects = await getOwnedProjects();

  return (
    <ProjectRoutePicker
      title="Personajes"
      description="Elige el proyecto donde quieres crear, editar o borrar personajes. Cada pantalla verifica ownership antes de tocar datos."
      routeSuffix="/characters"
      projects={projects}
    />
  );
}
