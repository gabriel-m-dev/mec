import { AnimatedSection } from "@/components/animated-section";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { VenueCard } from "@/components/venue-card";
import { WorshipServiceCard } from "@/components/worship-service-card";
import { venue, worshipServices } from "@/lib/content";

export default function HomePage() {
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
            <VenueCard
              name={venue.name}
              address={venue.address}
              schedule={venue.schedule}
              image={venue.image}
              imageAlt={venue.imageAlt}
            />

            <div className="grid gap-4">
              {worshipServices.map((service) => (
                <WorshipServiceCard
                  key={service.title}
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
