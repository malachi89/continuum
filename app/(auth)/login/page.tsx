import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { loginAction } from "@/app/(auth)/actions";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <AuthForm
      action={loginAction}
      title="Iniciar sesión"
      description="Accede con tu cuenta local para continuar en tu espacio de continuidad."
      submitLabel="Entrar"
      footerText="¿Necesitas una cuenta?"
      footerLinkLabel="Registrarte"
      footerHref="/register"
      fields={[
        {
          name: "email",
          label: "Correo o usuario",
          type: "text",
          autoComplete: "username",
        },
        {
          name: "password",
          label: "Contraseña",
          type: "password",
          autoComplete: "current-password",
        },
      ]}
    />
  );
}
