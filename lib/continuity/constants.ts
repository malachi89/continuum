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
  { href: "", labelKey: "overview" },
  { href: "/characters", labelKey: "characters" },
  { href: "/locations", labelKey: "locations" },
  { href: "/events", labelKey: "events" },
  { href: "/timeline", labelKey: "timeline" },
  { href: "/analysis", labelKey: "analysis" },
] as const;

export type ProjectSectionLink = {
  href: string;
  labelKey: TranslationKey;
};
