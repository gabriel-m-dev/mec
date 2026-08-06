import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Pantalla compartida por el 404 y por las de error.
 *
 * El diseño se escribe una sola vez acá porque son cuatro archivos distintos
 * -`app/not-found.tsx`, `app/(site)/not-found.tsx`, `app/(site)/error.tsx` y
 * `app/global-error.tsx`- que Next elige según dónde falle. Cada uno existe
 * por un motivo técnico diferente, pero para quien mira la pantalla son la
 * misma cosa y tienen que verse igual.
 *
 * No lleva encabezado ni pie: eso lo pone quien la usa, porque no todos los
 * boundaries corren dentro del layout de (site).
 */

type StatusScreenProps = {
  /** El número grande. Vacío en las pantallas de error, que no tienen código. */
  code?: string;
  title: string;
  description: string;
  /** Botones. El de error trae uno que reintenta, y ese necesita onClick. */
  children: ReactNode;
  /**
   * Línea chica debajo de los botones. La usa la pantalla de error para el
   * `digest`, que iba dentro de `children` y quedaba en la misma fila que los
   * botones, leyéndose como un tercero.
   */
  footnote?: ReactNode;
};

export function StatusScreen({
  code,
  title,
  description,
  children,
  footnote,
}: StatusScreenProps) {
  return (
    <main className="relative flex min-h-[70svh] items-center overflow-hidden bg-ink-950 px-4 py-24 sm:px-6 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(227,170,53,0.16),rgba(2,5,12,0)_60%)]"
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {code ? (
          <p className="font-serif text-7xl leading-none text-gold-300/80 sm:text-8xl">
            {code}
          </p>
        ) : null}

        <h1 className="mt-6 text-balance font-serif text-3xl tracking-tight text-white sm:text-4xl">
          {title}
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-slate-300">
          {description}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {children}
        </div>

        {footnote ? (
          <p className="mt-6 text-xs text-slate-500">{footnote}</p>
        ) : null}
      </div>
    </main>
  );
}

/** Botón dorado, el de la acción principal. */
export function StatusPrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
    >
      {children}
    </Link>
  );
}

/**
 * Mismo aspecto que `StatusPrimaryLink` pero es un `<button>`: las pantallas
 * de error necesitan reintentar, y eso es una acción, no una navegación.
 */
export function StatusPrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
    >
      {children}
    </button>
  );
}

/** Botón secundario, con borde. */
export function StatusSecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
    >
      {children}
    </Link>
  );
}
