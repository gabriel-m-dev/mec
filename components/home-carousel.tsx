"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type CarouselSlide = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
};

/**
 * Carrusel de destacados de la portada.
 *
 * Se apoya en `scroll-snap` del navegador en vez de mover las diapositivas por
 * JavaScript: el arrastre con el dedo, la inercia y el teclado funcionan solos,
 * y si el JS todavía no hidrató las tarjetas ya se pueden recorrer. Las flechas
 * y los puntos solo empujan el scroll.
 */
export function HomeCarousel({ slides }: { slides: CarouselSlide[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  // La diapositiva activa se deduce de la posición real del scroll, no de un
  // contador propio: así el arrastre con el dedo también mueve los puntos.
  const syncActive = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActive(Math.max(0, Math.min(index, slides.length - 1)));
  }, [slides.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener("scroll", syncActive, { passive: true });
    return () => track.removeEventListener("scroll", syncActive);
  }, [syncActive]);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }, []);

  if (slides.length === 0) return null;

  const hasControls = slides.length > 1;

  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <ul
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {slides.map((slide) => (
              <li key={slide.id} className="w-full shrink-0 snap-center">
                <article className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 shadow-luxe">
                  <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
                    <Image
                      src={slide.image}
                      alt={slide.imageAlt}
                      fill
                      sizes="(min-width: 1280px) 1200px, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.15)_35%,rgba(2,5,12,0.82)_78%,rgba(2,5,12,0.95)_100%)]" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
                    <h3 className="max-w-2xl font-serif text-2xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] sm:text-3xl">
                      {slide.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200 sm:mt-3 sm:text-base sm:leading-7">
                      {slide.description}
                    </p>
                    <Link
                      href={slide.href}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-xs font-semibold text-ink-950 transition hover:-translate-y-0.5 hover:bg-gold-300 sm:mt-5 sm:text-sm"
                    >
                      Ir <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {hasControls && (
            <>
              <button
                type="button"
                onClick={() => goTo(Math.max(0, active - 1))}
                disabled={active === 0}
                aria-label="Destacado anterior"
                className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-950/60 text-white backdrop-blur transition hover:border-gold-300/50 hover:bg-ink-950/80 disabled:pointer-events-none disabled:opacity-0 sm:grid"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                onClick={() => goTo(Math.min(slides.length - 1, active + 1))}
                disabled={active === slides.length - 1}
                aria-label="Destacado siguiente"
                className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-950/60 text-white backdrop-blur transition hover:border-gold-300/50 hover:bg-ink-950/80 disabled:pointer-events-none disabled:opacity-0 sm:grid"
              >
                <span aria-hidden="true">→</span>
              </button>
            </>
          )}
        </div>

        {hasControls && (
          <div className="mt-5 flex justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ir al destacado ${index + 1}: ${slide.title}`}
                aria-current={index === active}
                className={`h-1.5 rounded-full transition-all ${
                  index === active ? "w-7 bg-gold-300" : "w-2.5 bg-white/25 hover:bg-white/45"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
