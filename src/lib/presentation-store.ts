import "server-only";

import { get, put } from "@vercel/blob";
import { readdirSync } from "node:fs";
import path from "node:path";
import {
  DEFAULT_PRESENTATION,
  LIMITS,
  MAX_BLOCKS,
  PRESENTATION_TEMPLATES,
  UPLOADED_PHOTO,
  type PresentationPage,
  type PresentationTemplate,
} from "./presentation";

// Saved presentations and uploaded photos live in a private Vercel Blob store.
// Locally, copy BLOB_READ_WRITE_TOKEN from the Vercel project into .env (see .env.example).
const PUBLIC_DIR = path.join(process.cwd(), "public");
const savedPath = (template: PresentationTemplate) => `presentaciones/${template}.json`;

export function isPresentationStoreConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isTemplate(value: unknown): value is PresentationTemplate {
  return typeof value === "string" && Object.hasOwn(PRESENTATION_TEMPLATES, value);
}

/** Every JPG/PNG under public/media, as "/media/..." paths (pdfkit can't embed WebP). */
export function getSitePhotos() {
  return (readdirSync(path.join(PUBLIC_DIR, "media"), { recursive: true }) as string[])
    .filter((file) => /\.(jpe?g|png)$/i.test(file))
    .map((file) => `/media/${file.split(path.sep).join("/")}`)
    .sort();
}

function isText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max;
}

/** Validates pages sent by the editor (or read from the store). Returns null when invalid. */
export function parsePages(value: unknown): PresentationPage[] | null {
  if (!Array.isArray(value) || value.length !== DEFAULT_PRESENTATION.length) return null;
  const sitePhotos = new Set(getSitePhotos());
  const pages: PresentationPage[] = [];

  for (const page of value) {
    if (
      typeof page !== "object" ||
      page === null ||
      !isText(page.photo, LIMITS.photo) ||
      !(sitePhotos.has(page.photo) || UPLOADED_PHOTO.test(page.photo)) ||
      !isText(page.section, LIMITS.section) ||
      !isText(page.eyebrow, LIMITS.eyebrow) ||
      !Array.isArray(page.blocks) ||
      page.blocks.length > MAX_BLOCKS ||
      !page.blocks.every(
        (b: unknown) =>
          typeof b === "object" && b !== null && "title" in b && "text" in b &&
          isText(b.title, LIMITS.title) && isText(b.text, LIMITS.text),
      )
    ) {
      return null;
    }
    pages.push({
      photo: page.photo,
      section: page.section,
      eyebrow: page.eyebrow,
      blocks: (page.blocks as PresentationPage["blocks"]).map(({ title, text }) => ({ title, text })),
    });
  }
  return pages;
}

/** The last saved version of a template, or null if none was saved (or the store isn't set up). */
export async function loadPresentation(template: PresentationTemplate) {
  if (!isPresentationStoreConfigured()) return null;
  try {
    const result = await get(savedPath(template), { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return null;
    return parsePages(await new Response(result.stream).json());
  } catch (error) {
    console.error("could not load saved presentation", template, error);
    return null;
  }
}

// ponytail: last save wins if two people save the same template at once; add ifMatch/ETag if that bites.
export async function savePresentation(template: PresentationTemplate, pages: PresentationPage[]) {
  await put(savedPath(template), JSON.stringify(pages), {
    access: "private",
    allowOverwrite: true,
    contentType: "application/json",
  });
}

// ponytail: replaced uploads are never deleted; clean presentaciones/fotos/ by hand if storage ever matters.
export async function saveUploadedPhoto(bytes: Buffer, extension: "jpg" | "png") {
  const pathname = `presentaciones/fotos/${crypto.randomUUID()}.${extension}`;
  await put(pathname, bytes, {
    access: "private",
    contentType: extension === "png" ? "image/png" : "image/jpeg",
  });
  return pathname;
}

export async function getUploadedPhoto(pathname: string) {
  if (!UPLOADED_PHOTO.test(pathname)) return null;
  const result = await get(pathname, { access: "private" });
  return result?.statusCode === 200 ? result : null;
}

/** A file path for site photos, the bytes for uploaded ones; ready for pdfkit's doc.image(). */
export async function readPhotoForPdf(photo: string): Promise<string | Buffer> {
  if (photo.startsWith("/media/")) return path.join(PUBLIC_DIR, photo);
  const result = await getUploadedPhoto(photo);
  if (!result) throw new Error(`Uploaded photo not found: ${photo}`);
  return Buffer.from(await new Response(result.stream).arrayBuffer());
}

/** Reads `{ template, pages }` JSON sent by the editor; null when missing, too big or invalid. */
export async function readPresentationRequest(request: Request) {
  const body = await request.text();
  if (Buffer.byteLength(body) > 64 * 1024) return null;
  let input: unknown;
  try {
    input = JSON.parse(body);
  } catch {
    return null;
  }
  if (typeof input !== "object" || input === null || !("template" in input) || !("pages" in input)) return null;
  const template = input.template;
  const pages = parsePages(input.pages);
  return isTemplate(template) && pages ? { template, pages } : null;
}
