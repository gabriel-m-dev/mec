import type { Metadata } from "next";
import { AnimatedSection } from "@/components/animated-section";
import { MinistryCard } from "@/components/ministry-card";
import { SectionHeading } from "@/components/section-heading";
import { ministries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ministerios",
};

export default function MinisteriosPage() {
  return (
    <main className="relative overflow-hidden bg-ink-950">
      <AnimatedSection className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Ministerios"
            title="Equipos diseñados para servir con precisión y calidez"
            copy="Cada ministerio está pensado como una puerta de entrada al discipulado, la acción y el cuidado mutuo."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {ministries.map((ministry) => (
              <MinistryCard
                key={ministry.name}
                name={ministry.name}
                description={ministry.description}
                image={ministry.image}
                imageAlt={ministry.imageAlt}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
