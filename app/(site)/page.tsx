import { AnimatedSection } from "@/components/animated-section";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { VenueCard } from "@/components/venue-card";
import { WorshipServiceCard } from "@/components/worship-service-card";
import { urlForImage } from "@/sanity/lib/image";
import { sanityClient } from "@/sanity/lib/client";
import { siteSettingsQuery, venueQuery, worshipServicesQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import type { SiteSettings, Venue, WorshipService } from "@/sanity/lib/types";

export default async function HomePage() {
  const [siteSettings, venue, worshipServices] = await Promise.all([
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.siteSettings] },
    }),
    sanityClient.fetch<Venue | null>(venueQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.venue] },
    }),
    sanityClient.fetch<WorshipService[]>(worshipServicesQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.worshipService] },
    }),
  ]);

  return (
    <main className="relative overflow-hidden bg-ink-950">
      <Hero />

      <AnimatedSection id="cultos" className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Cultos presenciales y online"
            title="Una experiencia unificada para quienes están cerca y para quienes se conectan a distancia"
            copy="La misma esencia ministerial, con múltiples formatos para reunir, transmitir y servir."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            {venue && siteSettings && (
              <VenueCard
                name={venue.name}
                address={siteSettings.address}
                schedule={siteSettings.schedule}
                image={urlForImage(venue.image).url()}
                imageAlt={venue.alt}
              />
            )}

            <div className="grid gap-4">
              {worshipServices.map((service) => (
                <WorshipServiceCard
                  key={service._id}
                  title={service.title}
                  description={service.description}
                  detail={service.detail}
                  cta={service.cta}
                />
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
