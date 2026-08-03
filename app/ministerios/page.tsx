import type { Metadata } from "next";
import Link from "next/link";
import { MinistryCard } from "@/components/ministry-card";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { ministries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ministerios",
};

export default function MinisteriosPage() {
  return (
    <main className="relative overflow-hidden bg-ink-950">
      <PageHeader
        image="/images/pages/ministerios-banner.jpg"
        imageAlt="Equipo de voluntarios sirviendo juntos"
        eyebrow="Ministerios"
        title="Equipos que convierten la fe en acción concreta"
        description="Desde la adoración hasta el cuidado de niños, cada ministerio es un espacio para poner tus dones al servicio de la comunidad."
      />

      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Ministerios"
            title="Equipos diseñados para servir con precisión y calidez"
            copy="Cada ministerio está pensado como una puerta de entrada al discipulado, la acción y el cuidado mutuo."
          />

          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300">
            Un ministerio es simplemente un grupo de personas que decidió
            servir con lo que tiene — su tiempo, su talento y su historia —
            para sostener a otros. No hace falta experiencia previa ni un
            llamado espectacular: la mayoría de quienes sirven hoy empezaron
            ayudando en una sola actividad y, con el tiempo, encontraron ahí
            su lugar dentro de la iglesia.
          </p>

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

          <div className="mt-14 rounded-[2rem] border border-gold-300/20 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.16),rgba(2,5,12,0.9)_60%)] p-8 text-center shadow-luxe sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-gold-300/90">
              Cómo unirte
            </p>
            <h2 className="mt-4 font-serif text-3xl tracking-tight text-white sm:text-4xl">
              Contanos dónde te gustaría servir
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Escribinos y te ayudamos a encontrar el ministerio que mejor se
              ajuste a tus tiempos, tus dones y tu etapa de vida. No necesitás
              experiencia previa, solo disposición para servir.
            </p>
            <Link
              href="/contacto"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-gold-400 px-7 py-3 text-sm font-semibold text-ink-950 shadow-luxe transition hover:-translate-y-0.5 hover:bg-gold-300"
            >
              Quiero servir
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
