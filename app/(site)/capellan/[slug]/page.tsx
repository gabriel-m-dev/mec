import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchContent } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import { chaplainBySlugQuery, chaplainSlugsQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import type { Chaplain } from "@/sanity/lib/types";

type Params = { slug: string };

/**
 * Sanity guarda la fecha como "YYYY-MM-DD". `new Date(...)` la interpreta en
 * UTC, así que formatear en la zona local del servidor podría correrla un
 * día para atrás (Argentina es UTC-3). `timeZone: "UTC"` fija eso.
 */
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

async function getChaplain(slug: string): Promise<Chaplain | null> {
  return fetchContent<Chaplain | null>(chaplainBySlugQuery, SANITY_TAGS.chaplain, {
    slug,
  });
}

/**
 * Prerrenderiza una página por capellán, con su foto y sus datos.
 *
 * Existe para que cada capellán tenga una dirección propia y estable —
 * `/capellan/<slug>`— que se pueda imprimir en un QR: quien lo escanee cae
 * directo en la ficha de esa persona, no en la lista completa de capellanes.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await fetchContent<string[]>(chaplainSlugsQuery, SANITY_TAGS.chaplain);

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chaplain = await getChaplain(slug);

  if (!chaplain) return { title: "Capellán" };

  return {
    title: `${chaplain.name} — Capellanía`,
    description: chaplain.description,
  };
}

export default async function ChaplainPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const chaplain = await getChaplain(slug);

  if (!chaplain) {
    notFound();
  }

  return (
    <main className="relative overflow-hidden bg-ink-950">
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/capellanes"
            className="inline-flex items-center gap-2 text-sm text-gold-300/90 transition hover:text-gold-200"
          >
            <span aria-hidden="true">←</span> Volver a capellanía
          </Link>

          <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 shadow-luxe">
            <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9]">
              <Image
                src={urlForImage(chaplain.image).width(1440).url()}
                alt={chaplain.imageAlt}
                fill
                priority
                sizes="(min-width: 576px) 576px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0)_55%,rgba(2,5,12,0.85)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-gold-300 to-gold-500" />
                <h1 className="mt-3 font-serif text-3xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] sm:text-4xl">
                  {chaplain.name}
                </h1>
                <p className="mt-1 text-sm uppercase tracking-[0.24em] text-gold-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                  {chaplain.role}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="whitespace-pre-line text-base leading-8 text-slate-300">
                {chaplain.description}
              </p>

              {/* Ficha de datos, al pie de la tarjeta: lo que un QR necesita
                  entregar de un vistazo. Cada línea es opcional salvo el
                  nombre — sin el dato, esa fila no se dibuja. */}
              <dl className="mt-8 space-y-4 border-t border-white/10 pt-6 text-base">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-semibold uppercase tracking-wide text-white">Nombre completo:</dt>
                  <dd className="text-slate-300">{chaplain.name}</dd>
                </div>
                {chaplain.badgeNumber && (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold uppercase tracking-wide text-white">Nro de placa:</dt>
                    <dd className="text-slate-300 tabular-nums">{chaplain.badgeNumber}</dd>
                  </div>
                )}
                {chaplain.email && (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold uppercase tracking-wide text-white">Email:</dt>
                    <dd className="text-slate-300">
                      <a href={`mailto:${chaplain.email}`} className="hover:text-gold-200">
                        {chaplain.email}
                      </a>
                    </dd>
                  </div>
                )}
                {chaplain.phone && (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold uppercase tracking-wide text-white">Teléfono:</dt>
                    <dd className="text-slate-300">
                      <a href={`tel:${chaplain.phone}`} className="hover:text-gold-200">
                        {chaplain.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {chaplain.issueDate && (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold uppercase tracking-wide text-white">Fecha de alta:</dt>
                    <dd className="text-slate-300 tabular-nums">{formatDate(chaplain.issueDate)}</dd>
                  </div>
                )}
                {chaplain.expiryDate && (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold uppercase tracking-wide text-white">Fecha de vencimiento:</dt>
                    <dd className="text-slate-300 tabular-nums">{formatDate(chaplain.expiryDate)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-ink-900/60 p-8 text-center shadow-luxe">
            <h2 className="font-serif text-2xl tracking-tight text-white sm:text-3xl">
              ¿Necesitás hablar con alguien?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Escribinos con confianza y coordinamos una conversación
              privada con {chaplain.name}.
            </p>
            <Link
              href="/contacto"
              className="mt-7 inline-flex items-center justify-center rounded-full border border-gold-300/35 bg-white/5 px-7 py-3 text-sm font-semibold text-gold-100 transition hover:border-gold-200/70 hover:bg-gold-400/10"
            >
              Solicitar acompañamiento
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
