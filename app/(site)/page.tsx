import { Hero } from "@/components/hero";
import { HomeCarousel, type CarouselSlide } from "@/components/home-carousel";
import { fetchContent } from "@/sanity/lib/fetch";
import {
  urlForHeroDesktop,
  urlForHeroMobile,
  urlForImage,
} from "@/sanity/lib/image";
import {
  homeFeaturedQuery,
  homeHeroQuery,
  homeLiveQuery,
} from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import type { FeaturedItem, HomeHero, LiveStream } from "@/sanity/lib/types";

/**
 * A dónde lleva el botón de cada destacado.
 *
 * Solo un evento CON fotos tiene página propia: `/eventos/[slug]` hace 404 sin
 * galería, justamente para no llevar a una página más pobre que la tarjeta. Y
 * las noticias todavía no tienen página propia. En esos dos casos el botón va
 * a la lista, que es lo mejor que existe hoy.
 */
function hrefFor(item: FeaturedItem): string {
  if (item._type === "event") {
    return item.hasGallery && item.slug ? `/eventos/${item.slug}` : "/eventos";
  }
  return "/noticias";
}

export default async function HomePage() {
  const hero = await fetchContent<HomeHero | null>(
    homeHeroQuery,
    SANITY_TAGS.homePage,
  );

  const live = await fetchContent<LiveStream | null>(
    homeLiveQuery,
    SANITY_TAGS.homePage,
  );

  // Los tres tipos: cambiar QUÉ se destaca toca `homePage`, pero editar el
  // evento o la noticia destacada también tiene que refrescar la portada.
  const featured = await fetchContent<FeaturedItem[] | null>(homeFeaturedQuery, [
    SANITY_TAGS.homePage,
    SANITY_TAGS.event,
    SANITY_TAGS.newsItem,
  ]);

  // Dos redes, y las dos hacen falta:
  // - `filter(Boolean)` porque una referencia a un documento borrado se
  //   desreferencia a `null`. La query ya lo filtra, pero esto es lo que
  //   separa un destacado roto de un build caído.
  // - `slice(0, 5)` porque el máximo del schema solo se aplica en el Studio:
  //   la API de mutación no valida contra el schema.
  // La transmisión en vivo va SIEMPRE primera: es lo único con hora, y llegar
  // tarde a un culto en vivo no se arregla más adelante.
  const liveSlide: CarouselSlide[] = live
    ? [
        {
          id: "live",
          title: live.title,
          description: live.description,
          image: urlForImage(live.image).width(1600).url(),
          imageAlt: live.imageAlt,
          href: live.url,
          cta: live.cta ?? "Ver en vivo",
          external: true,
        },
      ]
    : [];

  const featuredSlides: CarouselSlide[] = (featured ?? [])
    .filter((item): item is FeaturedItem => Boolean(item))
    .slice(0, 5)
    .map((item) => ({
      id: item._id,
      title: item.title,
      description: item.description,
      image: urlForImage(item.image).width(1600).url(),
      imageAlt: item.imageAlt,
      href: hrefFor(item),
    }));

  const slides: CarouselSlide[] = [...liveSlide, ...featuredSlides];

  return (
    <main className="relative overflow-hidden bg-ink-950">
      {/* Cada imagen se resuelve por separado: cargar solo la de escritorio
          tiene que dejar la de celular en la que está hoy, no romperla. */}
      <Hero
        desktopImage={
          hero?.desktopImage
            ? urlForHeroDesktop(hero.desktopImage).url()
            : undefined
        }
        mobileImage={
          hero?.mobileImage ? urlForHeroMobile(hero.mobileImage).url() : undefined
        }
        carousel={
          slides.length > 0 ? (
            <HomeCarousel slides={slides} variant="card" />
          ) : undefined
        }
      />
      {/*
        El mismo carrusel dos veces, cada uno tapado en el otro tamaño de
        pantalla. Son DOS instancias con su propio estado y su propio reloj, lo
        que no es gratis — pero un solo elemento no puede estar adentro de la
        grilla del hero en celular Y debajo del hero en escritorio, que son
        padres distintos. Alternarlos por CSS es el mismo recurso que ya usa el
        encabezado para su menú de celular y el de escritorio.

        Lo que sí sería caro es que la instancia tapada se bajara sus imágenes:
        piden tamaños distintos, así que serían URLs distintas y bytes de más.
        No pasa porque solo la tarjeta marca `priority`; en la de escritorio
        las diapositivas quedan en carga diferida, y una imagen diferida
        adentro de un `display:none` nunca entra en pantalla ni se pide.
      */}
      <HomeCarousel slides={slides} className="hidden sm:block" />
    </main>
  );
}
