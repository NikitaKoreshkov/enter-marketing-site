import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getUserByAuthToken,
  SESSION_COOKIE,
  toPublicUser,
} from "@/lib/auth/session";
import type { DbUser, PublicUser } from "@/lib/auth/types";
import { ADMIN_EMAIL, ADMIN_ROUTES } from "@/lib/admin/constants";

export { ensureAdminUser } from "@/lib/admin/ensure-admin";

export function isAdminUser(
  user: Pick<DbUser, "is_admin" | "email"> | null
): boolean {
  if (!user) return false;
  return (
    Boolean(user.is_admin) ||
    user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );
}

export async function getCurrentAdminUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = await getUserByAuthToken(token);
  if (!user || !isAdminUser(user)) return null;
  return toPublicUser(user);
}

export async function requireAdminUser(): Promise<PublicUser> {
  const user = await getCurrentAdminUser();
  if (!user) redirect(ADMIN_ROUTES.login);
  return user;
}
