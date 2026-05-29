import { ProjectRoutePicker } from "@/components/projects/ProjectRoutePicker";
import { getOwnedProjects } from "@/lib/continuity/data";

export default async function AnalysisPage() {
  const projects = await getOwnedProjects();

  return (
    <ProjectRoutePicker
      title="Analisis"
      description="Selecciona un proyecto para correr el motor de continuidad y revisar errores, warnings y notas editoriales."
      routeSuffix="/analysis"
      projects={projects}
    />
  );
}
