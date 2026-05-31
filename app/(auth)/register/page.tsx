import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { registerAction } from "@/app/(auth)/actions";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  es: {
    title: "Crear cuenta",
    description:
      "Regístrate con nombre, correo y contraseña para administrar tus propios proyectos.",
    submit: "Crear cuenta",
    footerText: "¿Ya tienes cuenta?",
    footerLinkLabel: "Iniciar sesión",
    name: "Nombre",
    email: "Correo",
    password: "Contraseña",
  },
  en: {
    title: "Create account",
    description:
      "Register with a name, email, and password to manage your own projects.",
    submit: "Create account",
    footerText: "Already have an account?",
    footerLinkLabel: "Log in",
    name: "Name",
    email: "Email",
    password: "Password",
  },
} as const;

export default async function RegisterPage() {
  const user = await getCurrentUser();
  const language = await getServerLanguage();
  const text = copy[language];

  if (user) {
    redirect("/");
  }

  return (
    <AuthForm
      action={registerAction}
      title={text.title}
      description={text.description}
      submitLabel={text.submit}
      footerText={text.footerText}
      footerLinkLabel={text.footerLinkLabel}
      footerHref="/login"
      fields={[
        {
          name: "name",
          label: text.name,
          type: "text",
          autoComplete: "name",
        },
        {
          name: "email",
          label: text.email,
          type: "email",
          autoComplete: "email",
        },
        {
          name: "password",
          label: text.password,
          type: "password",
          autoComplete: "new-password",
        },
      ]}
    />
  );
}
