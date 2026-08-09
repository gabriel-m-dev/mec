"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FeatureHighlight } from "@/components/feature-highlight";
import {
  PodiumIcon,
  ServeHandsIcon,
  ShieldCrossIcon,
  UsersIcon,
} from "@/components/feature-icons";
import { featureHighlights } from "@/lib/content";

const featureIcons = {
  users: UsersIcon,
  hands: ServeHandsIcon,
  shield: ShieldCrossIcon,
  podium: PodiumIcon,
};

/**
 * Las imágenes que se usan mientras el cliente no cargue las suyas en el
 * Studio. Sin este respaldo, un campo vacío dejaría la portada sin fondo y el
 * texto blanco sobre negro.
 */
const FALLBACK_DESKTOP_IMAGE = "/images/new_hero_desktop.png";
const FALLBACK_MOBILE_IMAGE = "/images/new_hero_mobile.png";

type HeroProps = {
  /** Desde Sanity. Si falta, se usa la imagen que está hoy en el repo. */
  desktopImage?: string;
  mobileImage?: string;
  /**
   * Va en el hueco del medio, SOLO en celular. Se recibe armado desde afuera
   * en vez de que el hero lo construya: así el hero no necesita saber qué es
   * un destacado ni hablar con Sanity, que es de lo único que se ocupa la
   * página.
   */
  carousel?: ReactNode;
};

