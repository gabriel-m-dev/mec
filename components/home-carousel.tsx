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

/** Cada cuánto avanza solo. */
const AUTOPLAY_MS = 4000;
/** Recorrido mínimo del dedo para contar como gesto, en px. */
const SWIPE_THRESHOLD = 40;

/**
 * Carrusel de destacados de la portada.
 *
 * Es una PILA con fundido, no un riel que se desplaza. Esa decisión resuelve
 * dos cosas a la vez que el scroll nativo no podía:
 *
 * - El gesto avanza exactamente UNA diapositiva, por rápido que se deslice.
 *   Con `scroll-snap` la inercia del navegador se comía varias de un saque y
 *   terminaba en la última.
 * - La transición es de opacidad. Un riel, por definición, desliza.
 */
export function HomeCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [active, setActive] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const go = useCallback(
    (direction: 1 | -1) => {
      setActive((current) => (current + direction + slides.length) % slides.length);
    },
    [slides.length],
  );

  // Avance automático. Se apaga con el puntero encima —nadie quiere que se le
  // mueva lo que está leyendo— y con "reducir movimiento" activado, que es
  // exactamente lo que esa preferencia pide evitar.
  useEffect(() => {
    if (slides.length < 2 || paused || reduceMotion) return;
    const timer = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, paused, reduceMotion, go]);

  function onTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: React.TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;

    const delta = (event.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;

    // Un gesto = un paso. La distancia y la velocidad no multiplican nada.
    go(delta < 0 ? 1 : -1);
    setHasInteracted(true);
  }

  if (slides.length === 0) return null;

  const hasControls = slides.length > 1;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Destacados"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[21/9]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 ${
                reduceMotion ? "" : "transition-opacity duration-700 ease-out"
              } ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                sizes="100vw"
                priority={index === 0}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.2)_30%,rgba(2,5,12,0.85)_75%,rgba(2,5,12,0.97)_100%)]" />

              <div className="absolute inset-x-0 bottom-0">
                {/* En móvil el texto deja lugar para la pista de deslizar Y
                    para los puntos, que van debajo. */}
                <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 sm:pb-16 lg:px-8">
                  <h3 className="max-w-2xl font-serif text-2xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] sm:text-4xl">
                    {slide.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200 sm:mt-3 sm:text-base sm:leading-7">
                    {slide.description}
                  </p>
                  <Link
                    href={slide.href}
                    // Fuera de la diapositiva visible el enlace no debe recibir
                    // foco: se llega tabulando a algo que no se ve.
                    tabIndex={isActive ? undefined : -1}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-xs font-semibold text-ink-950 transition hover:-translate-y-0.5 hover:bg-gold-300 sm:mt-5 sm:text-sm"
                  >
                    Ir <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Pista de deslizar, solo en móvil y solo hasta que se use por
            primera vez: después de eso sería ruido sobre el contenido. */}
        {hasControls && !hasInteracted && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-12 flex justify-center sm:hidden"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.18em] text-white/85 backdrop-blur">
              <span className={reduceMotion ? "" : "animate-pulse"}>←</span>
              Deslizá
              <span className={reduceMotion ? "" : "animate-pulse"}>→</span>
            </span>
          </div>
        )}

        {hasControls && (
          <>
            <button
              type="button"
              onClick={() => {
                go(-1);
                setHasInteracted(true);
              }}
              aria-label="Destacado anterior"
              className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-950/50 text-white backdrop-blur transition hover:border-gold-300/50 hover:bg-ink-950/75 sm:grid"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => {
                go(1);
                setHasInteracted(true);
              }}
              aria-label="Destacado siguiente"
              className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-950/50 text-white backdrop-blur transition hover:border-gold-300/50 hover:bg-ink-950/75 sm:grid"
            >
              <span aria-hidden="true">→</span>
            </button>
          </>
        )}

        {hasControls && (
          <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => {
                  setActive(index);
                  setHasInteracted(true);
                }}
                aria-label={`Ir al destacado ${index + 1}: ${slide.title}`}
                aria-current={index === active}
                className={`h-1.5 rounded-full transition-all ${
                  index === active ? "w-7 bg-gold-300" : "w-2.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
