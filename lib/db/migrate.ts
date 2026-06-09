import { readFileSync } from "fs";
import { join } from "path";
import { getPool } from "@/lib/db/pool";

export async function runMigrations(): Promise<void> {
  const sql = readFileSync(join(process.cwd(), "lib/db/schema.sql"), "utf8");
  const pool = getPool();
  await pool.query(sql);
}