export function Hero({
  desktopImage,
  mobileImage,
  carousel,
}: HeroProps = {}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="inicio" className="relative overflow-hidden border-b border-white/6">
      {/*
        Dos <Image> y no uno con `srcSet`: son fotos DISTINTAS, no dos tamaños
        de la misma. `sizes` elige resolución, no contenido — para cambiar qué
        se ve hace falta que el CSS muestre una u otra.

        `sm:` (640px) es el mismo corte que usa el resto de la portada: abajo de
        ahí la pantalla es más alta que ancha y pide la imagen parada.
      */}
      <div className="absolute inset-0">
        <Image
          src={mobileImage ?? FALLBACK_MOBILE_IMAGE}
          alt=""
          fill
          priority
          className="object-cover object-center sm:hidden"
          sizes="100vw"
        />
        <Image
          src={desktopImage ?? FALLBACK_DESKTOP_IMAGE}
          alt=""
          fill
          priority
          className="hidden object-cover object-center sm:block"
          sizes="100vw"
        />
        {/*
          Solo el oscurecido de abajo hacia arriba, que es lo que hace legible
          el texto. Antes había además un lavado dorado radial arriba
          (`rgba(227,170,53,0.14)` centrado en `50% 0%`): con el fondo anterior
          caía sobre cielo vacío y no molestaba, pero el fondo nuevo tiene el
          globo justo ahí y le tiraba encima un velo amarillento. El arte nuevo
          ya trae sus propios dorados en las órbitas y el libro.
        */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.1)_0%,rgba(2,5,12,0.45)_55%,rgba(2,5,12,0.6)_100%)]" />
      </div>

      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />

      {/*
        En celular las tres filas —texto, carrusel, accesos rápidos— se apilan
        ARRIBA y el sobrante queda todo abajo.

        Es `content-start` (align-content) y no `justify-*`: lo que se acomoda
        son LAS FILAS de la grilla, no el contenido adentro de cada una.

        Antes esto era `content-between`, que repartía el sobrante entre las
        filas: los huecos crecían solos cuanto más alta la pantalla. Ahora el
        espaciado es fijo —`gap-y-2.5` son los 10px que había entre texto y
        carrusel, y con el `mt-[1.875rem]` de los accesos dan los 40px de
        abajo— así que el bloque se ve igual en cualquier teléfono.

        Las medidas de celular están pensadas SOBRE el sitio al 70% (ver la
        media query en `globals.css`): como el `rem` vale 11.2px, `pt-8` son
        22px reales y `gap-y-5` son 14px. Leerlas como si el `rem` valiera
        16px da casi el doble de lo que se ve.

        El `pt` de celular es chico a propósito. El encabezado es `sticky` pero
        ocupa su lugar en el flujo, así que ya empuja al hero hacia abajo por
        su cuenta: lo que se ponga acá se SUMA a eso. El `pt-20` original daba
        168px hasta el título y era demasiado.

        Con las filas al alto de su contenido, el `items-center` de al lado no
        cambia nada en celular; se deja porque desde `sm:` vuelve a mandar.
        Desde `sm:` se restauran los valores por defecto de la grilla y el
        escritorio queda exactamente como estaba.
      */}
      {/*
        El alto pedido es la pantalla MENOS el encabezado. El encabezado es
        `sticky` pero ocupa su lugar en el flujo, así que un `100svh` pelado
        daba una sección de 100svh + el alto del encabezado: siempre sobresalía
        del pliegue justo por ese alto, y como en escritorio el contenido va
        centrado dentro de esa caja agrandada, quedaba empujado hacia abajo y
        se cortaba.

        `5.5rem` no es un número al azar: es exactamente lo que mide el
        encabezado, y como está en `rem` acompaña solo al 82.5% de celular
        (5.5 × 13.2 = 72.6px) igual que al 100% de escritorio (5.5 × 16 = 88px).
      */}
      <div className="relative mx-auto grid min-h-[calc(100svh-5.5rem)] max-w-7xl content-start items-center gap-y-5 px-4 pb-16 pt-8 sm:content-normal sm:gap-y-0 sm:px-6 sm:pt-2.5 lg:px-8 lg:pb-20">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.h1
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: shouldReduceMotion ? 0 : 0.1 }}
            className="font-serif text-3xl tracking-tight text-white drop-shadow-[0_8px_40px_rgba(0,0,0,0.7)] sm:text-5xl md:text-6xl"
          >
            MEC
          </motion.h1>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: shouldReduceMotion ? 0 : 0.28 }}
            className="mx-auto mt-2 max-w-3xl text-balance font-serif text-sm font-semibold uppercase tracking-[0.1em] text-gold-200 sm:mt-3 sm:text-xl sm:tracking-[0.14em]"
          >
            Ministerio Evangélico Cristiano
          </motion.p>

          {/* El lema, debajo del nombre. La iglesia usa los DOS juntos: así
              aparece en su membrete institucional, no uno o el otro. */}
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: shouldReduceMotion ? 0 : 0.32 }}
            className="mx-auto mt-3 max-w-3xl text-balance font-serif text-base italic tracking-[0.08em] text-gold-300/90 sm:mt-4 sm:text-2xl"
          >
            Cristo poder y sabiduría de Dios
          </motion.p>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: shouldReduceMotion ? 0 : 0.36 }}
            className="mx-auto mt-3 max-w-2xl text-pretty text-xs leading-5 text-slate-200 sm:mt-4 sm:text-base sm:leading-6"
          >
            Anunciando el poder y la sabiduría de Dios para transformar vidas,
            fortalecer familias y movilizar una comunidad de fe con excelencia,
            belleza y propósito.
          </motion.p>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: shouldReduceMotion ? 0 : 0.46 }}
            className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:mt-7 sm:flex-row sm:gap-3"
          >
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-full bg-gold-400 px-4 py-2.5 text-xs font-semibold text-ink-950 shadow-luxe transition hover:-translate-y-0.5 hover:bg-gold-300 sm:px-6 sm:py-3 sm:text-sm"
            >
              Conectar con la comunidad
            </Link>
            <Link
              href="/cultos"
              className="relative inline-flex items-center justify-center overflow-hidden rounded-full border border-gold-300/35 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:border-gold-200/65 hover:bg-white/10 sm:px-6 sm:py-3 sm:text-sm"
            >
              <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(240,199,107,0.55)_50%,transparent_80%)] bg-[length:250%_100%] animate-shimmer" />
              <span className="relative">Ver cultos</span>
            </Link>
          </motion.div>
        </div>

        {/*
          El carrusel, solo en celular. `sm:hidden` no lo esconde nada más:
          `display:none` lo saca de la grilla, así que en escritorio vuelven a
          quedar DOS filas y el hero es exactamente el de antes.

          Con tres filas, `content-between` manda la primera arriba, la última
          abajo y deja esta en el medio con el sobrante repartido en partes
          iguales — que es justo donde el cliente la quiere.
        */}
        {/*
          `min-w-0` NO es decorativo. El riel del carrusel mide la suma de
          todas sus diapositivas y no puede encogerse. El tamaño mínimo
          automático de un item de grilla es su contenido, así que sin esto la
          columna se estira a lo que mida el riel —en celular, más del doble
          del ancho de la pantalla— y el centrado del carrusel, que se calcula
          con un `calc(50% …)`, sale medido contra esa columna inflada.
          El `overflow-hidden` de adentro recorta a la vista, pero no evita
          que el contenido infle la columna.
        */}
        {carousel && (
          <div className="relative z-10 w-full min-w-0 sm:hidden">{carousel}</div>
        )}

        <div className="relative z-10 mt-[1.875rem] grid grid-cols-4 gap-x-1.5 gap-y-6 sm:mt-12 sm:gap-x-8 sm:gap-y-8">
          {featureHighlights.map((item, index) => {
            const Icon = featureIcons[item.icon];
            return (
              <motion.div
                key={item.label}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.8,
                  delay: shouldReduceMotion ? 0 : 0.58 + index * 0.1,
                }}
              >
                <FeatureHighlight
                  icon={<Icon className="h-3.5 w-3.5 sm:h-6 sm:w-6" />}
                  label={item.label}
                  cta={item.cta}
                  href={item.href}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
