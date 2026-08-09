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
  /** Texto del botón. Por defecto "Ir". */
  cta?: string;
  /** El enlace sale del sitio: se abre en una pestaña nueva. */
  external?: boolean;
};

/** Cada cuánto avanza solo. El reloj se reinicia con cada cambio manual. */
const AUTOPLAY_MS = 5000;
/** Recorrido mínimo del dedo para contar como gesto, en px. */
const SWIPE_THRESHOLD = 40;

/**
 * Dónde se está dibujando el carrusel.
 *
 * - `full`: a lo ancho de la página, debajo del hero. Es el de siempre.
 * - `card`: una tarjeta chica y cuadrada, metida en el hueco del medio del
 *   hero. Solo se usa en celular.
 *
 * La tarjeta no es el mismo carrusel "más chico": adentro de 288px de alto el
 * texto grande del `full` no entra, así que el título, la bajada y el botón
 * bajan de tamaño y la bajada se corta a dos renglones. Sin eso el contenido
 * desborda la tarjeta y tapa los puntos.
 */
export type CarouselVariant = "full" | "card";

/**
 * El lado MÁXIMO de la tarjeta en celular, en px — el 18rem de `w-[min(...)]`.
 * Solo se usa para el `sizes` de la imagen: en pantallas chicas la tarjeta es
 * más angosta, así que esto pide de más y nunca de menos.
 *
 * Va escrito acá y como literal en la clase de abajo a propósito: Tailwind
 * escanea el código como TEXTO, así que una clase armada con template string
 * (`w-[min(${x}rem,34svh)]`) no se genera nunca y el estilo desaparece sin dar
 * un solo error.
 */
const CARD_SIZE_PX = 288;

const VARIANTS = {
  full: {
    frame:
      "relative aspect-[4/5] w-full overflow-hidden sm:aspect-[21/9]",
    imageSizes: "100vw",
    textBox: "mx-auto max-w-7xl px-4 pb-24 sm:px-6 sm:pb-16 lg:px-8",
    title:
      "max-w-2xl font-serif text-2xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] sm:text-4xl",
    description: "mt-2 max-w-2xl text-sm leading-6 text-slate-200 sm:mt-3 sm:text-base sm:leading-7",
    cta: "mt-4 px-5 py-2.5 text-xs sm:mt-5 sm:text-sm",
    dots: "bottom-5",
    hint: "bottom-12",
    showArrows: true,
    // Va SIEMPRE debajo del hero, o sea fuera de la primera pantalla: pedirla
    // con prioridad la ponía a competir con la imagen de fondo del hero, que
    // es la que de verdad decide el LCP. Sin prioridad, las diapositivas
    // quedan en carga diferida y ni siquiera se bajan mientras esta instancia
    // está tapada en celular.
    priorityFirstSlide: false,
  },
  card: {
    // El lado es el MENOR entre 18rem y 34svh, no una medida fija. En un
    // teléfono alto manda 18rem y la tarjeta queda de 288px; en uno chico
    // manda el alto de pantalla y se achica sola. Con 288px fijos, un 360×640
    // no cierra: entre el texto, la tarjeta y los accesos no entra en una
    // pantalla y los accesos se caen abajo del pliegue.
    frame:
      "relative mx-auto aspect-square w-[min(18rem,34svh)] overflow-hidden rounded-3xl shadow-luxe ring-1 ring-white/15",
    imageSizes: `${CARD_SIZE_PX}px`,
    textBox: "px-4 pb-11",
    title:
      "font-serif text-lg leading-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]",
    description: "mt-1 line-clamp-2 text-xs leading-5 text-slate-200",
    cta: "mt-2.5 px-4 py-1.5 text-[11px]",
    dots: "bottom-3",
    hint: "bottom-8",
    // La tarjeta solo existe en celular, donde las flechas nunca se muestran:
    // dibujarlas sería DOM muerto.
    showArrows: false,
    // Esta sí entra en la primera pantalla: va adentro del hero.
    priorityFirstSlide: true,
  },
} as const satisfies Record<CarouselVariant, unknown>;

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
export function HomeCarousel({
  slides,
  variant = "full",
  className = "",
}: {
  slides: CarouselSlide[];
  variant?: CarouselVariant;
  /** Para que quien lo ubica decida en qué pantallas se muestra. */
  className?: string;
}) {
  const styles = VARIANTS[variant];
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

  // Avance automático. Se apaga con el puntero encima o el foco adentro:
  // nadie quiere que se le mueva lo que está leyendo.
  //
  // `active` está en las dependencias A PROPÓSITO: hace que el intervalo se
  // tire y se rearme en cada cambio, así el reloj arranca de cero. Sin eso,
  // cambiar de diapositiva a los 3 segundos dejaba solo 2 antes del salto
  // automático.
  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const timer = window.setTimeout(() => go(1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [slides.length, paused, active, go]);

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
      // El aire contra el hero solo tiene sentido cuando el carrusel va
      // DEBAJO del hero: sin él los dos bloques se leen como uno solo. La
      // tarjeta va adentro del hero y ahí el espacio lo reparte la grilla.
      className={`relative ${variant === "full" ? "mt-20 sm:mt-28" : ""} ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={styles.frame}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              // El fundido va SIEMPRE, también con "reducir movimiento". Esa
              // preferencia apunta al desplazamiento, el parallax y el giro —
              // lo que marea. Un cambio de opacidad no desplaza nada, y
              // apagarlo solo lograba que las diapositivas saltaran de golpe.
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                isActive ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                sizes={styles.imageSizes}
                priority={styles.priorityFirstSlide && index === 0}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.2)_30%,rgba(2,5,12,0.85)_75%,rgba(2,5,12,0.97)_100%)]" />

              <div className="absolute inset-x-0 bottom-0">
                {/* En móvil el texto deja lugar para la pista de deslizar Y
                    para los puntos, que van debajo. */}
                <div className={styles.textBox}>
                  <h3 className={styles.title}>{slide.title}</h3>
                  <p className={styles.description}>{slide.description}</p>
                  <Link
                    href={slide.href}
                    // Fuera de la diapositiva visible el enlace no debe recibir
                    // foco: se llega tabulando a algo que no se ve.
                    tabIndex={isActive ? undefined : -1}
                    // `noopener` no es opcional en un enlace externo con
                    // target: sin él la página destino puede manipular la
                    // nuestra a través de `window.opener`.
                    {...(slide.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={`inline-flex items-center gap-2 rounded-full bg-gold-400 font-semibold text-ink-950 transition hover:-translate-y-0.5 hover:bg-gold-300 ${styles.cta}`}
                  >
                    {slide.cta ?? "Ir"} <span aria-hidden="true">→</span>
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
            className={`pointer-events-none absolute inset-x-0 flex justify-center sm:hidden ${styles.hint}`}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.18em] text-white/85 backdrop-blur">
              <span className={reduceMotion ? "" : "animate-pulse"}>←</span>
              Deslizá
              <span className={reduceMotion ? "" : "animate-pulse"}>→</span>
            </span>
          </div>
        )}

        {hasControls && styles.showArrows && (
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
          <div className={`absolute inset-x-0 flex justify-center gap-2 ${styles.dots}`}>
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
