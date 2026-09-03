import { getUpload } from "@/lib/site/uploads";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const upload = await getUpload(id);
  if (!upload) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(upload.data), {
    headers: {
      "Content-Type": upload.mimeType,
      "Content-Length": String(upload.data.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${upload.filename.replace(/"/g, "")}"`,
    },
  });
}
