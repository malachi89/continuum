import { ProjectRoutePicker } from "@/components/projects/ProjectRoutePicker";
import { getOwnedProjects } from "@/lib/continuity/data";

export default async function DataTransferPage() {
  const projects = await getOwnedProjects();

  return (
    <ProjectRoutePicker
      title="Importar / exportar"
      description="Selecciona un proyecto para ver su JSON portable o crear una copia nueva desde un bundle valido."
      routeSuffix="/import-export"
      projects={projects}
    />
  );
}
