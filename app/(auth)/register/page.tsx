import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { registerAction } from "@/app/(auth)/actions";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <AuthForm
      action={registerAction}
      title="Crear cuenta"
      description="Regístrate con nombre, correo y contraseña para administrar tus propios proyectos."
      submitLabel="Crear cuenta"
      footerText="¿Ya tienes cuenta?"
      footerLinkLabel="Iniciar sesión"
      footerHref="/login"
      fields={[
        {
          name: "name",
          label: "Nombre",
          type: "text",
          autoComplete: "name",
        },
        {
          name: "email",
          label: "Correo",
          type: "email",
          autoComplete: "email",
        },
        {
          name: "password",
          label: "Contraseña",
          type: "password",
          autoComplete: "new-password",
        },
      ]}
    />
  );
}
