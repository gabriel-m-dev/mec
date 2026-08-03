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
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-gold-300/30 bg-gold-400/10 text-gold-200 shadow-glow sm:h-20 sm:w-20">
        {icon}
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white sm:text-base">
        {label}
      </p>
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-full border border-gold-300/35 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold-100 transition hover:border-gold-200/70 hover:bg-gold-400/10"
      >
        {cta}
      </Link>
    </div>
  );
}
