import { revalidatePath } from "next/cache";
import { getPool } from "@/lib/db/pool";
import { ensureCasesSeeded } from "@/lib/site/cases-seed-db";
import type { CaseResult, SiteCase, SiteCaseInput } from "@/lib/site/case-types";

export { ensureCasesSeeded } from "@/lib/site/cases-seed-db";

type CaseRow = {
  id: string;
  title: string;
  service: string;
  description: string;
  work: unknown;
  result: string;
  results: unknown;
  cover: string;
  images: unknown;
  videos: unknown;
  instagram: string | null;
  website: string | null;
  sort_order: number;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asResults(value: unknown): CaseResult[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as { value?: unknown; label?: unknown };
      if (typeof row.value !== "string" || typeof row.label !== "string") {
        return null;
      }
      return { value: row.value, label: row.label };
    })
    .filter((item): item is CaseResult => Boolean(item));
}

function rowToCase(row: CaseRow): SiteCase {
  return {
    id: row.id,
    title: row.title,
    service: row.service,
    description: row.description,
    work: asStringArray(row.work),
    result: row.result,
    results: asResults(row.results),
    cover: row.cover || "",
    images: asStringArray(row.images),
    videos: asStringArray(row.videos),
    instagram: row.instagram || undefined,
    website: row.website || undefined,
    sortOrder: row.sort_order,
  };
}

export function slugifyCaseId(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9а-я\s-]/gi, "")
    .replace(/[а-я]/gi, (ch) => {
      const map: Record<string, string> = {
        а: "a",
        б: "b",
        в: "v",
        г: "g",
        д: "d",
        е: "e",
        ж: "zh",
        з: "z",
        и: "i",
        й: "y",
        к: "k",
        л: "l",
        м: "m",
        н: "n",
        о: "o",
        п: "p",
        р: "r",
        с: "s",
        т: "t",
        у: "u",
        ф: "f",
        х: "h",
        ц: "ts",
        ч: "ch",
        ш: "sh",
        щ: "sch",
        ъ: "",
        ы: "y",
        ь: "",
        э: "e",
        ю: "yu",
        я: "ya",
      };
      return map[ch] ?? "";
    })
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || `case-${Date.now()}`;
}

export function revalidateSiteCases() {
  revalidatePath("/");
  revalidatePath("/cases");
  revalidatePath("/admin");
}

export async function listSiteCases(): Promise<SiteCase[]> {
  await ensureCasesSeeded();
  const pool = getPool();
  const { rows } = await pool.query<CaseRow>(
    `SELECT * FROM site_cases ORDER BY sort_order ASC, created_at ASC`
  );
  return rows.map(rowToCase);
}

export async function getSiteCase(id: string): Promise<SiteCase | null> {
  await ensureCasesSeeded();
  const pool = getPool();
  const { rows } = await pool.query<CaseRow>(
    `SELECT * FROM site_cases WHERE id = $1`,
    [id]
  );
  return rows[0] ? rowToCase(rows[0]) : null;
}

async function uniqueCaseId(preferred: string): Promise<string> {
  const pool = getPool();
  let candidate = preferred;
  let n = 2;
  while (true) {
    const { rows } = await pool.query<{ id: string }>(
      `SELECT id FROM site_cases WHERE id = $1`,
      [candidate]
    );
    if (!rows[0]) return candidate;
    candidate = `${preferred}-${n}`;
    n += 1;
  }
}

export async function createSiteCase(input: SiteCaseInput): Promise<SiteCase> {
  const pool = getPool();
  const preferred = (input.id?.trim() || slugifyCaseId(input.title)).slice(0, 80);
  const id = await uniqueCaseId(preferred);

  const { rows: orderRows } = await pool.query<{ max: number | null }>(
    `SELECT MAX(sort_order) AS max FROM site_cases`
  );
  const sortOrder =
    typeof input.sortOrder === "number"
      ? input.sortOrder
      : (orderRows[0]?.max ?? -1) + 1;

  const { rows } = await pool.query<CaseRow>(
    `INSERT INTO site_cases (
       id, title, service, description, work, result, results,
       cover, images, videos, instagram, website, sort_order
     ) VALUES (
       $1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8,$9::jsonb,$10::jsonb,$11,$12,$13
     )
     RETURNING *`,
    [
      id,
      input.title.trim(),
      input.service.trim(),
      input.description.trim(),
      JSON.stringify(input.work.map((item) => item.trim()).filter(Boolean)),
      input.result.trim(),
      JSON.stringify(
        input.results
          .map((item) => ({
            value: item.value.trim(),
            label: item.label.trim(),
          }))
          .filter((item) => item.value && item.label)
      ),
      input.cover.trim(),
      JSON.stringify(input.images.filter(Boolean)),
      JSON.stringify(input.videos.filter(Boolean)),
      input.instagram?.trim() || null,
      input.website?.trim() || null,
      sortOrder,
    ]
  );

  revalidateSiteCases();
  return rowToCase(rows[0]);
}

export async function updateSiteCase(
  id: string,
  input: SiteCaseInput
): Promise<SiteCase | null> {
  const pool = getPool();
  const { rows } = await pool.query<CaseRow>(
    `UPDATE site_cases SET
       title = $2,
       service = $3,
       description = $4,
       work = $5::jsonb,
       result = $6,
       results = $7::jsonb,
       cover = $8,
       images = $9::jsonb,
       videos = $10::jsonb,
       instagram = $11,
       website = $12,
       sort_order = COALESCE($13, sort_order),
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      input.title.trim(),
      input.service.trim(),
      input.description.trim(),
      JSON.stringify(input.work.map((item) => item.trim()).filter(Boolean)),
      input.result.trim(),
      JSON.stringify(
        input.results
          .map((item) => ({
            value: item.value.trim(),
            label: item.label.trim(),
          }))
          .filter((item) => item.value && item.label)
      ),
      input.cover.trim(),
      JSON.stringify(input.images.filter(Boolean)),
      JSON.stringify(input.videos.filter(Boolean)),
      input.instagram?.trim() || null,
      input.website?.trim() || null,
      typeof input.sortOrder === "number" ? input.sortOrder : null,
    ]
  );

  if (!rows[0]) return null;
  revalidateSiteCases();
  return rowToCase(rows[0]);
}

export async function deleteSiteCase(id: string): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query(`DELETE FROM site_cases WHERE id = $1`, [id]);
  if ((result.rowCount ?? 0) === 0) return false;
  revalidateSiteCases();
  return true;
}

export async function reorderSiteCases(ids: string[]): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < ids.length; i += 1) {
      await client.query(
        `UPDATE site_cases SET sort_order = $2, updated_at = NOW() WHERE id = $1`,
        [ids[i], i]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
  revalidateSiteCases();
}
