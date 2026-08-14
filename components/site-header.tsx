"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/lib/content";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const isHome = pathname === "/";

  // Negro neutro y no `ink-950`: ese color es #02050c, con el canal azul seis
  // veces el rojo, y a 75% de opacidad teñía de azul todo lo que pasaba por
  // debajo. El `backdrop-blur` es lo que sostiene la legibilidad, así que el
  // fondo puede ser mucho más transparente sin que el texto sufra.
  return (
    <header
      // Lo saca del fundido entre páginas: el navegador lo trata como un
      // elemento que persiste en vez de desvanecerlo y volverlo a dibujar. Es
      // justamente la parte de la pantalla que NO cambia al navegar.
      data-view-transition="site-header"
      className="sticky top-0 z-50 bg-black/25 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          {/* El `alt` se mantiene aunque ahora haya texto al lado en móvil:
              si algún día vuelve a ocultarse, esta imagen queda siendo lo
              único dentro del enlace a la portada. */}
          {/* `width`/`height` son los del archivo: fijan la relación de aspecto
              y evitan el salto de layout. El tamaño real lo pone `h-14 w-auto`,
              y `sizes` es lo que impide que Next sirva la variante de 828px
              para un hueco de 83: sin él el srcset se arma desde `width`. */}
          <Image
            src="/images/logo-mec.png"
            alt="MEC"
            width={826}
            height={556}
            sizes="83px"
            priority
            className="h-14 w-auto"
          />
          <div className="flex items-center gap-2 sm:block">
            {/* En móvil la sigla es TODO el texto de la marca: entre el logo y
                el botón del menú hay unos 200px, y ahí el nombre completo
                entraba solo partido en dos renglones de 9px. Una sigla de una
                línea se lee de un golpe; dos renglones diminutos, no. */}
            <p className="text-lg font-semibold uppercase tracking-[0.28em] text-white sm:text-sm">
              MEC
            </p>

            {/* El eslogan, solo en móvil y solo fuera de la home: en la home
                ya lo dice el hero, grande y con su propia entrada. Acá entra
                animado al lado de la sigla, como si saliera del logo, y
                desaparece del mismo modo al volver a "/". Desde `sm` el
                renglón de abajo ya muestra el nombre completo, así que este
                no hace falta. */}
            <AnimatePresence>
              {!isHome && (
                <motion.p
                  key="header-slogan"
                  initial={{ width: 0, opacity: 0, x: -6 }}
                  animate={{ width: "auto", opacity: 1, x: 0 }}
                  exit={{ width: 0, opacity: 0, x: -6 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.35,
                    ease: "easeOut",
                  }}
                  className="overflow-hidden whitespace-nowrap font-serif text-[11px] italic tracking-[0.08em] text-gold-300/90 sm:hidden"
                >
                  Cristo poder y sabiduría de Dios
                </motion.p>
              )}
            </AnimatePresence>

            {/* El eslogan, solo desde `sm`, donde sí hay ancho para una
                línea. En móvil lo reemplaza la sigla animada de arriba.
                Misma tipografía en los dos casos: font-serif itálica. */}
            <p className="hidden font-serif text-[15px] italic leading-normal tracking-[0.08em] text-gold-300/90 sm:block">
              Cristo poder y sabiduría de Dios
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 xl:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative pb-1 text-sm font-medium transition hover:-translate-y-0.5 ${
                  isActive ? "text-white" : "text-slate-200 hover:text-white"
                }`}
              >
                {item.label}
                {isActive ? (
                  <motion.span
                    layoutId="nav-active-indicator"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gold-300"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contacto"
            className="hidden rounded-full border border-gold-300/40 bg-gold-400/10 px-4 py-2 text-sm font-semibold text-gold-100 transition hover:border-gold-300/70 hover:bg-gold-400/20 xl:inline-flex"
          >
            Únete
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className="grid h-11 w-11 place-items-center rounded-full border border-gold-300/40 bg-white/5 text-gold-100 transition hover:border-gold-300/70 hover:bg-white/10 xl:hidden"
          >
            <span className="sr-only">
              {isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              {isMobileMenuOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            // El panel abierto sí necesita ser opaco: tapa contenido y hay que
            // poder leerlo. Solo se neutraliza el azul, la opacidad se mantiene.
            className="overflow-hidden border-t border-white/8 bg-black/95 backdrop-blur-xl xl:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6 lg:px-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contacto"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 rounded-full border border-gold-300/40 bg-gold-400/10 px-4 py-3 text-center text-sm font-semibold text-gold-100 transition hover:border-gold-300/70 hover:bg-gold-400/20"
              >
                Únete
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
