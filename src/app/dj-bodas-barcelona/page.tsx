import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArtistCard } from "@/components/ArtistCard";
import { PostCard } from "@/components/PostCard";
import { Testimonials } from "@/components/Testimonials";
import { getArtists, getPage, getPosts, getTestimonials } from "@/lib/content";

export const metadata: Metadata = {
  title: "DJ para bodas en Barcelona",
  description: "DJs para bodas en Barcelona y Cataluña: sonido, iluminación y una pista llena hasta el final. Música a vuestro gusto. Pide presupuesto sin compromiso.",
};

type Item = { title: string; text: string };
type Bodas = {
  moments: Item[];
  includes: Item[];
  includesImage: string;
  includesImageAlt: string;
  faq: { q: string; a: string }[];
};

export default function BodasPage() {
  const page = getPage<Bodas>("bodas");
  const artists = getArtists().slice(0, 3);
  const posts = getPosts().slice(0, 2);
  const testimonials = getTestimonials();
  // FAQ markup so Google can show the questions directly in results.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <section className="relative isolate flex min-h-[75dvh] items-end overflow-hidden md:max-h-200 md:min-h-[85vh]">
        <Image src={page.image!} alt={page.imageAlt ?? ""} fill priority sizes="100vw" className="drift -z-20 object-cover object-[50%_75%] grayscale" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-night via-night/55 to-night/20" />
        <div className="mx-auto w-full max-w-350 px-5 pt-32 pb-14 md:px-12 md:pb-20">
          <h1 className="enter max-w-[14ch] text-5xl md:max-w-[9ch] font-black leading-[0.95] tracking-[-0.04em] md:text-8xl">{page.title}</h1>
          {page.subtitle && <p className="enter mt-6 max-w-[55ch] text-lg md:max-w-[38ch] leading-relaxed text-muted-2" style={{ "--d": "120ms" } as React.CSSProperties}>{page.subtitle}</p>}
          <div className="enter mt-9 flex flex-wrap gap-3" style={{ "--d": "240ms" } as React.CSSProperties}>
            <Link href="/contact" className="btn btn-accent">Pedir presupuesto</Link>
            <Link href="/artistas" className="btn btn-ghost">Ver DJs</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-350 px-5 py-20 md:px-12 md:py-24">
        <div className="reveal prose prose-lg" dangerouslySetInnerHTML={{ __html: page.html }} />
      </section>

      <section className="border-y border-line">
        <div className="mx-auto max-w-350 px-5 pt-20 md:px-12 md:pt-24">
          <h2 className="reveal text-4xl font-black tracking-[-0.035em] md:text-6xl">Así suena la noche</h2>
        </div>
        <ol className="mx-auto mt-12 grid max-w-350 md:grid-cols-5">
          {page.moments.map((m, i) => (
            <li key={m.title} className="reveal border-t border-line px-5 py-8 md:border-t-0 md:border-l md:px-6 md:pb-24 md:first:border-l-0 md:first:pl-12">
              <span className="text-sm font-semibold text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-2xl font-black tracking-tight">{m.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-2">{m.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto grid max-w-350 gap-12 px-5 py-20 md:grid-cols-[2fr_3fr] md:items-center md:px-12 md:py-24">
        <div className="reveal relative aspect-4/5 overflow-hidden bg-night-2">
          <Image src={page.includesImage} alt={page.includesImageAlt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 className="reveal text-4xl font-black tracking-[-0.035em] md:text-6xl">Qué incluye</h2>
          <ul className="mt-10 space-y-7">
            {page.includes.map((x) => (
              <li key={x.title} className="reveal">
                <h3 className="text-xl font-black tracking-tight">{x.title}</h3>
                <p className="mt-1.5 leading-relaxed text-muted-2">{x.text}</p>
              </li>
            ))}
          </ul>
          <Link href="/servicios" className="reveal mt-10 inline-block font-semibold underline underline-offset-4 hover:text-accent">Más sobre nuestros servicios</Link>
        </div>
      </section>

      {testimonials.length > 0 && <Testimonials items={testimonials} background="/media/pages/bodas/beso-pista.jpg" />}

      <section className="mx-auto max-w-350 px-5 py-20 md:px-12 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="reveal text-4xl font-black tracking-[-0.035em] md:text-6xl">Nuestros DJs de bodas</h2>
          <Link href="/artistas" className="btn btn-ghost h-10 px-4 text-sm">Ver todos</Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {artists.map((a) => <ArtistCard key={a.slug} a={a} />)}
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-350 gap-10 px-5 py-20 md:grid-cols-[2fr_3fr] md:px-12 md:py-24">
          <h2 className="reveal text-4xl font-black tracking-[-0.035em] md:text-6xl">Preguntas frecuentes</h2>
          <div className="divide-y divide-line border-y border-line">
            {page.faq.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl font-black tracking-tight hover:text-accent [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="text-2xl text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-[60ch] leading-relaxed text-muted-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper text-night">
        <div className="mx-auto max-w-350 px-5 py-20 md:px-12 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="reveal text-4xl font-black tracking-[-0.035em] md:text-6xl">Ideas para tu boda</h2>
            <Link href="/blog-de-novedades" className="btn btn-ink h-10 px-4 text-sm">Ver el blog</Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {posts.map((p) => <PostCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-350 px-5 py-24 text-center md:px-12 md:py-32">
        <h2 className="reveal mx-auto max-w-[18ch] text-4xl font-black tracking-[-0.035em] md:text-6xl">¿Hablamos de tu boda?</h2>
        <p className="reveal mx-auto mt-6 max-w-[50ch] text-lg text-muted-2">Cuéntanos la fecha, el lugar y la música que os gusta. Te respondemos con una propuesta a medida.</p>
        <Link href="/contact" className="btn btn-accent mt-10">Pedir presupuesto</Link>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
