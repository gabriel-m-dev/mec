import Image from "next/image";
import { AnimatedSection } from "@/components/animated-section";
import { ChaplainCard } from "@/components/chaplain-card";
import { EventCard } from "@/components/event-card";
import { Hero } from "@/components/hero";
import { MinistryCard } from "@/components/ministry-card";
import { NewsCard } from "@/components/news-card";
import { SectionHeading } from "@/components/section-heading";
import { WorshipServiceCard } from "@/components/worship-service-card";
import {
  aboutStats,
  chaplains,
  events,
  ministries,
  news,
  worshipServices,
} from "@/lib/content";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-ink-950">
      <Hero />

      <AnimatedSection
        id="quienes-somos"
        className="border-b border-white/6 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.09),transparent_38%)] py-24 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Quiénes somos"
            title="Una iglesia con estética refinada y convicción espiritual"
            copy="MEC une excelencia visual, profundidad bíblica y un lenguaje contemporáneo para conectar con personas y familias que buscan dirección, comunidad y propósito."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/4 p-8 shadow-luxe backdrop-blur-md">
              <p className="text-lg leading-8 text-slate-200">
                Somos una comunidad que sirve con orden, belleza y reverencia.
                Creemos en una fe práctica, en la formación de discípulos y en
                una vida ministerial que impacta la ciudad con integridad.
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Nuestro enfoque integra adoración, cuidado pastoral, formación
                de liderazgos y presencia digital para que cada persona encuentre
                un lugar seguro para crecer.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {aboutStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-gold-300/15 bg-black/20 p-4"
                  >
                    <p className="font-serif text-3xl text-gold-200">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 shadow-luxe">
                <Image
                  src="/images/igle-background-desktop.png"
                  alt="Ambiente visual MEC"
                  width={1600}
                  height={900}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-ink-900/70 p-6">
                <p className="text-sm uppercase tracking-[0.32em] text-gold-300/90">
                  Visión
                </p>
                <p className="mt-3 text-lg leading-8 text-slate-200">
                  Ser una casa espiritual donde la presencia de Dios, la
                  excelencia ministerial y la compasión se encuentren en cada
                  experiencia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="ministerios" className="py-24 sm:py-28">
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

      <AnimatedSection
        id="capellanes"
        className="border-y border-white/6 bg-white/[0.03] py-24 sm:py-28"
      >
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

      <AnimatedSection id="cultos" className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Cultos presenciales y online"
            title="Una experiencia unificada para quienes están cerca y para quienes se conectan a distancia"
            copy="La misma esencia ministerial, con múltiples formatos para reunir, transmitir y servir."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 shadow-luxe">
              <Image
                src="/images/igle-background-mobile.png"
                alt="Culto MEC"
                width={1400}
                height={1800}
                className="h-full min-h-[420px] w-full object-cover"
              />
            </div>

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

      <AnimatedSection
        id="eventos"
        className="border-y border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] py-24 sm:py-28"
      >
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
                date={event.date}
                title={event.title}
                description={event.description}
                image={event.image}
                imageAlt={event.imageAlt}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="noticias" className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Noticias"
            title="Contenido institucional con ritmo editorial"
            copy="Actualizaciones, iniciativas y cobertura de comunidad para mantener la conexión viva."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {news.map((item) => (
              <NewsCard
                key={item.title}
                category={item.category}
                title={item.title}
                summary={item.summary}
                image={item.image}
                imageAlt={item.imageAlt}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="comunidad" className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-gold-300/20 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.22),rgba(2,5,12,0.95)_55%)] p-8 shadow-luxe sm:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:240%_100%] animate-shimmer" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-gold-300/90">
                  CTA comunidad
                </p>
                <h2 className="mt-4 font-serif text-4xl tracking-tight text-white sm:text-5xl">
                  Únete a una comunidad que ora, sirve y construye futuro
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                  Si buscas un lugar para crecer en fe, servir con propósito y
                  conectar con una iglesia sólida, este es tu punto de entrada.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="mailto:contacto@mec.com"
                    className="inline-flex items-center justify-center rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
                  >
                    Escribir al equipo
                  </a>
                  <a
                    href="/#inicio"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Volver arriba
                  </a>
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-ink-950/55 p-6 backdrop-blur-md">
                <p className="text-sm uppercase tracking-[0.3em] text-gold-300/90">
                  Contacto
                </p>
                <div className="mt-5 space-y-4 text-sm leading-7 text-slate-200">
                  <p>Av. Esperanza 123, Ciudad de Fe</p>
                  <p>Domingos 10:00 AM · Miércoles 7:30 PM</p>
                  <p>YouTube, Facebook Live y plataforma web</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
