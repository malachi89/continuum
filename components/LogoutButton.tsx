"use client";

import clsx from "clsx";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function LogoutButton({ className }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-canvas/80 px-4 py-2 text-sm font-medium text-ink transition hover:border-accent hover:text-accent",
          className,
        )}
      >
        <LogOut size={16} />
        {t("signOut")}
      </button>
    </form>
  );
}
