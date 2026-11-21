import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { SITE_URL, formatDate, getPost, getPosts } from "@/lib/content";

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog-de-novedades/[slug]">): Promise<Metadata> {
  const p = getPost((await params).slug);
  return p ? { title: p.title, description: p.excerpt, openGraph: { type: "article", publishedTime: p.date, images: [p.cover] } } : {};
}

// Each "## " section becomes a spread: its first image sits beside the text, alternating sides.
// ![alt](src "ancho") stays in the flow as a full-width break. "## 3. Title" gets its number as a small label.
function spreads(html: string) {
  let flip = 0;
  return html.split(/(?=<h2>)/).map((chunk) => {
    chunk = chunk
      .replace(/<h2>(\d+)\.\s*/, (_, n: string) => `<h2><span class="post-num">${n.padStart(2, "0")}</span>`)
      .replace(/<p><img ([^>]*?) title="ancho"><\/p>/g, '<p class="fig-wide"><img $1></p>');
    const fig = chunk.match(/<p><img [^>]*><\/p>/)?.[0];
    if (!fig) return `<section class="post-sec">${chunk}</section>`;
    return `<section class="post-sec has-fig${flip++ % 2 ? " flip" : ""}"><div class="post-fig">${fig}</div><div class="post-txt">${chunk.replace(fig, "")}</div></section>`;
  }).join("");
}

export default async function Post({ params }: PageProps<"/blog-de-novedades/[slug]">) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  const html = spreads(p.html);
  const related = getPosts().filter((x) => x.slug !== p.slug).slice(0, 2);
  // Article markup so Google can show the date and cover image in results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    image: SITE_URL + p.cover,
    datePublished: p.date,
    mainEntityOfPage: `${SITE_URL}/blog-de-novedades/${p.slug}`,
    author: { "@type": "Organization", name: "Harvest Moon", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Harvest Moon", url: SITE_URL },
  };

  return (
    <article className="bg-paper text-night">
      <div className="mx-auto max-w-350 px-5 pt-16 md:px-12 md:pt-24">
        <time dateTime={p.date} className="text-sm text-night/60">{formatDate(p.date)}</time>
        <h1 className="mt-3 max-w-[20ch] text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-7xl">{p.title}</h1>
        <div className="relative mt-12 aspect-21/9 overflow-hidden">
          <Image src={p.cover} alt={p.title} fill priority sizes="100vw" className="object-cover" />
        </div>
      </div>
      <div className="mx-auto max-w-350 px-5 py-16 md:px-12 md:py-20">
        <div className="prose prose-paper prose-post" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {related.length > 0 && (
        <aside className="mx-auto max-w-350 border-t border-night/10 px-5 py-16 md:px-12 md:py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">Sigue leyendo</h2>
            <Link href="/blog-de-novedades" className="text-sm font-semibold underline underline-offset-4">Todos los artículos</Link>
          </div>
          <div className="mt-10 grid gap-x-6 gap-y-14 md:grid-cols-2">
            {related.map((r) => <PostCard key={r.slug} p={r} />)}
          </div>
        </aside>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
