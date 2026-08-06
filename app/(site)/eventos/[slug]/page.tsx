import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { sanityClient } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { eventBySlugQuery, eventSlugsWithGalleryQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import type { Event } from "@/sanity/lib/types";

type Params = { slug: string };

async function getEvent(slug: string): Promise<Event | null> {
  return sanityClient.fetch<Event | null>(
    eventBySlugQuery,
    { slug },
    { cache: "force-cache", next: { tags: [SANITY_TAGS.event] } },
  );
}

/**
 * Prerrenderiza en el build una página por evento con fotos, para que estas
 * rutas queden estáticas como las otras 8. Un evento al que le carguen fotos
 * después del último deploy se renderiza a demanda la primera vez.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await sanityClient.fetch<string[]>(
    eventSlugsWithGalleryQuery,
    {},
    { cache: "force-cache", next: { tags: [SANITY_TAGS.event] } },
  );

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) return { title: "Evento" };

  return {
    title: event.title,
    description: event.description,
  };
}

export default async function EventoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const event = await getEvent(slug);

  // Sin fotos no hay página: sería el título y un párrafo, menos de lo que ya
  // muestra la tarjeta. Es la misma condición con la que la tarjeta decide si
  // enlaza, así que una URL escrita a mano tampoco llega a una página vacía.
  const gallery = event?.gallery ?? [];
  if (!event || gallery.length === 0) {
    notFound();
  }

  return (
    <main className="relative overflow-hidden bg-ink-950">
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 text-sm text-gold-300/90 transition hover:text-gold-200"
          >
            <span aria-hidden="true">←</span> Volver a eventos
          </Link>

          <p className="mt-8 inline-flex rounded-full border border-gold-300/35 bg-ink-900/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-gold-200">
            {event.day}
          </p>

          <h1 className="mt-5 max-w-3xl font-serif text-4xl tracking-tight text-white sm:text-5xl">
            {event.title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            {event.description}
          </p>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((photo) => (
              <div
                key={photo._key}
                className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/4 shadow-luxe"
              >
                <Image
                  src={urlForImage(photo).width(900).url()}
                  // El alt es opcional en la galería: cargar 20 descripciones a
                  // mano termina en 20 veces "foto". El título del evento dice
                  // algo real cuando falta.
                  alt={photo.alt ?? event.title}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
