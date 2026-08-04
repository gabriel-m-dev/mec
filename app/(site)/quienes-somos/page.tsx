import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import {
  ServeHandsIcon,
  ShieldCrossIcon,
  UsersIcon,
} from "@/components/feature-icons";
import { aboutStats, aboutValues } from "@/lib/content";
import { sanityClient } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { pageBannerByRouteQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import { PAGE_SECTION_KEYS, type PageBanner } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Quiénes somos",
};

const valueIcons = {
  shield: ShieldCrossIcon,
  users: UsersIcon,
  serve: ServeHandsIcon,
};

export default async function QuienesSomosPage() {
  const banner = await sanityClient.fetch<PageBanner | null>(
    pageBannerByRouteQuery,
    { route: "/quienes-somos" },
    { cache: "force-cache", next: { tags: [SANITY_TAGS.pageBanner] } },
  );

  const mainSection = banner?.sections?.find(
    (section) => section.key === PAGE_SECTION_KEYS.MAIN,
  );
  const valuesSection = banner?.sections?.find(
    (section) => section.key === PAGE_SECTION_KEYS.VALUES,
  );

  return (
    <main className="relative overflow-hidden bg-ink-950">
      {banner && (
        <PageHeader
          image={banner.image ? urlForImage(banner.image).url() : undefined}
          imageAlt={banner.imageAlt ?? ""}
          eyebrow={banner.eyebrow ?? ""}
          title={banner.title}
          description={banner.description ?? ""}
        />
      )}

      <section className="bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.09),transparent_38%)] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {mainSection && (
            <SectionHeading
              eyebrow={mainSection.eyebrow ?? ""}
              title={mainSection.title}
              copy={mainSection.copy}
            />
          )}

          <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/4 p-8 shadow-luxe backdrop-blur-md">
              <p className="text-lg leading-8 text-slate-200">
                Somos una comunidad que sirve con orden, belleza y reverencia.
                Creemos en una fe práctica, en la formación de discípulos y en
                una vida ministerial que impacta la ciudad con integridad.
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Nuestro enfoque integra adoración, cuidado pastoral, formación
                de liderazgos y presencia digital para que cada persona
                encuentre un lugar seguro para crecer.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {aboutStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-gold-300/15 bg-black/20 p-4"
                  >
                    <p className="font-serif text-3xl text-gold-200">
                      {item.value}
                    </p>
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
      </section>

      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 shadow-luxe">
              <Image
                src="/images/ministries/alabanza.jpg"
                alt="Primeros encuentros de adoración de la congregación"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.36em] text-gold-300/90">
                Nuestra historia
              </p>
              <h2 className="mt-4 font-serif text-3xl tracking-tight text-white sm:text-4xl">
                De una sala prestada a una casa para toda la ciudad
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                MEC nació hace más de quince años como un pequeño grupo de
                familias que se reunía en una sala prestada para orar, leer la
                Palabra y sostenerse mutuamente en tiempos difíciles. Lo que
                empezó como un encuentro semanal de puertas cerradas se
                transformó, con constancia y fe, en una congregación que hoy
                reúne a cientos de personas cada semana.
              </p>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                A lo largo de este camino aprendimos que crecer no significa
                perder cercanía: cada nuevo ministerio, cada nueva sede y cada
                nueva transmisión en vivo sigue existiendo para lo mismo que nos
                reunió al principio — acompañar personas y apuntarlas a Cristo
                con excelencia y calidez.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* La sección entera depende de su encabezado, igual que el bloque de
          preguntas frecuentes en /cultos: sin título, las tarjetas quedan
          huérfanas en una banda tintada, sin nada que explique qué son. */}
      {valuesSection && (
        <section className="bg-white/[0.03] py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={valuesSection.eyebrow ?? ""}
              title={valuesSection.title}
              copy={valuesSection.copy}
              align="center"
            />

            <div className="mt-14 grid gap-5 sm:grid-cols-3">
              {aboutValues.map((value) => {
                const Icon = valueIcons[value.icon];
                return (
                  <div
                    key={value.title}
                    className="rounded-[1.75rem] border border-white/10 bg-white/4 p-7 text-center shadow-luxe transition hover:-translate-y-1 hover:border-gold-300/25"
                  >
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold-300/30 bg-gold-400/10 text-gold-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-serif text-2xl text-white">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
