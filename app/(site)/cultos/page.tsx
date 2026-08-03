import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { VenueCard } from "@/components/venue-card";
import { WorshipServiceCard } from "@/components/worship-service-card";
import { urlForImage } from "@/sanity/lib/image";
import { sanityClient } from "@/sanity/lib/client";
import {
  pageBannerByRouteQuery,
  siteSettingsQuery,
  venueQuery,
  worshipServicesQuery,
} from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import type { PageBanner, SiteSettings, Venue, WorshipService } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Cultos",
};

const faqs = [
  {
    question: "¿Necesito registrarme para asistir?",
    answer:
      "No es obligatorio. Podés llegar directamente a cualquiera de nuestros cultos; si querés que te reservemos un lugar en un evento especial, avisanos por contacto.",
  },
  {
    question: "¿Hay actividades para niños durante el culto?",
    answer:
      "Sí, contamos con espacio de niños y familias durante el culto de domingo, con material acorde a cada edad y un equipo de voluntarios a cargo.",
  },
  {
    question: "¿Cómo llego en transporte público?",
    answer:
      "El auditorio se encuentra a pocas cuadras de las principales líneas de colectivo del centro, con parada a menos de 5 minutos caminando.",
  },
  {
    question: "¿Puedo participar solo de la transmisión en vivo?",
    answer:
      "Por supuesto. Muchas personas de nuestra comunidad se conectan cada semana por YouTube o Facebook Live y participan del chat y la oración en línea.",
  },
];

export default async function CultosPage() {
  const [banner, siteSettings, venue, worshipServices] = await Promise.all([
    sanityClient.fetch<PageBanner | null>(
      pageBannerByRouteQuery,
      { route: "/cultos" },
      { cache: "force-cache", next: { tags: [SANITY_TAGS.pageBanner] } },
    ),
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.siteSettings] },
    }),
    sanityClient.fetch<Venue | null>(venueQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.venue] },
    }),
    sanityClient.fetch<WorshipService[]>(worshipServicesQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.worshipService] },
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

      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Cultos presenciales y online"
            title="Una experiencia unificada para quienes están cerca y para quienes se conectan a distancia"
            copy="La misma esencia ministerial, con múltiples formatos para reunir, transmitir y servir."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            {venue && siteSettings && (
              <VenueCard
                name={venue.name}
                address={siteSettings.address}
                schedule={siteSettings.schedule}
                image={urlForImage(venue.image).url()}
                imageAlt={venue.alt}
              />
            )}

            <div className="grid gap-4">
              {worshipServices.map((service) => (
                <WorshipServiceCard
                  key={service._id}
                  title={service.title}
                  description={service.description}
                  detail={service.detail}
                  cta={service.cta}
                />
              ))}
            </div>
          </div>

          <div className="mt-14">
            <SectionHeading
              eyebrow="Preguntas frecuentes"
              title="Antes de tu primera visita"
              copy="Algunas respuestas rápidas para que llegues sin dudas al auditorio."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-[1.75rem] border border-white/10 bg-white/4 p-6 shadow-luxe"
                >
                  <p className="font-serif text-lg text-white">{faq.question}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
