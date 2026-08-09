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
 * - `full`: debajo del hero, en pantallas grandes.
 * - `card`: metido en el hueco del medio del hero. Solo en celular.
 *
 * La tarjeta no es el mismo carrusel "más chico": adentro de 210px de lado el
 * texto grande del `full` no entra, así que el título, la bajada y el botón
 * bajan de tamaño y la bajada se corta a dos renglones.
 */
export type CarouselVariant = "full" | "card";

/**
 * El lado de la tarjeta en celular, en px. Se usa para el `sizes` de la
 * imagen; el ancho real lo pone `slideWidth`, que dice lo mismo.
 *
 * Va en PÍXELES y no en `rem` a propósito: es una medida que se pidió exacta.
 * En `rem` quedaría atada al 82.5% de celular y cambiaría sola si algún día se
 * toca ese porcentaje.
 */
const CARD_SIZE_PX = 210;

const VARIANTS = {
  full: {
    /**
     * Ancho de UNA diapositiva. Va como texto y no como número porque entra
     * en `calc()`: así el ancho puede depender del viewport sin que el
     * componente tenga que medir nada en JavaScript.
     */
    slideWidth: "min(66vw, 56rem)",
    slideGap: "1.5rem",
    frame: "aspect-[21/9] overflow-hidden rounded-2xl ring-1 ring-white/10",
    // 56rem son 896px, y 66vw llega a 896 cuando el viewport mide 1358.
    // Arriba de ahí manda el tope y pedir 66vw seria pedir de mas.
    imageSizes: "(min-width: 1358px) 896px, 66vw",
    textBox: "mx-auto max-w-7xl px-6 pb-10 lg:px-10",
    title:
      "max-w-2xl font-serif text-2xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] sm:text-4xl",
    description: "mt-2 max-w-2xl text-sm leading-6 text-slate-200 sm:mt-3 sm:text-base sm:leading-7",
    cta: "mt-4 px-5 py-2.5 text-xs sm:mt-5 sm:text-sm",
    dots: "mt-5",
    showArrows: true,
    // Va SIEMPRE debajo del hero, o sea fuera de la primera pantalla: pedirla
    // con prioridad la ponía a competir con la imagen de fondo del hero, que
    // es la que de verdad decide el LCP.
    priorityFirstSlide: false,
  },
  card: {
    slideWidth: "210px",
    slideGap: "12px",
    frame: "aspect-square overflow-hidden rounded-3xl shadow-luxe ring-1 ring-white/15",
    imageSizes: `${CARD_SIZE_PX}px`,
    // Sin puntos adentro que esquivar, el texto baja hasta el borde.
    textBox: "px-4 pb-4",
    title:
      "font-serif text-lg leading-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]",
    description: "mt-1 line-clamp-2 text-xs leading-5 text-slate-200",
    cta: "mt-2.5 px-4 py-1.5 text-[11px]",
    dots: "mt-3",
    // La tarjeta solo existe en celular, donde las flechas nunca se muestran.
    showArrows: false,
    // Esta sí entra en la primera pantalla: va adentro del hero.
    priorityFirstSlide: true,
  },
} as const satisfies Record<CarouselVariant, unknown>;

/**
 * Carrusel de destacados de la portada.
 *
 * Es un RIEL que se desplaza y deja asomar la diapositiva anterior y la
 * siguiente a los costados, apagadas. Las vecinas no son decoración: son lo
 * que le avisa al visitante que hay más contenido. Antes era una pila con
 * fundido y nada indicaba que el carrusel siguiera.
 *
 * El centrado se resuelve en CSS, sin medir nada en JavaScript:
 *
 * - El riel lleva `padding-left: calc(50% - anchoDiapositiva / 2)`. Los
 *   porcentajes de `padding` se calculan contra el ANCHO DEL CONTENEDOR, así
 *   que eso deja la primera diapositiva centrada exacta, sea cual sea el
 *   ancho de la pantalla.
 * - A partir de ahí, correr el riel `n * (ancho + separación)` centra la
 *   diapositiva `n`.
 *
 * Medir el contenedor con JavaScript habría significado un `useEffect`, un
 * `ResizeObserver` y un primer cuadro con el riel en el lugar equivocado.
 *
 * El gesto sigue avanzando exactamente UNA diapositiva, por rápido que se
 * deslice: con `scroll-snap` la inercia del navegador se comía varias.
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
  // tire y se rearme en cada cambio, así el reloj arranca de cero.
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
  const { slideWidth, slideGap } = styles;
  const centerOffset = `calc(50% - (${slideWidth}) / 2)`;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Destacados"
      // El aire contra el hero solo tiene sentido cuando el carrusel va
      // DEBAJO del hero. La tarjeta va adentro y ahí el espacio lo reparte
      // la grilla del hero.
      className={`relative ${variant === "full" ? "mt-20 sm:mt-28" : ""} ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative">
        <div
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className={`flex ${reduceMotion ? "" : "transition-transform duration-500 ease-out"}`}
            style={{
              gap: slideGap,
              // Centra la PRIMERA diapositiva. El `50%` se mide contra el
              // ancho del contenedor, que es justo lo que hace falta.
              paddingLeft: centerOffset,
              paddingRight: centerOffset,
              transform: `translateX(calc(-1 * ${active} * ((${slideWidth}) + (${slideGap}))))`,
            }}
          >
            {slides.map((slide, index) => {
              const isActive = index === active;

              return (
                <div
                  key={slide.id}
                  aria-hidden={!isActive}
                  className="shrink-0"
                  style={{ width: slideWidth }}
                >
                  {/*
                    Las vecinas quedan apagadas: se ven lo suficiente para
                    saber que hay más, sin competir con la del medio. La
                    activa va SIEMPRE al 100%.
                  */}
                  <div
                    className={`relative transition-opacity duration-500 ${styles.frame} ${
                      isActive ? "opacity-100" : "opacity-40"
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

                    {/*
                      El texto solo en la del medio. En las vecinas sería
                      ilegible —están apagadas y, en celular, dentro de 210px—
                      y encima competiría con el mensaje que sí hay que leer.
                    */}
                    <div
                      className={`absolute inset-x-0 bottom-0 transition-opacity duration-300 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <div className={styles.textBox}>
                        <h3 className={styles.title}>{slide.title}</h3>
                        <p className={styles.description}>{slide.description}</p>
                        <Link
                          href={slide.href}
                          // Fuera de la diapositiva del medio el enlace no debe
                          // recibir foco: se llega tabulando a algo apagado.
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Pista de deslizar, solo en móvil y solo hasta que se use por
            primera vez: después de eso sería ruido sobre el contenido. Va
            arriba porque abajo está el texto de la diapositiva. */}
        {hasControls && !hasInteracted && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-3 flex justify-center sm:hidden"
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
              className="absolute left-6 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-950/50 text-white backdrop-blur transition hover:border-gold-300/50 hover:bg-ink-950/75 sm:grid"
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
              className="absolute right-6 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-950/50 text-white backdrop-blur transition hover:border-gold-300/50 hover:bg-ink-950/75 sm:grid"
            >
              <span aria-hidden="true">→</span>
            </button>
          </>
        )}
      </div>

      {/* Debajo del riel en las dos variantes: ahora las diapositivas son
          tarjetas con borde, y unos puntos encima de una de ellas se leerían
          como parte de esa tarjeta y no del carrusel. */}
      {hasControls && (
        <div className={`flex justify-center gap-2 ${styles.dots}`}>
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
    </section>
  );
}
