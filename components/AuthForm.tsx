"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthActionState } from "@/app/(auth)/actions";
import { BrandLogo } from "@/components/BrandLogo";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type AuthFormProps = {
  action: (
    state: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  title: string;
  description?: string;
  submitLabel: string;
  footerText: string;
  footerLinkLabel: string;
  footerHref: string;
  fields: Array<{
    autoComplete: string;
    label: string;
    name: "name" | "email" | "password";
    type: "text" | "email" | "password";
  }>;
};

const initialState: AuthActionState = {};

export function AuthForm({
  action,
  title,
  description,
  submitLabel,
  footerText,
  footerLinkLabel,
  footerHref,
  fields,
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-md rounded-[32px] border border-line bg-surface/95 p-8 shadow-[0_22px_70px_rgba(91,71,36,0.12)]">
      <BrandLogo variant="compact" />
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      ) : null}

      <form action={formAction} className="mt-8 space-y-4">
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-2 block text-sm font-medium text-ink">
              {field.label}
            </span>
            <input
              required
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              className="w-full rounded-2xl border border-line bg-canvas/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white"
            />
          </label>
        ))}

        {state.error ? (
          <p className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent-strong">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-surface transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? t("pleaseWait") : submitLabel}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {footerText}{" "}
        <Link href={footerHref} className="font-semibold text-accent hover:text-accent-strong">
          {footerLinkLabel}
        </Link>
      </p>
    </div>
  );
}
