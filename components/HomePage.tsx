"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { navigationItems } from "@/lib/continuity/navigation";

export function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {t("workspace")}
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">
            {t("homeTitle")}
          </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            {t("homeDescription")}
          </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent"
          >
            {t("openProjects")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {t("modules")}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
              {t("moduleGridTitle")}
            </h3>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted">
            {t("moduleGridBody")}
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[24px] border border-line bg-canvas/70 p-5 transition hover:-translate-y-0.5 hover:border-accent hover:bg-surface"
            >
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                {item.shortLabel}
              </p>
              <h4 className="mt-3 text-lg font-semibold">{t(item.labelKey)}</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t(item.descriptionKey)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
