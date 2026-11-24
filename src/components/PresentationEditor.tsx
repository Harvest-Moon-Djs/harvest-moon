"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  LIMITS,
  MAX_BLOCKS,
  PRESENTATION_PAGE_NAMES,
  PRESENTATION_TEMPLATES,
  photoSrc,
  type PresentationPage,
  type PresentationTemplate,
} from "@/lib/presentation";

type Drafts = Record<PresentationTemplate, PresentationPage[]>;

const fieldClass =
  "w-full border border-line bg-night-2 px-4 py-3 text-paper placeholder:text-muted focus:border-accent focus:outline-none transition-colors";
const labelClass = "mb-2 block text-sm font-semibold";
const sectionClass = "border border-line bg-night-2/60 p-5 md:p-7";
const linkButton = "text-sm font-semibold text-muted-2 underline underline-offset-4 hover:text-paper";
const MAX_PHOTO_SIDE = 2000;
const TEMPLATE_KEYS = Object.keys(PRESENTATION_TEMPLATES) as PresentationTemplate[];

const defaultPages = (template: PresentationTemplate) => structuredClone(PRESENTATION_TEMPLATES[template].pages);

// Phone photos are often 5-10 MB; re-encode to a 2000px JPEG before uploading.
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

async function errorMessage(response: Response, fallback: string) {
  const data: unknown = await response.json().catch(() => null);
  return data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : fallback;
}

