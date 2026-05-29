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
      title="Welcome back"
      description="Sign in with your local account to continue into your continuity workspace."
      submitLabel="Sign in"
      footerText="Need an account?"
      footerLinkLabel="Register"
      footerHref="/register"
      fields={[
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
          autoComplete: "current-password",
        },
      ]}
    />
  );
}
