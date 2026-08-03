import type { Metadata } from "next";
import { AnimatedSection } from "@/components/animated-section";
import { ChaplainCard } from "@/components/chaplain-card";
import { SectionHeading } from "@/components/section-heading";
import { chaplains } from "@/lib/content";

export const metadata: Metadata = {
  title: "Capellanes",
};

export default function CapellanesPage() {
  return (
    <main className="relative overflow-hidden bg-ink-950">
      <AnimatedSection className="bg-white/[0.03] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Capellanes"
            title="Acompañamiento espiritual con criterio y sensibilidad"
            copy="Un equipo preparado para cuidar, escuchar y orientar procesos personales, familiares e institucionales."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {chaplains.map((chaplain) => (
              <ChaplainCard
                key={chaplain.name}
                name={chaplain.name}
                role={chaplain.role}
                description={chaplain.description}
                image={chaplain.image}
                imageAlt={chaplain.imageAlt}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
