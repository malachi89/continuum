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
      title="Create your workspace account"
      description="Register with name, email, and password so each user can manage their own projects."
      submitLabel="Create account"
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerHref="/login"
      fields={[
        {
          name: "name",
          label: "Name",
          type: "text",
          autoComplete: "name",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          autoComplete: "email",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          autoComplete: "new-password",
        },
      ]}
    />
  );
}
