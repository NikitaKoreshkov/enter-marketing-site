import { hashPassword } from "@/lib/auth/password";
import type { DbUser } from "@/lib/auth/types";
import { getPool } from "@/lib/db/pool";
import { ADMIN_EMAIL, ADMIN_NAME } from "@/lib/admin/constants";
import { getAdminPassword } from "@/lib/admin/credentials";

export async function ensureAdminUser(): Promise<void> {
  const pool = getPool();
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = hashPassword(getAdminPassword());
  const existing = await pool.query<DbUser>(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  if (existing.rows[0]) {
    await pool.query(
      `UPDATE users SET
         is_admin = TRUE,
         email_verified = TRUE,
         name = COALESCE(name, $2),
         password_hash = $3,
         updated_at = NOW()
       WHERE email = $1`,
      [email, ADMIN_NAME, passwordHash]
    );
    return;
  }

  await pool.query(
    `INSERT INTO users (email, name, password_hash, email_verified, is_admin)
     VALUES ($1, $2, $3, TRUE, TRUE)`,
    [email, ADMIN_NAME, passwordHash]
  );
}
