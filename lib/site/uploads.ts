import { getPool } from "@/lib/db/pool";
import {
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/admin/constants";

export type StoredUpload = {
  id: string;
  filename: string;
  mimeType: string;
  byteSize: number;
  url: string;
};

type UploadRow = {
  id: string;
  filename: string;
  mime_type: string;
  byte_size: number;
  data: Buffer;
};

const IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const VIDEO_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

export function mediaUrl(id: string): string {
  return `/api/media/${id}`;
}

export function detectMediaKind(
  mimeType: string
): "image" | "video" | null {
  if (IMAGE_MIME.has(mimeType)) return "image";
  if (VIDEO_MIME.has(mimeType)) return "video";
  return null;
}

export async function saveUpload(file: File): Promise<StoredUpload> {
  const mimeType = file.type || "application/octet-stream";
  const kind = detectMediaKind(mimeType);
  if (!kind) {
    throw new Error("Можно загружать только изображения и видео");
  }

  const max = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > max) {
    throw new Error(
      kind === "image"
        ? "Изображение слишком большое (макс. 12 МБ)"
        : "Видео слишком большое (макс. 80 МБ)"
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const pool = getPool();
  const { rows } = await pool.query<UploadRow>(
    `INSERT INTO site_uploads (filename, mime_type, byte_size, data)
     VALUES ($1, $2, $3, $4)
     RETURNING id, filename, mime_type, byte_size, data`,
    [file.name.slice(0, 180) || "file", mimeType, buffer.byteLength, buffer]
  );

  const row = rows[0];
  return {
    id: row.id,
    filename: row.filename,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    url: mediaUrl(row.id),
  };
}

export async function getUpload(
  id: string
): Promise<{ data: Buffer; mimeType: string; filename: string } | null> {
  const pool = getPool();
  const { rows } = await pool.query<UploadRow>(
    `SELECT id, filename, mime_type, byte_size, data
     FROM site_uploads WHERE id = $1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    data: row.data,
    mimeType: row.mime_type,
    filename: row.filename,
  };
}
