import type { Metadata } from "next";
import Link from "next/link";
import { ChaplainCard } from "@/components/chaplain-card";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { urlForImage } from "@/sanity/lib/image";
import { sanityClient } from "@/sanity/lib/client";
import { chaplainsQuery, pageBannerByRouteQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import type { Chaplain, PageBanner } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Capellanes",
};

export default async function CapellanesPage() {
  const [banner, chaplains] = await Promise.all([
    sanityClient.fetch<PageBanner | null>(
      pageBannerByRouteQuery,
      { route: "/capellanes" },
      { cache: "force-cache", next: { tags: [SANITY_TAGS.pageBanner] } },
    ),
    sanityClient.fetch<Chaplain[]>(chaplainsQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.chaplain] },
    }),
  ]);

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

      <section className="bg-white/[0.03] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Capellanes"
            title="Acompañamiento espiritual con criterio y sensibilidad"
            copy="Un equipo preparado para cuidar, escuchar y orientar procesos personales, familiares e institucionales."
          />

          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300">
            El programa de capellanía existe para que nadie atraviese un
            momento difícil en soledad. Nuestros capellanes ofrecen escucha
            confidencial, oración y orientación práctica en situaciones de
            duelo, crisis familiar, enfermedad o simplemente cuando la vida
            se siente demasiado pesada para llevarla solos.
          </p>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {chaplains.map((chaplain) => (
              <ChaplainCard
                key={chaplain._id}
                name={chaplain.name}
                role={chaplain.role}
                description={chaplain.description}
                image={urlForImage(chaplain.image).url()}
                imageAlt={chaplain.imageAlt}
              />
            ))}
          </div>

          <div className="mt-14 rounded-[2rem] border border-white/10 bg-ink-900/60 p-8 text-center shadow-luxe sm:p-12">
            <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
              ¿Necesitás hablar con alguien?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
              No hace falta esperar a una crisis para pedir acompañamiento.
              Escribinos con confianza y coordinamos una conversación
              privada con uno de nuestros capellanes.
            </p>
            <Link
              href="/contacto"
              className="mt-7 inline-flex items-center justify-center rounded-full border border-gold-300/35 bg-white/5 px-7 py-3 text-sm font-semibold text-gold-100 transition hover:border-gold-200/70 hover:bg-gold-400/10"
            >
              Solicitar acompañamiento
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
