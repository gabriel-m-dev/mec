import { Hero } from "@/components/hero";
import { HomeCarousel, type CarouselSlide } from "@/components/home-carousel";
import { sanityClient } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { homeFeaturedQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import type { FeaturedItem } from "@/sanity/lib/types";

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
  const featured = await sanityClient.fetch<FeaturedItem[] | null>(
    homeFeaturedQuery,
    {},
    {
      cache: "force-cache",
      // Los tres tipos: cambiar QUÉ se destaca toca `homePage`, pero editar el
      // evento o la noticia destacada también tiene que refrescar la portada.
      next: {
        tags: [SANITY_TAGS.homePage, SANITY_TAGS.event, SANITY_TAGS.newsItem],
      },
    },
  );

  const slides: CarouselSlide[] = (featured ?? []).map((item) => ({
    id: item._id,
    title: item.title,
    description: item.description,
    image: urlForImage(item.image).width(1600).url(),
    imageAlt: item.imageAlt,
    href: hrefFor(item),
  }));

  return (
    <main className="relative overflow-hidden bg-ink-950">
      <Hero />
      <HomeCarousel slides={slides} />
    </main>
  );
}
