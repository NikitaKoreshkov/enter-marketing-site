import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = {
  title: "Вход — Enter Marketing",
  description: "Вход в личный кабинет Enter Marketing.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(AUTH_ROUTES.profile);

  return (
    <AuthPageShell>
      <AuthForm mode="login" />
    </AuthPageShell>
  );
}
