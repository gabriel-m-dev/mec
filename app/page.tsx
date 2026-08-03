import { AnimatedSection } from "@/components/animated-section";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { VenueCard } from "@/components/venue-card";
import { WorshipServiceCard } from "@/components/worship-service-card";
import { heroHighlights, venue, worshipServices } from "@/lib/content";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-ink-950">
      <Hero />

      <AnimatedSection className="relative overflow-hidden border-b border-white/6 bg-ink-950 py-14 sm:py-20">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {heroHighlights.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-white/10 bg-ink-950/60 p-5 text-left shadow-luxe backdrop-blur-md"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-gold-300/90">
                  {item.title}
                </p>
                <p className="mt-3 font-serif text-4xl text-white">{item.value}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </AnimatedSection>

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
