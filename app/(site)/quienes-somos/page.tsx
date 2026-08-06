import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import {
  ServeHandsIcon,
  ShieldCrossIcon,
  UsersIcon,
} from "@/components/feature-icons";
import { sanityClient } from "@/sanity/lib/client";
import { urlForBanner, urlForImage } from "@/sanity/lib/image";
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

  const introParagraphs = banner?.introParagraphs ?? [];
  const stats = banner?.stats ?? [];
  const story = banner?.story;
  const values = banner?.values ?? [];

  return (
    <main className="relative overflow-hidden bg-ink-950">
      {banner && (
        <PageHeader
          image={banner.image ? urlForBanner(banner.image).url() : undefined}
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
              {introParagraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={
                    index === 0
                      ? "text-lg leading-8 text-slate-200"
                      : "mt-6 text-lg leading-8 text-slate-300"
                  }
                >
                  {paragraph}
                </p>
              ))}

              {stats.length > 0 && (
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {stats.map((item) => (
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
              )}
            </div>

            <div className="grid gap-4">
              {banner?.introImage && (
                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 shadow-luxe">
                  <Image
                    src={urlForImage(banner.introImage).width(1600).url()}
                    alt={banner.introImageAlt ?? ""}
                    width={1600}
                    height={900}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              {banner?.vision && (
                <div className="rounded-[2rem] border border-white/10 bg-ink-900/70 p-6">
                  {banner.vision.eyebrow && (
                    <p className="text-sm uppercase tracking-[0.32em] text-gold-300/90">
                      {banner.vision.eyebrow}
                    </p>
                  )}
                  <p className="mt-3 text-lg leading-8 text-slate-200">
                    {banner.vision.body}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Igual que la banda de valores: sin el bloque cargado no queda una
          sección a medio armar, directamente no se muestra. */}
      {story && (
        <section className="py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              {story.image && (
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 shadow-luxe">
                  <Image
                    src={urlForImage(story.image).width(900).url()}
                    alt={story.imageAlt ?? ""}
                    fill
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                {story.eyebrow && (
                  <p className="text-xs font-semibold uppercase tracking-[0.36em] text-gold-300/90">
                    {story.eyebrow}
                  </p>
                )}
                <h2 className="mt-4 font-serif text-3xl tracking-tight text-white sm:text-4xl">
                  {story.title}
                </h2>
                {(story.paragraphs ?? []).map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className={
                      index === 0
                        ? "mt-6 text-lg leading-8 text-slate-300"
                        : "mt-5 text-lg leading-8 text-slate-300"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

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
              {values.map((value) => {
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
