import {
  CharacterStatus,
  EventType,
  LocationType,
  ProjectType,
} from "@prisma/client";

export const projectTypeOptions = Object.values(ProjectType);
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
] as const;
