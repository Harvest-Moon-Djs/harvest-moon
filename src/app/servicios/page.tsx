import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPage } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Servicios de DJ, iluminación y sonido para eventos",
  description: "DJ, planificación del timing, iluminación y efectos (CO2, humo, confeti) para bodas y eventos en Barcelona. Presupuesto a medida.",
};

type Servicios = { blocks: { title: string; image: string; alt?: string; text: string }[] };

export default function Servicios() {
  const page = getPage<Servicios>("servicios");
  return (
    <>
      <section className="mx-auto max-w-[1400px] px-5 pt-16 md:px-12 md:pt-24">
        <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-7xl">{page.title}</h1>
        <p className="mt-6 max-w-[55ch] text-lg text-muted-2">{page.subtitle}</p>
      </section>
      {SERVICE_PAGES.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pt-16 md:px-12 md:pt-20">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">Por tipo de evento</h2>
          <ul className="mt-4 border-t border-line">
            {SERVICE_PAGES.map((s) => (
              <li key={s.href} className="border-b border-line">
                <Link href={s.href} className="group flex items-center justify-between py-6 text-3xl font-black tracking-tight hover:text-accent md:text-5xl">
                  {s.label}
                  <span aria-hidden className="transition-transform group-hover:translate-x-2">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-12 md:py-24">
        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {page.blocks.map((b) => (
            <div key={b.title} className="reveal">
              <div className="relative aspect-[4/3] overflow-hidden bg-night-2">
                <Image src={b.image} alt={b.alt ?? ""} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </div>
              <h2 className="mt-6 text-2xl font-black tracking-tight">{b.title}</h2>
              <p className="mt-3 leading-relaxed text-muted-2">{b.text}</p>
            </div>
          ))}
        </div>
        <Link href="/contact" className="btn btn-accent mt-16">Pedir presupuesto</Link>
      </section>
    </>
  );
}
