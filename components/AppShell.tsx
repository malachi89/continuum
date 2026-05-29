"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { navigationItems } from "@/lib/continuity/navigation";
import type { CurrentUser } from "@/lib/auth/current-user";
import { LogoutButton } from "@/components/LogoutButton";

export function AppShell({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser: CurrentUser;
}) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-4 px-4 py-4 lg:px-6">
        <aside
          className={clsx(
            "fixed inset-y-4 left-4 z-30 w-72 rounded-[28px] border border-line bg-surface px-5 py-5 shadow-[0_22px_70px_rgba(91,71,36,0.12)] transition-transform lg:static lg:translate-x-0",
            isNavOpen ? "translate-x-0" : "-translate-x-[120%]",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                Continuity
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Tracker
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsNavOpen(false)}
              className="rounded-full border border-line p-2 text-muted lg:hidden"
              aria-label={t("closeMenu")}
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          <p className="mt-5 text-sm leading-6 text-muted">{t("shellIntro")}</p>

          <nav className="mt-8 space-y-2">
            {navigationItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center justify-between rounded-2xl border px-4 py-3 transition",
                    active
                      ? "border-accent bg-accent text-white"
                      : "border-transparent bg-canvas/70 text-ink hover:border-line hover:bg-surface-strong/60",
                  )}
                  onClick={() => setIsNavOpen(false)}
                >
                  <span className="font-medium">{t(item.labelKey)}</span>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] opacity-70">
                    {item.shortLabel}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-line bg-canvas/80 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {t("language")}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["es", "en"] as const).map((option) => {
                const active = language === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLanguage(option)}
                    className={clsx(
                      "rounded-xl px-3 py-2 text-sm font-semibold uppercase transition",
                      active
                        ? "bg-ink text-surface"
                        : "bg-surface text-muted hover:bg-surface-strong hover:text-ink",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-[32px] border border-line bg-surface/90 shadow-[0_18px_60px_rgba(91,71,36,0.08)] backdrop-blur">
          <header className="flex items-center justify-between border-b border-line px-5 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsNavOpen(true)}
                className="rounded-full border border-line p-2 text-muted lg:hidden"
                aria-label={t("openMenu")}
              >
                <PanelLeftOpen size={18} />
              </button>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                  {t("workspace")}
                </p>
                <p className="text-sm font-medium text-ink">{t("workspaceName")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-line bg-canvas/80 px-3 py-2 text-sm text-muted">
              <Languages size={16} />
              <span>{language.toUpperCase()}</span>
            </div>
          </header>

          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 md:px-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                {t("account")}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {currentUser.name} · {currentUser.email}
              </p>
            </div>
            <LogoutButton />
          </div>

          <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
