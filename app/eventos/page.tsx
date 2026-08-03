import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { events } from "@/lib/content";

export const metadata: Metadata = {
  title: "Eventos",
};

export default function EventosPage() {
  return (
    <main className="relative overflow-hidden bg-ink-950">
      <PageHeader
        image="/images/pages/eventos-banner.jpg"
        imageAlt="Orador presentando ante una audiencia en un evento"
        eyebrow="Eventos"
        title="Encuentros para vivir la fe más allá del domingo"
        description="Vigilias, conferencias, retiros y jornadas de servicio pensadas para distintas etapas de tu caminar con Dios."
      />

      <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Eventos"
            title="Fechas clave para conectar, crecer y servir"
            copy="Una agenda clara que ayuda a la comunidad a planificar su participación."
          />

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
      </section>
    </main>
  );
}
