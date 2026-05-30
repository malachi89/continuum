import { ProjectRoutePicker } from "@/components/projects/ProjectRoutePicker";
import { getOwnedProjects } from "@/lib/continuity/data";

export default async function TimelinePage() {
  const projects = await getOwnedProjects();

  return (
    <ProjectRoutePicker
      title="Línea de tiempo"
      routeSuffix="/timeline"
      projects={projects}
    />
  );
}
