import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { ensureAdminUser } from "@/lib/admin/ensure-admin";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  await ensureAdminUser();
  const admin = await getCurrentAdminUser();
  if (admin) redirect(ADMIN_ROUTES.root);

  return <AdminLoginForm />;
}
