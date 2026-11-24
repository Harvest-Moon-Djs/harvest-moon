import PDFDocument from "pdfkit";
import path from "node:path";
import { SITE_URL, getSite } from "@/lib/content";
import { PRESENTATION_TEMPLATES, type CoverLayout, type PresentationPage } from "@/lib/presentation";
import { readPhotoForPdf, readPresentationRequest } from "@/lib/presentation-store";
import { isQuoteAuthenticated } from "@/lib/quote-auth";

export const runtime = "nodejs";

// Layout measured from texts/Harvest-Moon-presentacion-boda.pdf.
const MARGIN = 48;
const NIGHT = "#0a0820";
const ACCENT = "#8f84ff";
const PAPER = "#f2f0ff";
const MUTED = "#c4c0e6";
const PHOTO_HEIGHT = 240;
const BAND_HEIGHT = 38;
type GenerateOptions = { cover: CoverLayout; coverFromLeft: boolean };

function generatePresentationPdf(pages: PresentationPage[], photos: (string | Buffer)[], { cover, coverFromLeft }: GenerateOptions) {
  const site = getSite();
  const website = SITE_URL.replace(/^https?:\/\//, "");

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      autoFirstPage: false,
      info: { Title: `Presentación · ${site.name}`, Author: site.name },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.registerFont("ArchivoBlack", path.join(process.cwd(), "src/lib/fonts/Archivo-Black.ttf"));

    const width = 595.28;
    const height = 841.89;
    const contentWidth = width - MARGIN * 2;
    const footerTop = 770;

    function drawPhoto(source: string | Buffer, y: number, h: number, align?: "center") {
      doc.save();
      doc.rect(0, y, width, h).clip();
      doc.image(source, 0, y, { cover: [width, h], align, valign: "center" });
      doc.restore();
    }

    function drawFooter(index: number) {
      const contact = site.email ? `${website}   |   ${site.email}` : website;
      doc.font("Helvetica").fontSize(9.5);
      const x = (width - doc.widthOfString(contact)) / 2;
      doc.fillColor("#aea5ff").text(site.email ? `${website}   |   ` : website, x, 778, { continued: !!site.email, lineBreak: false });
      if (site.email) doc.fillColor("#dedced").text(site.email, { lineBreak: false });
      doc.moveTo(MARGIN, 798.9).lineTo(width - MARGIN, 798.9).lineWidth(0.6)
        .strokeColor("#ffffff").strokeOpacity(0.25).stroke().strokeOpacity(1);
      doc.font("Helvetica-Bold").fontSize(8).fillColor(PAPER)
        .text(site.name.toUpperCase(), MARGIN, 811, { characterSpacing: 0.8, lineBreak: false });
      const count = `${String(index + 1).padStart(2, "0")} / ${String(pages.length).padStart(2, "0")}`;
      doc.font("Helvetica").fontSize(8).fillColor(MUTED)
        .text(count, width - MARGIN - doc.widthOfString(count), 811, { lineBreak: false });
    }

    // Titles + bodies. Scales everything down until it fits above the footer; text past the
    // footer is clipped (height option) so pdfkit never spills onto an extra page.
    function drawBlocks(blocks: PresentationPage["blocks"], top: number, firstTitleSize: number, bodyColor: string) {
      const bottom = footerTop - 20;
      const layout = (scale: number, draw: boolean) => {
        let y = top;
        blocks.forEach((block, i) => {
          if (i > 0) y += 34 * scale;
          const parts = [
            block.title && { value: block.title, font: "ArchivoBlack", size: (i === 0 ? firstTitleSize : 20) * scale, color: PAPER, lineGap: -4 * scale, after: 12 * scale },
            block.text && { value: block.text, font: "Helvetica", size: 10.4 * scale, color: bodyColor, lineGap: 4.2 * scale, after: 0 },
          ];
          for (const part of parts) {
            if (!part) continue;
            doc.font(part.font).fontSize(part.size);
            const options = { width: contentWidth, lineGap: part.lineGap };
            if (draw) {
              if (y >= bottom) return;
              doc.fillColor(part.color).text(part.value, MARGIN, y, { ...options, height: bottom - y });
              y = doc.y + part.after;
            } else {
              y += doc.heightOfString(part.value, options) + part.after;
            }
          }
        });
        return y;
      };

      let scale = 1;
      while (scale > 0.5 && layout(scale, false) > bottom) scale -= 0.04;
      layout(scale, true);
    }

    pages.forEach((page, index) => {
      doc.addPage({ size: "A4", margin: 0 });
      doc.rect(0, 0, width, height).fill(NIGHT);

      if (index === 0) {
        // The template's own cover is framed from the left (pdfkit default) like the original PDFs; others are centred.
        const align = coverFromLeft ? undefined : "center";
        if (cover === "half") {
          // Temática: plain night background behind the text, photo in a band above the footer.
          drawPhoto(photos[0], 370, 390, align);
        } else {
          drawPhoto(photos[0], 0, height, align);
          // Darken the top for the headline and the bottom for the footer, like the original boda cover.
          const top = doc.linearGradient(0, 0, 0, height * 0.6);
          top.stop(0, NIGHT, 0.68).stop(0.35, NIGHT, 0.6).stop(0.5, NIGHT, 0.47)
            .stop(0.67, NIGHT, 0.27).stop(0.85, NIGHT, 0.08).stop(1, NIGHT, 0);
          doc.rect(0, 0, width, height * 0.6).fill(top);
          const bottom = doc.linearGradient(0, height - 120, 0, height);
          bottom.stop(0, NIGHT, 0).stop(1, NIGHT, 0.7);
          doc.rect(0, height - 120, width, 120).fill(bottom);
        }

        doc.rect(0, 0, width, 7).fill(ACCENT);
        doc.font("ArchivoBlack").fontSize(16).fillColor(PAPER)
          .text(site.name.toUpperCase(), MARGIN, 40, { characterSpacing: 0.6, lineBreak: false });
        if (page.eyebrow) {
          doc.font("Helvetica-Bold").fontSize(8).fillColor(ACCENT)
            .text(page.eyebrow.toUpperCase(), MARGIN, 66, { characterSpacing: 1.45, lineBreak: false });
        }
        doc.rect(MARGIN, 105, 42, 4).fill(ACCENT);
        drawBlocks(page.blocks, 124, 30, "#cfcdeb");
      } else {
        drawPhoto(photos[index], 0, PHOTO_HEIGHT, "center");
        doc.rect(0, PHOTO_HEIGHT - BAND_HEIGHT, width, BAND_HEIGHT).fillOpacity(0.55).fill(NIGHT).fillOpacity(1);
        doc.rect(0, PHOTO_HEIGHT - 4, width, 4).fill(ACCENT);
        const band = page.section ? `${site.name.toUpperCase()}     /     ${page.section.toUpperCase()}` : site.name.toUpperCase();
        doc.font("Helvetica-Bold").fontSize(8).fillColor(PAPER)
          .text(band, MARGIN, PHOTO_HEIGHT - BAND_HEIGHT + 14, { characterSpacing: 1.15, lineBreak: false });

        let y = PHOTO_HEIGHT + 27;
        if (page.eyebrow) {
          doc.font("Helvetica-Bold").fontSize(8).fillColor(ACCENT)
            .text(page.eyebrow.toUpperCase(), MARGIN, y, { characterSpacing: 2.4, lineBreak: false });
          y += 19;
        }
        drawBlocks(page.blocks, y, 24, MUTED);
      }

      drawFooter(index);
    });

    doc.end();
  });
}

