"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MapPinIcon } from "@/components/contact-icons";
import { FeatureHighlight } from "@/components/feature-highlight";
import { PodiumIcon, ShieldCrossIcon, UsersIcon } from "@/components/feature-icons";
import { featureHighlights } from "@/lib/content";

const featureIcons = {
  users: UsersIcon,
  podium: PodiumIcon,
  shield: ShieldCrossIcon,
  map: MapPinIcon,
};

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="inicio" className="relative overflow-hidden border-b border-white/6">
      <div className="absolute inset-0">
        <Image
          src="/images/new_hero_mobile.png"
          alt=""
          fill
          priority
          className="object-cover object-center sm:hidden"
          sizes="100vw"
        />
        <Image
          src="/images/new_hero_desktop.png"
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

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
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
            className="mx-auto mt-2 max-w-3xl text-balance font-serif text-xs italic tracking-[0.08em] text-gold-300/80 sm:text-base"
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
