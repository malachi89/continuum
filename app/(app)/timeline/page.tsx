import { ProjectRoutePicker } from "@/components/projects/ProjectRoutePicker";
import { getOwnedProjects } from "@/lib/continuity/data";

export default async function TimelinePage() {
  const projects = await getOwnedProjects();

  return (
    <ProjectRoutePicker
      title="Línea de tiempo"
      description="Selecciona un proyecto para abrir la vista temporal, aplicar filtros y asignar personajes a eventos mediante arrastrar y soltar."
      routeSuffix="/timeline"
      projects={projects}
    />
  );
}
