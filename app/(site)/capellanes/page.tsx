import type { Metadata } from "next";
import Link from "next/link";
import { ChaplainCard } from "@/components/chaplain-card";
import { ChaplaincyActivityCard } from "@/components/chaplaincy-activity-card";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { urlForBanner, urlForImage } from "@/sanity/lib/image";
import { sanityClient } from "@/sanity/lib/client";
import {
  chaplaincyActivitiesQuery,
  chaplainsQuery,
  pageBannerByRouteQuery,
} from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import {
  PAGE_SECTION_KEYS,
  type Chaplain,
  type ChaplaincyActivity,
  type PageBanner,
} from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Capellanía",
};

export default async function CapellaniaPage() {
  const [banner, activities, chaplains] = await Promise.all([
    sanityClient.fetch<PageBanner | null>(
      pageBannerByRouteQuery,
      { route: "/capellanes" },
      { cache: "force-cache", next: { tags: [SANITY_TAGS.pageBanner] } },
    ),
    sanityClient.fetch<ChaplaincyActivity[]>(chaplaincyActivitiesQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.chaplaincyActivity] },
    }),
    sanityClient.fetch<Chaplain[]>(chaplainsQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.chaplain] },
    }),
  ]);

  const mainSection = banner?.sections?.find(
    (section) => section.key === PAGE_SECTION_KEYS.MAIN,
  );

  return (
    <main className="relative overflow-hidden bg-ink-950">
      {banner && (
        <PageHeader
          image={banner.image ? urlForBanner(banner.image).url() : undefined}
          imageAlt={banner.imageAlt ?? ""}
          eyebrow={banner.eyebrow ?? ""}
          title={banner.title}
          description={banner.description ?? ""}
        />
      )}

      <section className="bg-white/[0.03] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {mainSection && (
            <SectionHeading
              eyebrow={mainSection.eyebrow ?? ""}
              title={mainSection.title}
              copy={mainSection.copy}
            />
          )}

          {/* Este párrafo estaba escrito a mano en el código: explicaba de qué
              se trata la capellanía pero la iglesia no podía tocarlo. Ahora
              sale del Studio, y sin cargar no se dibuja. */}
          {banner?.chaplaincyIntro && (
            <p className="mt-8 max-w-3xl whitespace-pre-line text-lg leading-8 text-slate-300">
              {banner.chaplaincyIntro}
            </p>
          )}

          {activities.length > 0 && (
            <div className="mt-16">
              <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
                Qué hacemos
              </h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {activities.map((activity) => (
                  <ChaplaincyActivityCard
                    key={activity._id}
                    name={activity.name}
                    day={activity.day}
                    time={activity.time}
                    description={activity.description}
                    image={urlForImage(activity.image).url()}
                    imageAlt={activity.imageAlt}
                  />
                ))}
              </div>
            </div>
          )}

          {chaplains.length > 0 && (
            <div className="mt-20">
              <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
                Quiénes acompañan
              </h2>
              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {chaplains.map((chaplain) => (
                  <ChaplainCard
                    key={chaplain._id}
                    name={chaplain.name}
                    role={chaplain.role}
                    description={chaplain.description}
                    image={urlForImage(chaplain.image).url()}
                    imageAlt={chaplain.imageAlt}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-20 rounded-[2rem] border border-white/10 bg-ink-900/60 p-8 text-center shadow-luxe sm:p-12">
            <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
              ¿Necesitás hablar con alguien?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
              No hace falta esperar a una crisis para pedir acompañamiento.
              Escribinos con confianza y coordinamos una conversación
              privada con uno de nuestros capellanes.
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
