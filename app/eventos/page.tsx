import type { Metadata } from "next";
import { AnimatedSection } from "@/components/animated-section";
import { EventCard } from "@/components/event-card";
import { SectionHeading } from "@/components/section-heading";
import { events } from "@/lib/content";

export const metadata: Metadata = {
  title: "Eventos",
};

export default function EventosPage() {
  return (
    <main className="relative overflow-hidden bg-ink-950">
      <AnimatedSection className="bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Eventos"
            title="Fechas clave para conectar, crecer y servir"
            copy="Una agenda clara que ayuda a la comunidad a planificar su participación."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.title}
                day={event.day}
                title={event.title}
                description={event.description}
                image={event.image}
                imageAlt={event.imageAlt}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