export function PresentationEditor({
  saved,
  sitePhotos,
  canSave,
}: {
  saved: Record<PresentationTemplate, PresentationPage[] | null>;
  sitePhotos: string[];
  canSave: boolean;
}) {
  const [template, setTemplate] = useState<PresentationTemplate>("boda");
  const [drafts, setDrafts] = useState<Drafts>(
    () => Object.fromEntries(TEMPLATE_KEYS.map((key) => [key, saved[key] ?? defaultPages(key)])) as Drafts,
  );
  // What is stored on the server for each template, to tell when there are unsaved changes.
  const [savedJson, setSavedJson] = useState(
    () =>
      Object.fromEntries(
        TEMPLATE_KEYS.map((key) => [key, JSON.stringify(saved[key] ?? defaultPages(key))]),
      ) as Record<PresentationTemplate, string>,
  );
  const [pickerFor, setPickerFor] = useState<number | null>(null);
  const [uploadingPage, setUploadingPage] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const pickerRef = useRef<HTMLDialogElement>(null);

  const pages = drafts[template];
  const { cover, pages: templateDefaults } = PRESENTATION_TEMPLATES[template];
  const unsaved = TEMPLATE_KEYS.filter((key) => JSON.stringify(drafts[key]) !== savedJson[key]);
  const isDirty = unsaved.includes(template);

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!unsaved.length) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved.length]);

  useEffect(() => {
    if (pickerFor === null) pickerRef.current?.close();
    else pickerRef.current?.showModal();
  }, [pickerFor]);

  function setPages(update: (current: PresentationPage[]) => PresentationPage[]) {
    setNotice("");
    setDrafts((current) => ({ ...current, [template]: update(current[template]) }));
  }

  function updatePage(index: number, change: Partial<PresentationPage>) {
    setPages((current) => current.map((page, i) => (i === index ? { ...page, ...change } : page)));
  }

  function updateBlock(pageIndex: number, blockIndex: number, key: "title" | "text", value: string) {
    setPages((current) =>
      current.map((page, i) =>
        i === pageIndex
          ? { ...page, blocks: page.blocks.map((block, j) => (j === blockIndex ? { ...block, [key]: value } : block)) }
          : page,
      ),
    );
  }

  async function uploadPhoto(index: number, file: File | undefined) {
    if (!file) return;
    setError("");
    setUploadingPage(index);
    try {
      let photo: Blob;
      try {
        photo = await shrinkPhoto(file);
      } catch {
        throw new Error(`No se pudo leer la foto "${file.name}". Prueba con un JPG o PNG.`);
      }
      const body = new FormData();
      body.set("photo", photo, "photo.jpg");
      const response = await fetch("/admin/api/presentacion/foto", { method: "POST", body });
      if (!response.ok) throw new Error(await errorMessage(response, "No se pudo subir la foto."));
      const data = (await response.json()) as { photo: string };
      updatePage(index, { photo: data.photo });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo subir la foto.");
    } finally {
      setUploadingPage(null);
    }
  }

  async function save() {
    setError("");
    setNotice("");
    setIsSaving(true);
    try {
      const response = await fetch("/admin/api/presentacion/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, pages }),
      });
      if (!response.ok) throw new Error(await errorMessage(response, "No se pudo guardar."));
      setSavedJson((current) => ({ ...current, [template]: JSON.stringify(pages) }));
      setNotice(`Guardado. La plantilla ${PRESENTATION_TEMPLATES[template].label} aparecerá así la próxima vez.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  async function generatePdf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsGenerating(true);
    try {
      const response = await fetch("/admin/api/presentacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, pages }),
      });
      if (!response.ok) {
        throw new Error(await errorMessage(response, "No se pudo generar el PDF. Revisa tu sesión e inténtalo de nuevo."));
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `presentacion-${template}-harvest-moon.pdf`;
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

  // Group the picker by the first folder under /media ("pages", "blog", "artistas"…).
  const photoGroups = Map.groupBy(sitePhotos, (photo) => photo.split("/")[2]);

  return (
    <form onSubmit={generatePdf} className="grid gap-8">
      <fieldset className={sectionClass}>
        <legend className="sr-only">Plantilla</legend>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Plantilla</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {TEMPLATE_KEYS.map((key) => (
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
              {unsaved.includes(key) && (
                <span className="ml-2 text-accent" title="Sin guardar">
                  •<span className="sr-only"> (sin guardar)</span>
                </span>
              )}
            </label>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">Cada plantilla tiene sus propios textos y fotos, y se guarda por separado.</p>
      </fieldset>

      {pages.map((page, pageIndex) => {
        const isCover = pageIndex === 0;
        const defaultPhoto = templateDefaults[pageIndex].photo;
        // Preview the photo's shape on the page: full cover, half-page cover band, or header band.
        const aspect = !isCover ? "aspect-[595/240]" : cover === "half" ? "aspect-[595/390]" : "aspect-[595/842]";
        return (
          <section key={`${template}-${pageIndex}`} className={sectionClass}>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">
              {String(pageIndex + 1).padStart(2, "0")} · {PRESENTATION_PAGE_NAMES[pageIndex]}
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr]">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element -- uploaded photos come from an authenticated route */}
                <img
                  src={photoSrc(page.photo)}
                  alt={`Foto de ${PRESENTATION_PAGE_NAMES[pageIndex].toLowerCase()}`}
                  className={`w-full border border-line object-cover ${aspect} ${uploadingPage === pageIndex ? "opacity-40" : ""}`}
                />
                <div className="mt-3 grid gap-2">
                  {canSave && (
                    <label
                      className={`btn btn-ghost w-full justify-center ${
                        uploadingPage === null ? "cursor-pointer" : "pointer-events-none opacity-50"
                      }`}
                    >
                      {uploadingPage === pageIndex ? "Subiendo…" : "Subir foto"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={uploadingPage !== null}
                        onChange={(change) => {
                          void uploadPhoto(pageIndex, change.target.files?.[0]);
                          change.target.value = "";
                        }}
                      />
                    </label>
                  )}
                  <button type="button" onClick={() => setPickerFor(pageIndex)} className="btn btn-ghost w-full justify-center">
                    Elegir de la web
                  </button>
                </div>
                {page.photo !== defaultPhoto && (
                  <button type="button" onClick={() => updatePage(pageIndex, { photo: defaultPhoto })} className={`${linkButton} mt-3`}>
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
      {notice && (
        <p role="status" className="border border-accent/60 px-5 py-4 text-sm leading-relaxed text-paper">
          {notice}
        </p>
      )}
      {!canSave && (
        <p className="border border-accent/50 bg-night-2 p-5 text-sm leading-relaxed text-muted-2">
          Para guardar cambios y subir fotos, conecta un almacenamiento Vercel Blob privado al proyecto y añade{" "}
          <code className="text-paper">BLOB_READ_WRITE_TOKEN</code> al entorno. Mientras tanto puedes editar, elegir fotos de la web y descargar el PDF.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={isGenerating} className="btn btn-accent disabled:cursor-wait disabled:opacity-60">
          {isGenerating ? "Generando PDF…" : "Descargar presentación"}
        </button>
        {canSave && (
          <button
            type="button"
            onClick={save}
            disabled={isSaving || !isDirty}
            className="btn btn-ghost disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Guardando…" : isDirty ? "Guardar cambios" : "Guardado"}
          </button>
        )}
        <button type="button" onClick={() => setPages(() => defaultPages(template))} className={linkButton}>
          Volver a los textos y fotos originales
        </button>
      </div>

      <dialog
        ref={pickerRef}
        onClose={() => setPickerFor(null)}
        aria-labelledby="photo-picker-title"
        className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto border border-line bg-night p-6 text-paper shadow-2xl backdrop:bg-night/80 md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="photo-picker-title" className="text-xl font-bold tracking-tight">
            Elegir foto de la web{pickerFor !== null && ` · ${PRESENTATION_PAGE_NAMES[pickerFor]}`}
          </h2>
          <button type="button" onClick={() => setPickerFor(null)} className="btn btn-ghost">Cerrar</button>
        </div>
        {pickerFor !== null &&
          [...photoGroups].map(([group, photos]) => (
            <div key={group} className="mt-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">{group}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {photos.map((photo) => (
                  <button
                    key={photo}
                    type="button"
                    onClick={() => {
                      updatePage(pickerFor, { photo });
                      setPickerFor(null);
                    }}
                    aria-label={`Usar ${photo.split("/").pop()}`}
                    aria-pressed={pages[pickerFor].photo === photo}
                    className={`relative aspect-[4/3] overflow-hidden border transition-colors hover:border-accent focus-visible:border-accent focus-visible:outline-none ${
                      pages[pickerFor].photo === photo ? "border-2 border-accent" : "border-line"
                    }`}
                  >
                    <Image src={photo} alt="" fill sizes="(min-width: 768px) 200px, 45vw" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ))}
      </dialog>
    </form>
  );
}
