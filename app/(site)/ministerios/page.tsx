import type { Metadata } from "next";
import Link from "next/link";
import { MinistryCard } from "@/components/ministry-card";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { urlForImage } from "@/sanity/lib/image";
import { sanityClient } from "@/sanity/lib/client";
import { ministriesQuery, pageBannerByRouteQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import { PAGE_SECTION_KEYS, type Ministry, type PageBanner } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Ministerios",
};

export default async function MinisteriosPage() {
  const [banner, ministries] = await Promise.all([
    sanityClient.fetch<PageBanner | null>(
      pageBannerByRouteQuery,
      { route: "/ministerios" },
      { cache: "force-cache", next: { tags: [SANITY_TAGS.pageBanner] } },
    ),
    sanityClient.fetch<Ministry[]>(ministriesQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.ministry] },
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
            Un ministerio es simplemente un grupo de personas que decidió
            servir con lo que tiene — su tiempo, su talento y su historia —
            para sostener a otros. No hace falta experiencia previa ni un
            llamado espectacular: la mayoría de quienes sirven hoy empezaron
            ayudando en una sola actividad y, con el tiempo, encontraron ahí
            su lugar dentro de la iglesia.
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {ministries.map((ministry) => (
              <MinistryCard
                key={ministry._id}
                name={ministry.name}
                description={ministry.description}
                image={urlForImage(ministry.image).url()}
                imageAlt={ministry.imageAlt}
              />
            ))}
          </div>

          <div className="mt-14 rounded-[2rem] border border-gold-300/20 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.16),rgba(2,5,12,0.9)_60%)] p-8 text-center shadow-luxe sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-gold-300/90">
              Cómo unirte
            </p>
            <h2 className="mt-4 font-serif text-3xl tracking-tight text-white sm:text-4xl">
              Contanos dónde te gustaría servir
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Escribinos y te ayudamos a encontrar el ministerio que mejor se
              ajuste a tus tiempos, tus dones y tu etapa de vida. No necesitás
              experiencia previa, solo disposición para servir.
            </p>
            <Link
              href="/contacto"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-gold-400 px-7 py-3 text-sm font-semibold text-ink-950 shadow-luxe transition hover:-translate-y-0.5 hover:bg-gold-300"
            >
              Quiero servir
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
