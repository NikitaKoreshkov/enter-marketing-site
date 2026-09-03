import { readFileSync } from "fs";
import { join } from "path";
import { ensureAdminUser } from "@/lib/admin/ensure-admin";
import { getPool } from "@/lib/db/pool";
import { ensureCasesSeeded } from "@/lib/site/cases-seed-db";

export async function runMigrations(): Promise<void> {
  const sql = readFileSync(join(process.cwd(), "lib/db/schema.sql"), "utf8");
  const pool = getPool();
  await pool.query(sql);
  await ensureAdminUser();
  await ensureCasesSeeded();
}
