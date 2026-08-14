import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NewsBody } from "@/components/news-body";
import { fetchContent } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import { newsItemBySlugQuery, newsItemSlugsQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import type { NewsItem } from "@/sanity/lib/types";

type Params = { slug: string };

async function getNewsItem(slug: string): Promise<NewsItem | null> {
  return fetchContent<NewsItem | null>(newsItemBySlugQuery, SANITY_TAGS.newsItem, {
    slug,
  });
}

/**
 * Prerrenderiza una página por noticia con dirección.
 *
 * A diferencia de eventos y actividades, acá NO se exige contenido extra: la
 * página suma la portada grande y el resumen completo, así que aporta algo
 * aunque el cuerpo esté vacío. Sin esa regla, "Leer más" tendría que
 * desaparecer en las noticias cortas, que es justo lo contrario de lo pedido.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await fetchContent<string[]>(newsItemSlugsQuery, SANITY_TAGS.newsItem);

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsItem(slug);

  if (!news) return { title: "Noticia" };

  return {
    title: news.title,
    description: news.summary,
  };
}

export default async function NewsItemPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const news = await getNewsItem(slug);

  if (!news) {
    notFound();
  }

  /*
    Las fotos del cuerpo se resuelven a una URL ACÁ, en el servidor.

    No es una optimización: `NewsBody` es componente de cliente, y pasarle una
    función que arme la URL sería mandar una función a través de la frontera
    servidor/cliente, que no se puede serializar. De paso, el constructor de
    imágenes de Sanity no viaja al navegador.
  */
  const body = (news.body ?? []).map((block) => {
    if (block._type !== "image" || !("asset" in block)) return block;
    return { ...block, src: urlForImage(block as never).width(1440).url() };
  });

  return (
    <main className="relative overflow-hidden bg-ink-950">
      {/* La portada heredada de la tarjeta, en grande. */}
      <div className="relative h-[42vh] min-h-[16rem] w-full sm:h-[52vh]">
        <Image
          src={urlForImage(news.image).width(1800).height(900).fit("crop").url()}
          alt={news.imageAlt ?? ""}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Se funde con el fondo de la página: sin esto el corte entre la foto
            y el cuerpo queda como una línea dura. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.35)_0%,rgba(2,5,12,0.55)_55%,rgba(2,5,12,1)_100%)]" />
      </div>

      <section className="relative -mt-24 pb-24 sm:-mt-32 sm:pb-28">
        {/* `max-w-3xl` y no el ancho de las otras páginas: es texto para leer
            de corrido, y un renglón de 1200px obliga a barrer la pantalla con
            la vista en cada línea. */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 text-sm text-gold-300/90 transition hover:text-gold-200"
          >
            <span aria-hidden="true">←</span> Volver a noticias
          </Link>

          {/* `flex w-fit` y no `inline-flex`: el enlace de volver es un `<a>`
              inline, así que un `inline-flex` acá se acomodaría A SU LADO en
              vez de empezar renglón. */}
          <p className="mt-8 flex w-fit rounded-full border border-gold-300/35 bg-ink-900/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-gold-200">
            {news.category}
          </p>

          <h1 className="mt-5 font-serif text-3xl tracking-tight text-white sm:text-5xl">
            {news.title}
          </h1>

          {/* El resumen, más grande que el cuerpo: hace de bajada. */}
          <p className="mt-6 whitespace-pre-line text-lg leading-8 text-slate-200">
            {news.summary}
          </p>

          {body.length > 0 && (
            <div className="mt-10 border-t border-white/10 pt-4">
              <NewsBody value={body} fallbackAlt={news.title} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
