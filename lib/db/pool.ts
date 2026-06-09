import { Pool } from "pg";
import { getDatabaseUrl } from "@/lib/env";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      max: 10,
    });
  }
  return pool;
}
