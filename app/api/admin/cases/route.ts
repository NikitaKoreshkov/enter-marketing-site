import { cookies } from "next/headers";
import { isAdminUser } from "@/lib/admin/auth";
import {
  SESSION_COOKIE,
  getUserByAuthToken,
  toPublicUser,
} from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/http";
import {
  createSiteCase,
  listSiteCases,
  reorderSiteCases,
} from "@/lib/site/cases-store";
import type { SiteCaseInput } from "@/lib/site/case-types";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = await getUserByAuthToken(token);
  if (!user || !isAdminUser(user)) return null;
  return toPublicUser(user);
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Нет доступа", 401);

  const cases = await listSiteCases();
  return jsonOk({ cases });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Нет доступа", 401);

  try {
    const body = (await request.json()) as SiteCaseInput & {
      ids?: string[];
      action?: string;
    };

    if (body.action === "reorder" && Array.isArray(body.ids)) {
      await reorderSiteCases(body.ids);
      const cases = await listSiteCases();
      return jsonOk({ cases });
    }

    if (!body.title?.trim()) {
      return jsonError("Укажите название проекта");
    }

    const created = await createSiteCase(body);
    return jsonOk({ case: created });
  } catch (err) {
    console.error("admin create case", err);
    return jsonError("Не удалось сохранить проект", 500);
  }
}
