import { AdminCasesList } from "@/components/admin/cases-list";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminUser } from "@/lib/admin/auth";
import { listSiteCases } from "@/lib/site/cases-store";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const admin = await requireAdminUser();
  const cases = await listSiteCases();

  return (
    <AdminShell email={admin.email}>
      <AdminCasesList cases={cases} />
    </AdminShell>
  );
}
