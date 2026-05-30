import {
  CharacterStatus,
  EventType,
  LocationType,
  ProjectType,
  TravelMode,
} from "@prisma/client";

export const projectTypeOptions = Object.values(ProjectType);
export const travelModeOptions = Object.values(TravelMode);
export const characterStatusOptions = Object.values(CharacterStatus);
export const locationTypeOptions = Object.values(LocationType);
export const eventTypeOptions = Object.values(EventType);

export const projectSectionLinks = [
  { href: "", label: "Resumen", shortLabel: "OV" },
  { href: "/characters", label: "Personajes", shortLabel: "CH" },
  { href: "/locations", label: "Locaciones", shortLabel: "LO" },
  { href: "/events", label: "Eventos", shortLabel: "EV" },
  { href: "/timeline", label: "Línea de tiempo", shortLabel: "TL" },
  { href: "/analysis", label: "Análisis", shortLabel: "AN" },
  { href: "/import-export", label: "Importar / exportar", shortLabel: "IO" },
] as const;
