import { AdminShell } from "@/components/admin/admin-shell";
import { CaseEditor } from "@/components/admin/case-editor";
import { requireAdminUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminNewCasePage() {
  const admin = await requireAdminUser();

  return (
    <AdminShell email={admin.email}>
      <CaseEditor mode="create" />
    </AdminShell>
  );
}
