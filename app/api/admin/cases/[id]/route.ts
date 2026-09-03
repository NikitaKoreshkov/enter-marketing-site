import { cookies } from "next/headers";
import { isAdminUser } from "@/lib/admin/auth";
import {
  SESSION_COOKIE,
  getUserByAuthToken,
  toPublicUser,
} from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/http";
import {
  deleteSiteCase,
  getSiteCase,
  updateSiteCase,
} from "@/lib/site/cases-store";
import type { SiteCaseInput } from "@/lib/site/case-types";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = await getUserByAuthToken(token);
  if (!user || !isAdminUser(user)) return null;
  return toPublicUser(user);
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Нет доступа", 401);

  const { id } = await context.params;
  const item = await getSiteCase(id);
  if (!item) return jsonError("Проект не найден", 404);
  return jsonOk({ case: item });
}

export async function PUT(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Нет доступа", 401);

  try {
    const { id } = await context.params;
    const body = (await request.json()) as SiteCaseInput;
    if (!body.title?.trim()) {
      return jsonError("Укажите название проекта");
    }

    const updated = await updateSiteCase(id, body);
    if (!updated) return jsonError("Проект не найден", 404);
    return jsonOk({ case: updated });
  } catch (err) {
    console.error("admin update case", err);
    return jsonError("Не удалось обновить проект", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Нет доступа", 401);

  const { id } = await context.params;
  const ok = await deleteSiteCase(id);
  if (!ok) return jsonError("Проект не найден", 404);
  return jsonOk({ deleted: true });
}
