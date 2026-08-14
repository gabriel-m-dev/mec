"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { shouldInterceptNavigation } from "@/lib/view-transition";

/** Si la navegación tarda más que esto, la barra se cierra igual. */
const FAILSAFE_TIMEOUT_MS = 8000;
/** Cuánto tarda en apagarse una vez que llega al 100%. */
const FADE_OUT_MS = 300;

/**
 * Cuánto avanza la barra en cada paso, más lento cuanto más cerca del techo.
 * Nunca llega sola al 100%: eso lo hace `finish()`, cuando la página nueva ya
 * está montada. Es el mismo truco de siempre (nprogress y similares): simula
 * progreso sin conocer el progreso real de la carga.
 */
function nextStep(current: number): number {
  if (current >= 90) return current;
  const increment = current < 30 ? 10 : current < 60 ? 4 : current < 80 ? 2 : 0.5;
  return Math.min(current + increment, 90);
}

function NavProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const stepTimer = useRef<number | null>(null);
  const failsafeTimer = useRef<number | null>(null);
  const fadeTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (stepTimer.current !== null) window.clearInterval(stepTimer.current);
    if (failsafeTimer.current !== null) window.clearTimeout(failsafeTimer.current);
    if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
    stepTimer.current = null;
    failsafeTimer.current = null;
    fadeTimer.current = null;
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    setProgress(100);
    fadeTimer.current = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, FADE_OUT_MS);
  }, [clearTimers]);

  const start = useCallback(() => {
    clearTimers();
    setVisible(true);
    setProgress((current) => (current <= 0 ? 8 : current));

    stepTimer.current = window.setInterval(() => {
      setProgress((current) => nextStep(current));
    }, 200);

    failsafeTimer.current = window.setTimeout(finish, FAILSAFE_TIMEOUT_MS);
  }, [clearTimers, finish]);

  // La ruta (o la búsqueda) cambió: la página nueva ya está dibujada, así que
  // cualquier navegación en curso terminó acá, sin importar si arrancó por
  // este mismo componente o por un `router.push` de otro lado.
  useEffect(() => {
    finish();
    return clearTimers;
  }, [pathname, searchParams, finish, clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (href === null) return;

      // `defaultPrevented: false` a propósito: a esta barra no le importa si
      // `ViewTransitions` ya interceptó el clic para animar la transición —
      // solo quiere saber si ES una navegación interna, para mostrarse.
      if (
        !shouldInterceptNavigation({
          href: anchor.href,
          currentUrl: window.location.href,
          button: event.button,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          target: anchor.getAttribute("target"),
          hasDownload: anchor.hasAttribute("download"),
          defaultPrevented: false,
        })
      ) {
        return;
      }

      start();
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 shadow-glow"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
          transition: shouldReduceMotion
            ? "none"
            : `width 200ms ease-out, opacity ${FADE_OUT_MS}ms ease-in`,
        }}
      />
    </div>
  );
}

/**
 * `useSearchParams` exige un `<Suspense>` alrededor en App Router — sin esto
 * Next.js saca de estático a todo lo que envuelva al componente. Este
 * envoltorio no dibuja nada durante la carga: la barra recién importa una vez
 * que hay una ruta para comparar.
 */
export function NavProgressBar() {
  return (
    <Suspense fallback={null}>
      <NavProgressBarInner />
    </Suspense>
  );
}
