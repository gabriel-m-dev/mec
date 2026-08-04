import Link from "next/link";
import type { ReactNode } from "react";

type FeatureHighlightProps = {
  icon: ReactNode;
  label: string;
  cta: string;
  href: string;
};

export function FeatureHighlight({ icon, label, cta, href }: FeatureHighlightProps) {
  return (
    // Un solo anchor envuelve ícono, título y botón: así el bloque entero es
    // clickeable. El CTA es un span con aspecto de botón, no un Link — anidar
    // un <a> dentro de otro es HTML inválido y el navegador parte el DOM ahí.
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-3xl p-1.5 text-center transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 sm:gap-3 sm:p-2"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold-300/30 bg-gold-400/10 text-gold-200 shadow-glow transition group-hover:border-gold-200/60 group-hover:bg-gold-400/20 sm:h-14 sm:w-14">
        {icon}
      </span>
      <span className="text-balance text-[11px] font-semibold uppercase leading-tight tracking-[0.1em] text-white sm:text-base sm:leading-normal sm:tracking-[0.18em]">
        {label}
      </span>
      <span className="inline-flex items-center justify-center rounded-full bg-gold-400 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-950 shadow-luxe transition group-hover:bg-gold-300 sm:px-5 sm:py-2 sm:text-xs sm:tracking-[0.14em]">
        {cta}
      </span>
    </Link>
  );
}