export async function POST(request: Request) {
  if (!(await isQuoteAuthenticated())) {
    return Response.json({ error: "Tu sesión ha caducado. Inicia sesión de nuevo." }, { status: 401 });
  }

  const input = await readPresentationRequest(request);
  if (!input) {
    return Response.json({ error: "Revisa los textos: alguno es demasiado largo o está incompleto." }, { status: 400 });
  }
  const { template, pages } = input;

  try {
    const photos = await Promise.all(pages.map((page) => readPhotoForPdf(page.photo)));
    const { cover, pages: defaults } = PRESENTATION_TEMPLATES[template];
    // Trim and drop empty blocks only for the PDF; the editor keeps what was typed.
    const printable = pages.map((page) => ({
      ...page,
      section: page.section.trim(),
      eyebrow: page.eyebrow.trim(),
      blocks: page.blocks
        .map((block) => ({ title: block.title.trim(), text: block.text.trim() }))
        .filter((block) => block.title || block.text),
    }));
    const pdf = await generatePresentationPdf(printable, photos, {
      cover,
      coverFromLeft: pages[0].photo === defaults[0].photo,
    });
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="presentacion-harvest-moon.pdf"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("presentation pdf generation failed", error);
    return Response.json({ error: "No se pudo generar el PDF. Inténtalo de nuevo más tarde." }, { status: 500 });
  }
}
