# Writing blog posts for Harvest Moon

Instructions for agents that create or edit posts in `content/blog/`. Follow them exactly; when something here conflicts with a general writing habit, this file wins.

Harvest Moon is a DJ and events agency in Barcelona. The blog's job is to bring in couples and event organisers planning a celebration, show that Harvest Moon understands parties, and lead them to ask for a quote. Every post should be useful on its own and connect back to music and the dance floor.

## 1. Language and voice

- **Spanish from Spain.** Readers are couples in Barcelona and the rest of Spain. Use "tú" for the reader ("tu boda", "tus invitados"). When addressing the couple, "vosotros" is fine but use it sparingly; most sentences read better in "tú". Never use voseo ("podés", "tenés") or "ustedes" in posts. (The owners are Argentine, and internal docs for them use voseo. The public site does not.)
- **Energetic, personal, polished.** Write like a DJ who has played 800 weddings telling a friend what works. Warm and confident, never salesy.
- **Concrete over generic.** Song names, decades, moments of the night ("la entrada al banquete", "el primer baile", "las dos de la madrugada"), numbers with units. A sentence that could appear in any wedding blog should be rewritten or cut.
- **Short paragraphs.** Two to four sentences. Sentences under ~25 words.
- **Bold** one key phrase per paragraph at most.
- **Sentence case in titles and headings**, as Spanish does: "Ideas para una boda temática", not "Ideas Para una Boda Temática". (Some older posts use title case; don't copy that.)
- **Avoid:** emoji; strings of exclamation marks; "En el mundo de hoy", "Sin lugar a dudas", "Descubre por qué…", "¡No te lo pierdas!", "En conclusión"; rhetorical-question openers; filler lists of adjectives; anglicisms when a common Spanish word exists. "Wedding planner", "playlist", "DJ" and trend names in English (Quiet luxury, Y2K) are fine.
- **The music angle.** Where it fits, end a section with a short **"Cómo suena:"** paragraph that translates the topic into music, lighting or the timing of the night. Don't force it into every section. Mention Harvest Moon itself once or twice at most, usually in the last section.

## 2. File and frontmatter

One file per post: `content/blog/<slug>.md`. The slug is the URL (`/blog-de-novedades/<slug>`): lowercase, hyphens, no accents or ñ, short (`tendencias-boda-2027`, `canciones-primer-baile`).

```yaml
---
title: "Tendencias de boda 2027: lo que viene (y cómo suena)"
date: 2026-11-21
cover: /media/blog/<slug>.jpg
excerpt: "One or two sentences, max ~200 characters, that make people click."
---
```

- `title`: 40–70 characters, sentence case, quoted.
- `date`: `YYYY-MM-DD`, normally today. Posts are sorted by this date, newest first. There is no scheduling: a future date is published immediately.
- `cover`: required. See section 4.
- `excerpt`: shown in the blog list, on the home page and in link previews. Don't repeat the title.

Don't add other frontmatter keys; nothing reads them.

## 3. Body structure

The post page turns the Markdown into a layout automatically (`spreads()` in `src/app/blog-de-novedades/[slug]/page.tsx`). Write for that layout:

```markdown
Intro paragraph: the hook. It renders larger than the rest, so make it the strongest sentence of the post.

Second intro paragraph (optional): what the post covers.

## 1. First section title

![Alt text in Spanish](/media/blog/<slug>/photo.jpg)

Section text…

**Cómo suena:** …

## 2. Second section title

Section text with no image…

![Wide photo alt](/media/blog/<slug>/wide.jpg "ancho")

## ¿Con cuál te quedas?

Closing paragraph and a call to action: [cuéntanoslo](/contact).
```

Rules:

- **Intro:** 1–2 paragraphs before the first heading, no heading above them.
- **Sections:** `##` only. Never `#` (the title already is H1). `###` is allowed inside a section but creates no new section.
- **Numbered sections:** start the heading with `1. `, `2. `… and the number renders as a small purple label ("01"). Use numbering for lists of ideas, trends, venues or steps; leave it off for argument-style sections.
- **Closing section:** a short wrap-up with a link to `/contact`. Phrase the CTA naturally ("cuéntanoslo", "escríbenos y lo vemos"), not "¡Contáctanos ya!".
- **Length:** 700–1,400 words, 5–10 sections. Several short sections beat a few long ones.
- **Plain Markdown only:** paragraphs, `##`, bold, italics, links, lists, images. No raw HTML, tables or embeds. Posts must stay editable in Pages CMS (`.pages.yml`, `format: markdown`).
- **Sources:** if the post draws on a report, article or data, rewrite it in your own words (never copy paragraphs), check the figures, and end with an italic credit line: `*Fuente: … Fotografías: …*`.

## 4. Images

### How the layout uses them

| What you write | What renders |
| --- | --- |
| An image alone on its own line, **directly under a `##` heading** | Side photo next to the section text. Sides alternate automatically: first right, then left. Cropped to **4:5 portrait**. On mobile it sits above the text. |
| Same, with `"ancho"` as the image title: `![alt](src "ancho")` | Full-width break across the page, cropped to **21:9** (16:9 on mobile). |
| A section with no image | Text centered on the page. |
| `cover` in frontmatter | 21:9 banner at the top of the post and a cropped card in the blog list. |

Only the **first** image in a section becomes the side photo. Use one per section at most, and not every section needs one: mixing image and text-only sections gives the post rhythm. Put `"ancho"` images at the end of a section **that has no side photo**, after its text, with one or two per post at most. Side images must have their own line, with a blank line before and after.

### Choosing images

- **Fit:** each image must match its section's topic. A rough fit is worse than none; leave the section text-only instead.
- **Shape:** side photos look best **portrait**. Landscape works only if the subject is in the middle third. Wide (`"ancho"`) photos and the cover must be **landscape**, with the subject centered (faces survive a 21:9 crop only near the vertical middle).
- **Resolution:** at least 1,200 px on the long side for side photos and 1,800 px wide for the cover and `"ancho"` images.
- **No duplicates:** don't reuse another post's cover. Inside one post, don't use an image twice.

### Where images can come from, in order of preference

1. **Harvest Moon's own photos:** `public/media/pages/bodas/` (real weddings, already enhanced), `public/media/pages/`, `public/media/artistas/` (the DJs). Reference them in place; don't copy them.
2. **The owner's source folder:** `imgs/` (not served). The `*-unsplash.jpg` files and the DJ photos are safe to use.
3. **Unsplash, free licence only.** Check the photo page says "Free to use under the Unsplash License". **Never** use "Unsplash+" photos (paid). Download: `https://unsplash.com/photos/<id>/download?force=true&w=2000`.

Never use iStock, Shutterstock, Freepik or Getty images, anything with a watermark, screenshots of other companies' materials (unless the user explicitly asks and accepts the risk), or AI-generated images presented as real weddings. Avoid trademarked imagery (franchise castles, logos) except in a post that discusses that franchise, and tell the user when you use it.

### Processing

Store a post's images in `public/media/blog/<slug>/<descriptive-name>.jpg` and its cover at `public/media/blog/<slug>.jpg`. Reference them without `public`: `/media/blog/<slug>/name.jpg`.

```bash
# Resize, strip metadata, progressive JPEG (~150–400 KB)
magick input.jpg -auto-orient -resize "1800x1800>" -strip -interlace Plane -quality 82 public/media/blog/<slug>/name.jpg

# Small or soft source (< 1200 px): upscale gently and sharpen
magick input.jpg -auto-orient -filter Lanczos -resize 1800x1800 -unsharp 0x1+0.5+0.01 -strip -interlace Plane -quality 82 out.jpg

# Pre-crop when the automatic center crop would cut the subject (example: 4:5 anchored to the bottom)
magick input.jpg -gravity south -crop 2000x2500+0+0 +repage -resize 1600x2000 -strip -quality 82 out.jpg
```

In zsh, quote frame selectors as `"${f}[0]"` rather than `"$f[0]"`.

### Alt text

Every image gets Spanish alt text: a plain description of what's in the photo, 4–12 words ("Novios bailando en la pista entre invitados"). No "imagen de", no keywords stuffed in.

## 5. Check before you finish

1. Every image path resolves:
   ```bash
   grep -o '(/media[^) ]*' content/blog/<slug>.md | tr -d '(' | while read p; do test -f "public$p" && echo "ok $p" || echo "MISSING $p"; done
   ```
2. With `npm run dev` running, open `http://localhost:3000/blog-de-novedades/<slug>` and look at it at desktop width (a headless Chrome screenshot is fine). Check that side photos aren't cropping off heads, that "ancho" images look good at 21:9, and that headings render as sections.
3. Reread the text once against section 1: Spain Spanish, sentence-case headings, no banned phrases, short paragraphs, the CTA at the end.
4. Tell the user which images came from where (own, `imgs/`, Unsplash with links) and flag anything with licence or trademark questions.

Don't commit unless the user asks.
