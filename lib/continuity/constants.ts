import {
  CharacterStatus,
  EventType,
  LocationType,
  ProjectType,
} from "@prisma/client";
import type { TranslationKey } from "@/lib/i18n/dictionary";

export const projectTypeOptions = Object.values(ProjectType);
export const characterStatusOptions = Object.values(CharacterStatus);
export const locationTypeOptions = Object.values(LocationType);
export const eventTypeOptions = Object.values(EventType);

export const projectSectionLinks = [
  { href: "", labelKey: "overview", shortLabel: "OV" },
  { href: "/characters", labelKey: "characters", shortLabel: "CH" },
  { href: "/locations", labelKey: "locations", shortLabel: "LO" },
  { href: "/events", labelKey: "events", shortLabel: "EV" },
  { href: "/timeline", labelKey: "timeline", shortLabel: "TL" },
  { href: "/analysis", labelKey: "analysis", shortLabel: "AN" },
] as const;

export type ProjectSectionLink = {
  href: string;
  labelKey: TranslationKey;
  shortLabel: string;
};
