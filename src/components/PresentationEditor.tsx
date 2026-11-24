"use client";

import { useState, type FormEvent } from "react";
import {
  DEFAULT_PRESENTATION,
  LIMITS,
  MAX_BLOCKS,
  PRESENTATION_PAGE_NAMES,
  PRESENTATION_TEMPLATES,
  type PresentationPage,
  type PresentationTemplate,
} from "@/lib/presentation";

type Photo = { file: Blob; url: string } | null;

const fieldClass =
  "w-full border border-line bg-night-2 px-4 py-3 text-paper placeholder:text-muted focus:border-accent focus:outline-none transition-colors";
const labelClass = "mb-2 block text-sm font-semibold";
const sectionClass = "border border-line bg-night-2/60 p-5 md:p-7";
const linkButton = "text-sm font-semibold text-muted-2 underline underline-offset-4 hover:text-paper";
const MAX_PHOTO_SIDE = 2000;

const freshPages = () => structuredClone(DEFAULT_PRESENTATION);

// Phone photos are often 5-10 MB; re-encode to a 2000px JPEG so five of them fit in one request.
async function shrinkPhoto(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("No se pudo procesar la foto.");
  return blob;
}

export function PresentationEditor() {
  const [template, setTemplate] = useState<PresentationTemplate>("boda");
  const [pages, setPages] = useState<PresentationPage[]>(freshPages);
  const { cover, pages: templatePages } = PRESENTATION_TEMPLATES[template];
  const [photos, setPhotos] = useState<Photo[]>(() => DEFAULT_PRESENTATION.map(() => null));
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  function replacePhoto(index: number, next: Photo) {
    const previous = photos[index];
    if (previous) URL.revokeObjectURL(previous.url);
    setPhotos((current) => current.map((photo, i) => (i === index ? next : photo)));
  }

  function updatePage(index: number, change: Partial<PresentationPage>) {
    setPages((current) => current.map((page, i) => (i === index ? { ...page, ...change } : page)));
  }

  function updateBlock(pageIndex: number, blockIndex: number, key: "title" | "text", value: string) {
    updatePage(pageIndex, {
      blocks: pages[pageIndex].blocks.map((block, i) => (i === blockIndex ? { ...block, [key]: value } : block)),
    });
  }

  async function choosePhoto(index: number, file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      const shrunk = await shrinkPhoto(file);
      replacePhoto(index, { file: shrunk, url: URL.createObjectURL(shrunk) });
    } catch {
      setError(`No se pudo leer la foto "${file.name}". Prueba con un JPG o PNG.`);
    }
  }

  function resetAll() {
    setPages(freshPages());
    setTemplate("boda");
    photos.forEach((photo) => photo && URL.revokeObjectURL(photo.url));
    setPhotos(DEFAULT_PRESENTATION.map(() => null));
    setError("");
  }

  async function generatePdf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsGenerating(true);

    try {
      const body = new FormData();
      body.set("template", template);
      body.set("data", JSON.stringify(pages.map(({ section, eyebrow, blocks }) => ({ section, eyebrow, blocks }))));
      photos.forEach((photo, i) => photo && body.set(`photo-${i}`, photo.file, `photo-${i}.jpg`));

      const response = await fetch("/admin/api/presentacion", { method: "POST", body });
      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        throw new Error(
          data && typeof data === "object" && "error" in data && typeof data.error === "string"
            ? data.error
            : "No se pudo generar el PDF. Revisa tu sesión e inténtalo de nuevo.",
        );
      }

      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "presentacion-harvest-moon.pdf";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo generar el PDF. Inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <form onSubmit={generatePdf} className="grid gap-8">
      <fieldset className={sectionClass}>
        <legend className="sr-only">Plantilla</legend>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Empezar desde</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {(Object.keys(PRESENTATION_TEMPLATES) as PresentationTemplate[]).map((key) => (
            <label
              key={key}
              className={`cursor-pointer border px-5 py-3 font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-accent ${
                key === template ? "border-accent text-paper" : "border-line text-muted-2 hover:text-paper"
              }`}
            >
              <input
                type="radio"
                name="template"
                value={key}
                checked={key === template}
                onChange={() => setTemplate(key)}
                className="sr-only"
              />
              {PRESENTATION_TEMPLATES[key].label}
            </label>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          Cambia las fotos por defecto y el diseño de la portada. Tus textos y fotos subidas se mantienen.
        </p>
      </fieldset>

      {pages.map((page, pageIndex) => {
        const isCover = pageIndex === 0;
        const photoUrl = photos[pageIndex]?.url ?? templatePages[pageIndex].photo;
        // Preview the photo's shape on the page: full cover, half-page cover band, or header band.
        const aspect = !isCover ? "aspect-[595/240]" : cover === "half" ? "aspect-[595/390]" : "aspect-[595/842]";
        return (
          <section key={pageIndex} className={sectionClass}>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">
              {String(pageIndex + 1).padStart(2, "0")} · {PRESENTATION_PAGE_NAMES[pageIndex]}
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr]">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs */}
                <img
                  src={photoUrl}
                  alt={`Foto de ${PRESENTATION_PAGE_NAMES[pageIndex].toLowerCase()}`}
                  className={`w-full border border-line object-cover ${aspect}`}
                />
                <label className="btn btn-ghost mt-3 w-full cursor-pointer justify-center">
                  Cambiar foto
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(change) => {
                      void choosePhoto(pageIndex, change.target.files?.[0]);
                      change.target.value = "";
                    }}
                  />
                </label>
                {photos[pageIndex] && (
                  <button type="button" onClick={() => replacePhoto(pageIndex, null)} className={`${linkButton} mt-3`}>
                    Usar foto original
                  </button>
                )}
              </div>

              <div className="grid content-start gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  {!isCover && (
                    <div>
                      <label htmlFor={`section-${pageIndex}`} className={labelClass}>Banda sobre la foto</label>
                      <input
                        id={`section-${pageIndex}`}
                        value={page.section}
                        maxLength={LIMITS.section}
                        onChange={(change) => updatePage(pageIndex, { section: change.target.value })}
                        className={fieldClass}
                      />
                    </div>
                  )}
                  <div className={isCover ? "md:col-span-2" : ""}>
                    <label htmlFor={`eyebrow-${pageIndex}`} className={labelClass}>Antetítulo</label>
                    <input
                      id={`eyebrow-${pageIndex}`}
                      value={page.eyebrow}
                      maxLength={LIMITS.eyebrow}
                      placeholder="Opcional"
                      onChange={(change) => updatePage(pageIndex, { eyebrow: change.target.value })}
                      className={fieldClass}
                    />
                  </div>
                </div>

                {page.blocks.map((block, blockIndex) => (
                  <div key={blockIndex} className="grid gap-3 border-t border-line pt-5">
                    <div>
                      <label htmlFor={`title-${pageIndex}-${blockIndex}`} className={labelClass}>
                        {blockIndex === 0 ? "Título" : "Subtítulo"}
                      </label>
                      <input
                        id={`title-${pageIndex}-${blockIndex}`}
                        value={block.title}
                        maxLength={LIMITS.title}
                        onChange={(change) => updateBlock(pageIndex, blockIndex, "title", change.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`text-${pageIndex}-${blockIndex}`} className={labelClass}>Texto</label>
                      <textarea
                        id={`text-${pageIndex}-${blockIndex}`}
                        value={block.text}
                        maxLength={LIMITS.text}
                        rows={5}
                        placeholder="Opcional"
                        onChange={(change) => updateBlock(pageIndex, blockIndex, "text", change.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    {page.blocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => updatePage(pageIndex, { blocks: page.blocks.filter((_, i) => i !== blockIndex) })}
                        className={`${linkButton} justify-self-start`}
                      >
                        Quitar este bloque
                      </button>
                    )}
                  </div>
                ))}

                {!isCover && page.blocks.length < MAX_BLOCKS && (
                  <button
                    type="button"
                    onClick={() => updatePage(pageIndex, { blocks: [...page.blocks, { title: "", text: "" }] })}
                    className="btn btn-ghost justify-self-start"
                  >
                    Añadir bloque
                  </button>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {error && (
        <p role="alert" className="border border-red-400 px-5 py-4 text-sm leading-relaxed text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={isGenerating} className="btn btn-accent disabled:cursor-wait disabled:opacity-60">
          {isGenerating ? "Generando PDF…" : "Descargar presentación"}
        </button>
        <button type="button" onClick={resetAll} className={linkButton}>
          Restablecer textos y fotos
        </button>
      </div>
    </form>
  );
}
