"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Testimonial } from "@/lib/content";

// Desktop: the heading and quote stick on the left while the names scroll past on the right;
// whichever name crosses the middle of the screen picks the quote.
// Below lg nothing sticks: the quotes are just stacked and scroll like the rest of the page.
// To linger longer per quote, raise the name height (h-[55dvh]); the column padding
// (22.5dvh - 2.25rem) is half a screen minus half a name, so first and last names land mid-screen.
export function Testimonials({
  items,
  background,
}: {
  items: Testimonial[];
  background: string;
}) {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) =>
            e.isIntersecting &&
            setActive(Number((e.target as HTMLElement).dataset.i)),
        ),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    steps.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) =>
    steps.current[i]?.scrollIntoView({
      block: "center",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });

  return (
    <section
      aria-labelledby="testimonios"
      className="relative isolate overflow-clip"
    >
      <div className="sticky top-18 -z-10 h-[calc(100dvh-4.5rem)] overflow-hidden">
        <Image
          src={background}
          alt=""
          fill
          sizes="100vw"
          className="drift object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-linear-to-b from-night via-night/60 to-night" />
      </div>

      <div className="mx-auto -mt-[calc(100dvh-4.5rem)] w-full max-w-350 px-5 md:px-12 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        <div className="py-20 lg:sticky lg:top-18 lg:flex lg:h-[calc(100dvh-4.5rem)] lg:flex-col lg:justify-center lg:py-0">
          <h2
            id="testimonios"
            className="text-4xl font-black tracking-[-0.035em] md:text-6xl"
          >
            Lo que dicen <span className="text-accent">de nosotros</span>
          </h2>

          <div className="mt-8 grid gap-14 md:mt-14 lg:gap-0">
            {items.map((t, i) => (
              <figure
                key={t.slug}
                className={`lg:[grid-area:1/1] lg:transition lg:duration-700 lg:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                  i === active
                    ? ""
                    : i < active
                      ? "lg:pointer-events-none lg:-translate-y-6 lg:opacity-0"
                      : "lg:pointer-events-none lg:translate-y-6 lg:opacity-0"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="block h-12 text-[6rem] font-black leading-none text-accent md:h-20 md:text-[10rem]"
                >
                  “
                </span>
                <blockquote className="max-w-[40ch] text-xl font-bold leading-[1.2] tracking-[-0.02em] sm:text-2xl md:text-4xl md:leading-[1.15] lg:text-[2.75rem]">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4 md:mt-8 lg:hidden">
                  <span className="h-px w-10 bg-accent" />
                  <span>
                    <span className="block text-lg font-black tracking-tight">
                      {t.name}
                    </span>
                    <span className="block text-sm text-muted-2">
                      {t.event}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="hidden py-[calc(22.5dvh-2.25rem)] lg:block">
          {items.map((t, i) => (
            <button
              key={t.slug}
              data-i={i}
              ref={(el) => {
                steps.current[i] = el;
              }}
              aria-current={i === active}
              onClick={() => goTo(i)}
              className={`group flex h-[55dvh] w-full flex-col justify-center border-l-2 pl-6 text-left transition-colors duration-500 ${
                i === active
                  ? "border-accent text-paper"
                  : "border-paper/20 text-muted hover:text-paper"
              }`}
            >
              <span className="text-2xl font-black tracking-tight xl:text-3xl">
                {t.name}
              </span>
              <span className="mt-1 text-sm text-muted">{t.event}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
