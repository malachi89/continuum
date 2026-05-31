"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { navigationItems } from "@/lib/continuity/navigation";
import type { CurrentUser } from "@/lib/auth/current-user";
import { BrandLogo } from "@/components/BrandLogo";
import { LogoutButton } from "@/components/LogoutButton";

const projectScopedRoutes = new Map<string, string>([
  ["/characters", "/characters"],
  ["/locations", "/locations"],
  ["/events", "/events"],
  ["/timeline", "/timeline"],
  ["/analysis", "/analysis"],
]);

function getActiveProjectId(pathname: string) {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match?.[1] ?? null;
}

function getNavigationHref(itemHref: string, projectId: string | null) {
  if (!projectId) {
    return itemHref;
  }

  if (itemHref === "/projects") {
    return `/projects/${projectId}`;
  }

  const projectRoute = projectScopedRoutes.get(itemHref);
  return projectRoute ? `/projects/${projectId}${projectRoute}` : itemHref;
}

export function AppShell({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser: CurrentUser;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeProjectId = getActiveProjectId(pathname);
  const { language, setLanguage, t } = useLanguage();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const previousLanguage = useRef(language);

  useEffect(() => {
    if (previousLanguage.current !== language) {
      previousLanguage.current = language;
      router.refresh();
    }
  }, [language, router]);

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen gap-4 px-4 py-4 lg:px-6">
        <aside
          className={clsx(
            "fixed inset-y-4 left-4 z-30 flex w-72 shrink-0 flex-col overflow-y-auto rounded-[28px] border border-line bg-surface px-5 py-5 shadow-[0_22px_70px_rgba(91,71,36,0.12)] transition-transform lg:static lg:translate-x-0",
            isNavOpen ? "translate-x-0" : "-translate-x-[120%]",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <BrandLogo />
            <button
              type="button"
              onClick={() => setIsNavOpen(false)}
              className="rounded-full border border-line p-2 text-muted lg:hidden"
              aria-label={t("closeMenu")}
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          <nav className="mt-8 space-y-2">
            {navigationItems.map((item) => {
              const href = getNavigationHref(item.href, activeProjectId);
              const active =
                pathname === href ||
                (activeProjectId !== null &&
                  item.href !== "/projects" &&
                  pathname.startsWith(`${href}/`));

              return (
                <Link
                  key={item.href}
                  href={href}
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

          <div className="mt-auto space-y-4 pt-8">
            <div className="rounded-2xl border border-line bg-canvas/80 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                {t("account")}
              </p>
              <p className="mt-2 break-words text-sm font-medium leading-6 text-ink">
                {currentUser.name} · {currentUser.email}
              </p>
              <div className="mt-4">
                <LogoutButton className="w-full" />
              </div>
            </div>

            <div className="flex justify-center pb-1">
              <div
                role="group"
                aria-label={t("language")}
                className="relative inline-flex h-9 w-28 items-center rounded-full border border-line bg-canvas/70 p-1 shadow-[0_8px_24px_rgba(91,71,36,0.08)]"
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    "absolute inset-y-1 left-1 w-1/2 rounded-full bg-ink transition-transform duration-200 ease-out",
                    language === "en" ? "translate-x-full" : "translate-x-0",
                  )}
                />
                {(["es", "en"] as const).map((option) => {
                  const active = language === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLanguage(option)}
                      aria-pressed={active}
                      className={clsx(
                        "relative z-10 flex-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.22em] transition",
                        active ? "text-surface" : "text-muted hover:text-ink",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-[32px] border border-line bg-surface/90 shadow-[0_18px_60px_rgba(91,71,36,0.08)] backdrop-blur">
          <header className="border-b border-line px-5 py-4 md:px-8 lg:hidden">
            <button
              type="button"
              onClick={() => setIsNavOpen(true)}
              className="rounded-full border border-line p-2 text-muted"
              aria-label={t("openMenu")}
            >
              <PanelLeftOpen size={18} />
            </button>
          </header>

          <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
