"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { heroHighlights } from "@/lib/content";

const OrbitScene = dynamic(
  () => import("@/components/three/orbit-scene").then((mod) => mod.OrbitScene),
  { ssr: false }
);

export function Hero() {
  const [showOrbitScene, setShowOrbitScene] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 768px) and (hover: hover) and (pointer: fine)"
    );
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    };

    function evaluate() {
      const saveData = nav.connection?.saveData ?? false;
      const lowMemory = nav.deviceMemory !== undefined && nav.deviceMemory <= 4;
      const lowCpu =
        nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4;

      setShowOrbitScene(mediaQuery.matches && !saveData && !lowMemory && !lowCpu);
    }

    evaluate();

    mediaQuery.addEventListener("change", evaluate);

    return () => {
      mediaQuery.removeEventListener("change", evaluate);
    };
  }, []);

  return (
    <section id="inicio" className="relative overflow-hidden border-b border-white/6">
      <div className="absolute inset-0">
        <Image
          src="/images/hero_mobile.png"
          alt=""
          fill
          priority
          className="object-cover object-center sm:hidden"
          sizes="100vw"
        />
        <Image
          src="/images/igle-background-desktop.png"
          alt=""
          fill
          priority
          className="hidden object-cover object-center sm:block"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.14),transparent_36%),linear-gradient(180deg,rgba(2,5,12,0.1)_0%,rgba(2,5,12,0.74)_55%,rgba(2,5,12,1)_100%)]" />
      </div>

      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-20 lg:pt-32">
        <div className="pointer-events-none absolute inset-x-0 top-12 h-[62rem] opacity-90 md:top-2">
          {!showOrbitScene ? null : <OrbitScene />}
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: shouldReduceMotion ? 0 : 0.1 }}
            className="text-xs font-semibold uppercase tracking-[0.46em] text-gold-200/90 sm:text-sm"
          >
            Cristo poder y sabiduría de Dios
          </motion.p>

          <motion.h1
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: shouldReduceMotion ? 0 : 0.18 }}
            className="mt-5 font-serif text-5xl tracking-tight text-white drop-shadow-[0_8px_40px_rgba(0,0,0,0.7)] sm:text-7xl md:text-8xl"
          >
            MEC
          </motion.h1>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: shouldReduceMotion ? 0 : 0.28 }}
            className="mx-auto mt-5 max-w-3xl text-balance font-serif text-2xl font-semibold uppercase tracking-[0.14em] text-gold-200 sm:text-3xl"
          >
            Cristo poder y sabiduría de Dios
          </motion.p>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: shouldReduceMotion ? 0 : 0.36 }}
            className="mx-auto mt-6 max-w-4xl text-pretty text-lg leading-8 text-slate-200 sm:text-xl"
          >
            Anunciando el poder y la sabiduría de Dios para transformar vidas,
            fortalecer familias y movilizar una comunidad de fe con excelencia,
            belleza y propósito.
          </motion.p>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: shouldReduceMotion ? 0 : 0.46 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/#comunidad"
              className="inline-flex items-center justify-center rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 shadow-luxe transition hover:-translate-y-0.5 hover:bg-gold-300"
            >
              Conectar con la comunidad
            </Link>
            <Link
              href="/#cultos"
              className="inline-flex items-center justify-center rounded-full border border-gold-300/35 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-gold-200/65 hover:bg-white/10"
            >
              Ver cultos
            </Link>
          </motion.div>
        </div>

        <div className="relative z-10 mt-16 grid gap-4 md:grid-cols-3">
          {heroHighlights.map((item, index) => (
            <motion.article
              key={item.title}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.8,
                delay: shouldReduceMotion ? 0 : 0.58 + index * 0.1,
              }}
              className="rounded-3xl border border-white/10 bg-ink-950/60 p-5 text-left shadow-luxe backdrop-blur-md"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-gold-300/90">
                {item.title}
              </p>
              <p className="mt-3 font-serif text-4xl text-white">{item.value}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.copy}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
