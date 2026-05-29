"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Database, LayoutPanelTop } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { navigationItems } from "@/lib/continuity/navigation";

export function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,#1f1c17_0%,#3b3429_54%,#8f3e1d_100%)] p-7 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/65">
            Phase 01
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
            {t("homeTitle")}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">
            {t("homeDescription")}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-surface-strong"
            >
              {t("openProjects")}
              <ArrowRight size={16} />
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-white/80">
              <CheckCircle2 size={16} />
              {t("bootstrapReady")}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <article className="rounded-[28px] border border-line bg-canvas/80 p-5">
            <LayoutPanelTop className="text-accent" size={22} />
            <h3 className="mt-4 text-lg font-semibold">{t("shellCardTitle")}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {t("shellCardBody")}
            </p>
          </article>
          <article className="rounded-[28px] border border-line bg-canvas/80 p-5">
            <Database className="text-success" size={22} />
            <h3 className="mt-4 text-lg font-semibold">{t("stackCardTitle")}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {t("stackCardBody")}
            </p>
          </article>
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
