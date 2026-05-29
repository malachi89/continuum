"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function LogoutButton() {
  const { t } = useLanguage();

  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas/80 px-4 py-2 text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
      >
        <LogOut size={16} />
        {t("signOut")}
      </button>
    </form>
  );
}
