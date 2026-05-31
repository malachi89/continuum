import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { loginAction } from "@/app/(auth)/actions";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    title: "Iniciar sesión",
    description: "Accede con tu cuenta local para continuar en tu espacio de continuidad.",
    submit: "Entrar",
    footerText: "¿Necesitas una cuenta?",
    footerLinkLabel: "Registrarte",
    email: "Correo o usuario",
    password: "Contraseña",
  },
  en: {
    title: "Log in",
    description: "Sign in with your local account to continue in your continuity workspace.",
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
      description={text.description}
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
