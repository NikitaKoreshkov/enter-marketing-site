import { getPool } from "@/lib/db/pool";
import { CASES_SEED_REVISION, SEED_CASES } from "@/lib/site/cases-seed";

async function ensureSeedMetaTable(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function ensureCasesSeeded(): Promise<void> {
  const pool = getPool();
  await ensureSeedMetaTable();

  const { rows: revRows } = await pool.query<{ value: string }>(
    `SELECT value FROM site_meta WHERE key = 'cases_seed_revision'`
  );
  const currentRev = revRows[0]?.value;
  const targetRev = String(CASES_SEED_REVISION);

  const { rows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM site_cases`
  );
  const count = Number(rows[0]?.count ?? 0);

  if (count > 0 && currentRev === targetRev) return;

  await pool.query(`DELETE FROM site_cases`);

  for (const item of SEED_CASES) {
    await pool.query(
      `INSERT INTO site_cases (
         id, title, service, description, work, result, results,
         cover, images, videos, instagram, website, sort_order
       ) VALUES (
         $1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8,$9::jsonb,$10::jsonb,$11,$12,$13
       )
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         service = EXCLUDED.service,
         description = EXCLUDED.description,
         work = EXCLUDED.work,
         result = EXCLUDED.result,
         results = EXCLUDED.results,
         cover = EXCLUDED.cover,
         images = EXCLUDED.images,
         videos = EXCLUDED.videos,
         instagram = EXCLUDED.instagram,
         website = EXCLUDED.website,
         sort_order = EXCLUDED.sort_order`,
      [
        item.id,
        item.title,
        item.service,
        item.description,
        JSON.stringify(item.work),
        item.result,
        JSON.stringify(item.results),
        item.cover,
        JSON.stringify(item.images),
        JSON.stringify(item.videos),
        item.instagram ?? null,
        item.website ?? null,
        item.sortOrder,
      ]
    );
  }

  await pool.query(
    `INSERT INTO site_meta (key, value, updated_at)
     VALUES ('cases_seed_revision', $1, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [targetRev]
  );
}
