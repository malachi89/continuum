import type { TranslationKey } from "@/lib/i18n/dictionary";

export type NavigationItem = {
  href: string;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  shortLabel: string;
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/projects",
    labelKey: "projects",
    descriptionKey: "projectsDescription",
    shortLabel: "P01",
  },
  {
    href: "/characters",
    labelKey: "characters",
    descriptionKey: "charactersDescription",
    shortLabel: "C02",
  },
  {
    href: "/locations",
    labelKey: "locations",
    descriptionKey: "locationsDescription",
    shortLabel: "L03",
  },
  {
    href: "/events",
    labelKey: "events",
    descriptionKey: "eventsDescription",
    shortLabel: "E04",
  },
  {
    href: "/timeline",
    labelKey: "timeline",
    descriptionKey: "timelineDescription",
    shortLabel: "T05",
  },
  {
    href: "/analysis",
    labelKey: "analysis",
    descriptionKey: "analysisDescription",
    shortLabel: "A06",
  },
];
