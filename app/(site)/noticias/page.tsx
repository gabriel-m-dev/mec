import type { Metadata } from "next";
import { NewsCard } from "@/components/news-card";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { urlForImage } from "@/sanity/lib/image";
import { sanityClient } from "@/sanity/lib/client";
import { newsItemsQuery, pageBannerByRouteQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import { PAGE_SECTION_KEYS, type NewsItem, type PageBanner } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Noticias",
};

export default async function NoticiasPage() {
  const [banner, news] = await Promise.all([
    sanityClient.fetch<PageBanner | null>(
      pageBannerByRouteQuery,
      { route: "/noticias" },
      { cache: "force-cache", next: { tags: [SANITY_TAGS.pageBanner] } },
    ),
    sanityClient.fetch<NewsItem[]>(newsItemsQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.newsItem] },
    }),
  ]);

  const mainSection = banner?.sections?.find(
    (section) => section.key === PAGE_SECTION_KEYS.MAIN,
  );

  return (
    <main className="relative overflow-hidden bg-ink-950">
      {banner && (
        <PageHeader
          image={banner.image ? urlForImage(banner.image).url() : undefined}
          imageAlt={banner.imageAlt ?? ""}
          eyebrow={banner.eyebrow ?? ""}
          title={banner.title}
          description={banner.description ?? ""}
        />
      )}

      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {mainSection && (
            <SectionHeading
              eyebrow={mainSection.eyebrow ?? ""}
              title={mainSection.title}
              copy={mainSection.copy}
            />
          )}

          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300">
            Reunimos acá las novedades más relevantes de la vida
            institucional de MEC: alianzas nuevas, cambios en nuestros
            espacios de cuidado y celebraciones que vale la pena compartir
            con toda la comunidad.
          </p>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {news.map((item) => (
              <NewsCard
                key={item._id}
                category={item.category}
                title={item.title}
                summary={item.summary}
                image={urlForImage(item.image).url()}
                imageAlt={item.imageAlt}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
