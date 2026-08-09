import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { urlForBanner, urlForImage } from "@/sanity/lib/image";
import { fetchContent } from "@/sanity/lib/fetch";
import { eventsQuery, pageBannerByRouteQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import { PAGE_SECTION_KEYS, type Event, type PageBanner } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Eventos",
};

export default async function EventosPage() {
  const [banner, events] = await Promise.all([
    fetchContent<PageBanner | null>(pageBannerByRouteQuery, SANITY_TAGS.pageBanner, {
      route: "/eventos",
    }),
    fetchContent<Event[]>(eventsQuery, SANITY_TAGS.event),
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

      <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {mainSection && (
            <SectionHeading
              eyebrow={mainSection.eyebrow ?? ""}
              title={mainSection.title}
              copy={mainSection.copy}
            />
          )}

          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300">
            Cada evento tiene un propósito distinto: unos buscan profundizar
            tu vida de oración, otros fortalecer tu liderazgo y otros
            simplemente reunir a la familia MEC alrededor de una misma mesa.
            Revisá la agenda y sumate a los que resuenen con tu momento
            actual.
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event._id}
                day={event.day}
                time={event.time}
                title={event.title}
                description={event.description}
                image={urlForImage(event.image).url()}
                imageAlt={event.imageAlt}
                // Solo enlaza si hay fotos: la página de galería no existe
                // para un evento sin cargar, y mandar ahí sería llevar al
                // visitante a menos de lo que ya está viendo.
                href={
                  event.slug?.current && (event.gallery?.length ?? 0) > 0
                    ? `/eventos/${event.slug.current}`
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
