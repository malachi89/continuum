"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

type SectionPageProps = {
  eyebrow: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
};

export function SectionPage({
  eyebrow,
  titleKey,
  descriptionKey,
}: SectionPageProps) {
  const { t } = useLanguage();

  return (
    <section className="rounded-[28px] border border-line bg-canvas/70 p-6 md:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">{t(titleKey)}</h2>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        {t(descriptionKey)}
      </p>
      <div className="mt-8 rounded-[24px] border border-dashed border-line bg-surface px-5 py-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          {t("comingSoon")}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">{t("comingSoonBody")}</p>
      </div>
    </section>
  );
}
