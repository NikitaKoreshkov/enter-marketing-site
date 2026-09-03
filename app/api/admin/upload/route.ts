import { cookies } from "next/headers";
import { isAdminUser } from "@/lib/admin/auth";
import {
  SESSION_COOKIE,
  getUserByAuthToken,
} from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/http";
import { saveUpload } from "@/lib/site/uploads";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = await getUserByAuthToken(token);
  if (!user || !isAdminUser(user)) {
    return jsonError("Нет доступа", 401);
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return jsonError("Выберите файл");
    }

    const uploaded = await saveUpload(file);
    return jsonOk({ upload: uploaded });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Не удалось загрузить файл";
    console.error("admin upload", err);
    return jsonError(message, 400);
  }
}
