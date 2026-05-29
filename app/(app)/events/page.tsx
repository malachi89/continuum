import { ProjectRoutePicker } from "@/components/projects/ProjectRoutePicker";
import { getOwnedProjects } from "@/lib/continuity/data";

export default async function EventsPage() {
  const projects = await getOwnedProjects();

  return (
    <ProjectRoutePicker
      title="Eventos"
      description="Selecciona el proyecto donde quieres abrir el editor rapido de eventos y sus relaciones con personajes."
      routeSuffix="/events"
      projects={projects}
    />
  );
}
