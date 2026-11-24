import { MAX_PHOTO_BYTES } from "@/lib/presentation";
import { getUploadedPhoto, isPresentationStoreConfigured, saveUploadedPhoto } from "@/lib/presentation-store";
import { isQuoteAuthenticated } from "@/lib/quote-auth";

export const runtime = "nodejs";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// pdfkit only embeds JPEG and PNG; check the bytes, not the client-supplied type.
function photoExtension(bytes: Buffer) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.subarray(0, 8).equals(PNG_SIGNATURE)) return "png";
  return null;
}

/** Uploads a photo to the private store and returns its reference for the editor. */
export async function POST(request: Request) {
  if (!(await isQuoteAuthenticated())) {
    return Response.json({ error: "Tu sesión ha caducado. Inicia sesión de nuevo." }, { status: 401 });
  }
  if (!isPresentationStoreConfigured()) {
    return Response.json({ error: "El almacenamiento de fotos no está configurado (BLOB_READ_WRITE_TOKEN)." }, { status: 503 });
  }

  const file = (await request.formData().catch(() => null))?.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "No se recibió ninguna foto." }, { status: 400 });
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return Response.json({ error: "La foto es demasiado grande." }, { status: 413 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = photoExtension(bytes);
  if (!extension) {
    return Response.json({ error: "La foto debe ser JPG o PNG." }, { status: 400 });
  }

  try {
    return Response.json({ photo: await saveUploadedPhoto(bytes, extension) });
  } catch (error) {
    console.error("presentation photo upload failed", error);
    return Response.json({ error: "No se pudo subir la foto. Inténtalo de nuevo." }, { status: 500 });
  }
}

/** Serves an uploaded (private) photo to logged-in users for the editor preview. */
export async function GET(request: Request) {
  if (!(await isQuoteAuthenticated())) return new Response(null, { status: 401 });

  const pathname = new URL(request.url).searchParams.get("p") ?? "";
  const result = await getUploadedPhoto(pathname).catch(() => null);
  if (!result) return new Response(null, { status: 404 });

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      // Uploads get a new random name each time, so the content behind a name never changes.
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
