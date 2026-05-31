import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { loginAction } from "@/app/(auth)/actions";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    title: "Iniciar sesión",
    submit: "Entrar",
    footerText: "¿Necesitas una cuenta?",
    footerLinkLabel: "Registrarte",
    email: "Correo o usuario",
    password: "Contraseña",
  },
  en: {
    title: "Log in",
    submit: "Enter",
    footerText: "Need an account?",
    footerLinkLabel: "Create one",
    email: "Email or username",
    password: "Password",
  },
} as const;

export default async function LoginPage() {
  const user = await getCurrentUser();
  const language = await getServerLanguage();
  const text = copy[language];

  if (user) {
    redirect("/");
  }

  return (
    <AuthForm
      action={loginAction}
      title={text.title}
      submitLabel={text.submit}
      footerText={text.footerText}
      footerLinkLabel={text.footerLinkLabel}
      footerHref="/register"
      fields={[
        {
          name: "email",
          label: text.email,
          type: "text",
          autoComplete: "username",
        },
        {
          name: "password",
          label: text.password,
          type: "password",
          autoComplete: "current-password",
        },
      ]}
    />
  );
}
