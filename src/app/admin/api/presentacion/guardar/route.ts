import { isPresentationStoreConfigured, readPresentationRequest, savePresentation } from "@/lib/presentation-store";
import { isQuoteAuthenticated } from "@/lib/quote-auth";

export const runtime = "nodejs";

/** Saves the text and photo choices of one template for everyone who logs in. */
export async function POST(request: Request) {
  if (!(await isQuoteAuthenticated())) {
    return Response.json({ error: "Tu sesión ha caducado. Inicia sesión de nuevo." }, { status: 401 });
  }
  if (!isPresentationStoreConfigured()) {
    return Response.json({ error: "El almacenamiento no está configurado (BLOB_READ_WRITE_TOKEN)." }, { status: 503 });
  }

  const input = await readPresentationRequest(request);
  if (!input) {
    return Response.json({ error: "Revisa los textos: alguno es demasiado largo o está incompleto." }, { status: 400 });
  }
  const { template, pages } = input;

  try {
    await savePresentation(template, pages);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("presentation save failed", error);
    return Response.json({ error: "No se pudo guardar. Inténtalo de nuevo." }, { status: 500 });
  }
}
