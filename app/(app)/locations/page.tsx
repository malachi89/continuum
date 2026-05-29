import { ProjectRoutePicker } from "@/components/projects/ProjectRoutePicker";
import { getOwnedProjects } from "@/lib/continuity/data";

export default async function LocationsPage() {
  const projects = await getOwnedProjects();

  return (
    <ProjectRoutePicker
      title="Locaciones"
      description="Selecciona un proyecto para trabajar sus lugares, coordenadas opcionales y notas espaciales."
      routeSuffix="/locations"
      projects={projects}
    />
  );
}
