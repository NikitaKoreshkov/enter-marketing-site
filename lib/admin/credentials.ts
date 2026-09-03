/** Server-only admin bootstrap credentials. Set ADMIN_PASSWORD in the environment. */
export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not set");
  }
  return password;
}
