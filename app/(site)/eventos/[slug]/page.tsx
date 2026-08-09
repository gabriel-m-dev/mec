import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PhotoGallery } from "@/components/photo-gallery";
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

          {/* `flex w-fit` y no `inline-flex`: el enlace de volver es un `<a>`
              inline, así que un `inline-flex` acá se acomoda A SU LADO en vez
              de empezar renglón, y la píldora termina pisando el "Volver". */}
          <p className="mt-8 flex w-fit rounded-full border border-gold-300/35 bg-ink-900/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-gold-200">
            {event.time ? `${event.day} · ${event.time}` : event.day}
          </p>

          <h1 className="mt-5 max-w-3xl font-serif text-4xl tracking-tight text-white sm:text-5xl">
            {event.title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            {event.description}
          </p>

          {/* Las URLs se arman acá, en el servidor: así el constructor de
              Sanity no viaja al navegador con la galería. */}
          <PhotoGallery
            className="mt-14"
            photos={gallery.map((photo) => ({
              key: photo._key,
              thumb: urlForImage(photo).width(900).url(),
              // El doble que la miniatura: en el visor la foto se ve entera y
              // a pantalla completa, no recortada en una celda de la grilla.
              full: urlForImage(photo).width(1800).url(),
              // El alt es opcional en la galería: cargar 20 descripciones a
              // mano termina en 20 veces "foto". El título del evento dice
              // algo real cuando falta.
              alt: photo.alt ?? event.title,
            }))}
          />
        </div>
      </section>
    </main>
  );
}
