"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  activeSlide as slideAt,
  isCentered,
  recenter,
  startIndex as firstIndex,
  step,
} from "@/lib/carousel-index";

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
const AUTOPLAY_MS = 3500;
/** Recorrido mínimo del dedo para contar como gesto, en px. */
const SWIPE_THRESHOLD = 40;
/** Lo que dura el desplazamiento del riel. Igual que la clase `duration-500`. */
const TRANSITION_MS = 500;

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
    // Va debajo del hero, fuera de la primera pantalla: para cuando alguien
    // baja, la entrada ya pasó. Se deja corta para que no quede a medias si
    // llega scrolleado desde otra página.
    neighborsDelayMs: 400,
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
    // Las vecinas esperan a que la del medio TERMINE de entrar. El hero mete
    // el carrusel a los 0.52s y la animación dura 0.9s, así que recién a los
    // 1.42s la del medio está en su lugar. Entrar antes las pisaría.
    neighborsDelayMs: 1450,
    // Esta sí entra en la primera pantalla: va adentro del hero.
    priorityFirstSlide: true,
  },
} as const satisfies Record<CarouselVariant, unknown>;

/**
 * Carrusel de destacados de la portada.
 *
 * Es un RIEL que se desplaza y deja ver la diapositiva anterior y la siguiente
 * a los costados, apagadas. Las vecinas no son decoración: son lo que le avisa
 * al visitante que hay más contenido.
 *
 * DA LA VUELTA: en la primera se ve la última a la izquierda, y en la última
 * se ve la primera a la derecha. Para eso la lista se dibuja TRES VECES y el
 * índice se mantiene en la copia del medio, así siempre hay una copia entera a
 * cada lado de donde sacar las vecinas. Cuando el índice se sale de esa copia
 * se lo devuelve a su equivalente con la transición apagada: como la posición
 * visual es idéntica, el salto no se ve.
 *
 * La otra opción era mover cada diapositiva por separado con distancia
 * circular, pero ahí la que da la vuelta viaja del extremo derecho al
 * izquierdo CRUZANDO el centro, o sea por delante de la que se está mirando.
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
 * El gesto avanza exactamente UNA diapositiva, por rápido que se deslice: con
 * `scroll-snap` la inercia del navegador se comía varias.
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
  const total = slides.length;
  // Con una sola diapositiva no hay nada que rotar ni vecinas que mostrar.
  const loops = total > 1;
  const startIndex = firstIndex(total, loops);

  /**
   * Dónde está parado el riel y si el próximo cambio se anima.
   *
   * Los dos datos van en UN solo estado porque siempre se deciden juntos: hay
   * movimientos que tienen que reubicar el índice Y apagar la animación en la
   * misma tanda, y eso no se puede hacer con dos estados sueltos (no se puede
   * llamar a otro `set` desde adentro de un actualizador).
   */
  const [view, setView] = useState({ index: startIndex, animated: true });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  /**
   * Si las vecinas ya entraron.
   *
   * Arranca en `false` y lo cambia un efecto, NO un valor leído del navegador:
   * así el servidor y el primer dibujo del cliente coinciden. Calcularlo de
   * entrada con algo que solo existe en el navegador es justo lo que provocaba
   * el aviso de hidratación desajustada en el hero.
   */
  const [neighborsIn, setNeighborsIn] = useState(false);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const { index, animated } = view;

  // Cuál de las diapositivas REALES se está mirando, sin importar en qué copia
  // esté parado el índice. Es lo que miran los puntos y el resaltado.
  const activeSlide = slideAt(index, total, loops);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  /**
   * Un paso, sin dejar nunca que el índice se salga de lo dibujado.
   *
   * La banda segura es la copia del medio más UNA posición a cada lado: ahí
   * siempre existen la diapositiva y sus dos vecinas. Un paso dentro de la
   * banda se anima normal.
   *
   * Pasarse de la banda es lo que rompía: la reubicación a la copia del medio
   * está detrás de un temporizador que se reinicia con cada movimiento, así
   * que en una ráfaga no llegaba a correr, el índice se iba más allá del array
   * de tres copias y el riel quedaba trasladado a un lugar donde no hay nada.
   * Los puntos seguían bien porque leen `wrap(index)`, que siempre da un valor
   * válido — de ahí que cambiaran los puntos y no se viera ninguna foto.
   *
   * Cuando el paso se pasaría de la banda, se reubica y se aplica el paso en la
   * misma tanda, sin animar: se pierde el deslizamiento de ESE paso, pero solo
   * ocurre deslizando más rápido de lo que tarda en asentarse, y es preferible
   * a quedarse en blanco.
   */
  // Las vecinas entran desde los costados una vez que la del medio terminó de
  // aparecer. Con "reducir movimiento" no esperan ni se desplazan: están desde
  // el arranque.
  useEffect(() => {
    const delay = reduceMotion ? 0 : styles.neighborsDelayMs;
    const timer = window.setTimeout(() => setNeighborsIn(true), delay);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, styles.neighborsDelayMs]);

  const go = useCallback(
    (direction: 1 | -1) => {
      setView(({ index: current }) => step(current, direction, total, loops));
    },
    [loops, total],
  );

  /**
   * Devuelve el índice a la copia del medio cuando se sale de ella.
   *
   * Espera a que termine el desplazamiento: saltar antes cortaría la animación
   * a la mitad. El salto va con la transición apagada porque la diapositiva y
   * su posición en pantalla son exactamente las mismas — lo único que cambia
   * es en qué copia estamos parados.
   */
  useEffect(() => {
    if (!loops || isCentered(index, total)) return;

    const timer = window.setTimeout(
      () => setView({ index: recenter(index, total), animated: false }),
      reduceMotion ? 0 : TRANSITION_MS,
    );

    return () => window.clearTimeout(timer);
  }, [index, total, loops, reduceMotion]);

  // Se vuelve a habilitar la animación recién en el cuadro SIGUIENTE al salto.
  // Hacerlo en el mismo cuadro dejaría la transición activa durante el salto y
  // se vería el riel cruzando todas las diapositivas de golpe.
  useEffect(() => {
    if (animated) return;
    const frame = requestAnimationFrame(() =>
      setView((current) => (current.animated ? current : { ...current, animated: true })),
    );
    return () => cancelAnimationFrame(frame);
  }, [animated]);

  // Avance automático. Se apaga con el puntero encima o el foco adentro:
  // nadie quiere que se le mueva lo que está leyendo.
  //
  // Depende de `activeSlide` y NO de `index` a propósito: el salto de copia
  // cambia el índice sin cambiar lo que se ve, y si el reloj mirara el índice
  // se reiniciaría en cada vuelta y esa diapositiva duraría de más.
  useEffect(() => {
    if (total < 2 || paused) return;
    const timer = window.setTimeout(() => go(1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [total, paused, activeSlide, go]);

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

  if (total === 0) return null;

  const hasControls = total > 1;
  const { slideWidth, slideGap } = styles;
  const centerOffset = `calc(50% - (${slideWidth}) / 2)`;
  // Tres copias para que siempre haya una entera a cada lado de la del medio.
  const rendered = loops ? [...slides, ...slides, ...slides] : slides;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Destacados"
      // `min-w-0` para que el componente sea seguro adentro de una grilla o un
      // flex: el riel de adentro no se puede encoger, y sin esto el contenedor
      // se estiraría a lo que mida el riel entero en vez de recortarlo.
      //
      // El aire contra el hero solo tiene sentido cuando el carrusel va DEBAJO
      // del hero. La tarjeta va adentro y ahí el espacio lo reparte la grilla.
      className={`relative min-w-0 ${variant === "full" ? "mt-20 sm:mt-28" : ""} ${className}`}
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
            className={`flex ${
              animated && !reduceMotion ? "transition-transform duration-500 ease-out" : ""
            }`}
            style={{
              gap: slideGap,
              // Centra la PRIMERA diapositiva. El `50%` se mide contra el
              // ancho del contenedor, que es justo lo que hace falta.
              paddingLeft: centerOffset,
              paddingRight: centerOffset,
              transform: `translateX(calc(-1 * ${index} * ((${slideWidth}) + (${slideGap}))))`,
            }}
          >
            {rendered.map((slide, position) => {
              const isActive = position === index;
              /*
                Todavía afuera: entra desde el costado que le toca. Solo aplica
                a las vecinas — la del medio ya entró con el resto del hero y
                volver a moverla sería animarla dos veces.

                El desplazamiento va en el ENVOLTORIO y no en el marco: el
                marco tiene su propia transición de opacidad para apagar las
                vecinas, y el riel tiene la suya para desplazarse. Tres
                transiciones sobre el mismo elemento se pisan.
              */
              const enteringFrom = !neighborsIn && !isActive
                ? position > index
                  ? "2.5rem"
                  : "-2.5rem"
                : undefined;

              return (
                <div
                  key={`${slide.id}-${position}`}
                  // Solo la del medio se anuncia: las vecinas y las copias
                  // repetirían el mismo contenido tres veces.
                  aria-hidden={!isActive}
                  className={`shrink-0 ${
                    reduceMotion
                      ? ""
                      : "transition-[opacity,transform] duration-700 ease-out"
                  } ${enteringFrom ? "opacity-0" : "opacity-100"}`}
                  style={{
                    width: slideWidth,
                    transform: enteringFrom ? `translateX(${enteringFrom})` : undefined,
                  }}
                >
                  {/*
                    Las vecinas quedan apagadas: se ven lo suficiente para
                    saber que hay más, sin competir con la del medio. La
                    activa va SIEMPRE al 100%.
                  */}
                  <div
                    className={`relative ${styles.frame} ${
                      // Durante el salto de copia NO se anima la opacidad. En
                      // ese instante cambia qué NODO es el activo: el que
                      // entra al centro venía apagado, y animarlo lo mostraría
                      // subiendo de 0.4 a 1 — se ve como si la tarjeta
                      // desapareciera y volviera. La del riel ya estaba
                      // apagada; faltaba esta.
                      animated ? "transition-opacity duration-500" : ""
                    } ${isActive ? "opacity-100" : "opacity-40"}`}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.imageAlt}
                      fill
                      sizes={styles.imageSizes}
                      priority={styles.priorityFirstSlide && position === startIndex}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.2)_30%,rgba(2,5,12,0.85)_75%,rgba(2,5,12,0.97)_100%)]" />

                    {/*
                      El texto solo en la del medio. En las vecinas sería
                      ilegible —están apagadas y, en celular, dentro de 210px—
                      y encima competiría con el mensaje que sí hay que leer.
                    */}
                    <div
                      className={`absolute inset-x-0 bottom-0 ${
                        // Mismo motivo que el marco: en el salto de copia el
                        // texto entraría animando de 0 a 1 y se lo vería
                        // aparecer de la nada.
                        animated ? "transition-opacity duration-300" : ""
                      } ${isActive ? "opacity-100" : "opacity-0"}`}
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
          {slides.map((slide, position) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => {
                // Siempre a la copia del medio: desde ahí quedan las tres
                // copias disponibles para seguir girando en cualquier sentido.
                setView({
                  index: loops ? total + position : position,
                  animated: true,
                });
                setHasInteracted(true);
              }}
              aria-label={`Ir al destacado ${position + 1}: ${slide.title}`}
              aria-current={position === activeSlide}
              className={`h-1.5 rounded-full transition-all ${
                position === activeSlide
                  ? "w-7 bg-gold-300"
                  : "w-2.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
