"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/lib/content";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Negro neutro y no `ink-950`: ese color es #02050c, con el canal azul seis
  // veces el rojo, y a 75% de opacidad teñía de azul todo lo que pasaba por
  // debajo. El `backdrop-blur` es lo que sostiene la legibilidad, así que el
  // fondo puede ser mucho más transparente sin que el texto sufra.
  return (
    <header className="sticky top-0 z-50 bg-black/25 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          {/* El `alt` no va vacío: el texto de al lado es `hidden sm:block`, así
              que en móvil esta imagen es lo único dentro del enlace y sin `alt`
              el enlace a la portada se quedaría sin nombre accesible. */}
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
          <div className="hidden sm:block">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white">
              MEC
            </p>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-300/90">
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
