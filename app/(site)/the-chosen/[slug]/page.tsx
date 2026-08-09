import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PhotoGallery } from "@/components/photo-gallery";
import { fetchContent } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import {
  chosenActivityBySlugQuery,
  chosenActivitySlugsWithGalleryQuery,
} from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import type { ChosenActivity } from "@/sanity/lib/types";

type Params = { slug: string };

async function getActivity(slug: string): Promise<ChosenActivity | null> {
  return fetchContent<ChosenActivity | null>(
    chosenActivityBySlugQuery,
    SANITY_TAGS.chosenActivity,
    { slug },
  );
}

/**
 * Prerrenderiza en el build una página por actividad con fotos. Una actividad
 * a la que le carguen fotos después del último deploy se renderiza a demanda
 * la primera vez.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await fetchContent<string[]>(
    chosenActivitySlugsWithGalleryQuery,
    SANITY_TAGS.chosenActivity,
  );

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivity(slug);

  if (!activity) return { title: "Actividad" };

  return {
    title: activity.title,
    description: `${activity.title} — The Chosen, ${activity.date}.`,
  };
}

export default async function ChosenActivityPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const activity = await getActivity(slug);

  // Sin fotos no hay página: sería el título y una fecha, menos de lo que ya
  // muestra la tarjeta. Es la misma condición con la que la tarjeta decide si
  // enlaza, así que una URL escrita a mano tampoco llega a una página vacía.
  const gallery = activity?.gallery ?? [];
  if (!activity || gallery.length === 0) {
    notFound();
  }

  const cuando = [activity.date, activity.time].filter(Boolean).join(" · ");

  return (
    <main className="relative overflow-hidden bg-ink-950">
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/the-chosen"
            className="inline-flex items-center gap-2 text-sm text-gold-300/90 transition hover:text-gold-200"
          >
            <span aria-hidden="true">←</span> Volver a The Chosen
          </Link>

          {/* `flex w-fit` y no `inline-flex`: el enlace de volver es un `<a>`
              inline, así que un `inline-flex` acá se acomoda A SU LADO en vez
              de empezar renglón, y la píldora termina pisando el "Volver". */}
          <p className="mt-8 flex w-fit rounded-full border border-gold-300/35 bg-ink-900/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-gold-200">
            {cuando}
          </p>

          <h1 className="mt-5 max-w-3xl font-serif text-4xl tracking-tight text-white sm:text-5xl">
            {activity.title}
          </h1>

          {activity.place && (
            <p className="mt-4 text-base leading-7 text-slate-300">
              {activity.place}
            </p>
          )}

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
              // mano termina en 20 veces "foto". El título de la actividad
              // dice algo real cuando falta.
              alt: photo.alt ?? activity.title,
            }))}
          />
        </div>
      </section>
    </main>
  );
}
