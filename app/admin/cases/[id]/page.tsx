import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { CaseEditor } from "@/components/admin/case-editor";
import { requireAdminUser } from "@/lib/admin/auth";
import { getSiteCase } from "@/lib/site/cases-store";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminEditCasePage({ params }: PageProps) {
  const admin = await requireAdminUser();
  const { id } = await params;
  const item = await getSiteCase(id);
  if (!item) notFound();

  return (
    <AdminShell email={admin.email}>
      <CaseEditor mode="edit" initial={item} />
    </AdminShell>
  );
}
