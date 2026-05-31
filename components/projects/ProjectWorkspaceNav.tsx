"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { projectSectionLinks } from "@/lib/continuity/constants";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function ProjectWorkspaceNav({
  projectId,
}: {
  projectId: string;
}) {
  const currentPath = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="flex flex-wrap gap-2">
      {projectSectionLinks.map((item) => {
        const href = `/projects/${projectId}${item.href}`;
        const active =
          item.href === ""
            ? currentPath === href
            : currentPath === href || currentPath.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition",
              active
                ? "border-accent bg-accent text-white"
                : "border-line bg-canvas/70 text-ink hover:border-accent hover:bg-surface",
            )}
          >
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
