"use client";

import "./globals.css";
import { useEffect } from "react";

/**
 * Última red: se dibuja cuando el que falla es el layout raíz, o cuando el
 * error escapa a cualquier otro boundary. Como reemplaza a `app/layout.tsx`,
 * tiene que traer su propio `<html>` y su propio `<body>`, e importar los
 * estilos a mano.
 *
 * Sin este archivo, ese caso mostraba la pantalla por defecto de Next: en
 * inglés y sin nada del sitio.
 *
 * Dos cosas se hacen distinto acá a propósito:
 *
 * 1. Los enlaces son `<a>` y no `<Link>`. Si reventó el layout raíz, la capa
 *    de navegación del cliente es justamente de lo que no hay que depender:
 *    una recarga completa tiene muchas más chances de salir del pozo.
 * 2. No se cargan las fuentes de `next/font`. Vienen del layout raíz, que
 *    acá no existe. `tailwind.config.ts` define Georgia y system-ui como
 *    respaldo, así que la pantalla se ve bien igual.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="bg-ink-950 font-sans text-white antialiased">
        <main className="relative flex min-h-svh items-center overflow-hidden px-4 py-24 sm:px-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(227,170,53,0.16),rgba(2,5,12,0)_60%)]"
          />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h1 className="text-balance font-serif text-3xl tracking-tight text-white sm:text-4xl">
              Algo salió mal
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-slate-300">
              No pudimos cargar el sitio. Probá de nuevo en un momento; si
              sigue pasando, escribinos y lo revisamos.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
              >
                Probar de nuevo
              </button>
              {/* La regla pide <Link> y acá está de más: este boundary se
                  dibuja cuando reventó el layout raíz, y entonces depender
                  del router del cliente es exactamente lo que no hay que
                  hacer. Una recarga completa es la que saca del pozo. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Recargar el inicio
              </a>
            </div>

            {error.digest ? (
              <p className="mt-6 text-xs text-slate-500">
                Código: {error.digest}
              </p>
            ) : null}
          </div>
        </main>
      </body>
    </html>
  );
}
