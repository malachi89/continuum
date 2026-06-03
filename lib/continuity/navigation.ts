import type { TranslationKey } from "@/lib/i18n/dictionary";

export type NavigationItem = {
  href: string;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/projects",
    labelKey: "projects",
    descriptionKey: "projectsDescription",
  },
  {
    href: "/characters",
    labelKey: "characters",
    descriptionKey: "charactersDescription",
  },
  {
    href: "/locations",
    labelKey: "locations",
    descriptionKey: "locationsDescription",
  },
  {
    href: "/events",
    labelKey: "events",
    descriptionKey: "eventsDescription",
  },
  {
    href: "/production",
    labelKey: "production",
    descriptionKey: "productionDescription",
  },
  {
    href: "/timeline",
    labelKey: "timeline",
    descriptionKey: "timelineDescription",
  },
  {
    href: "/analysis",
    labelKey: "analysis",
    descriptionKey: "analysisDescription",
  },
];
