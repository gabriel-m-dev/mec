import type { Metadata } from "next";
import { ChosenActivityCard } from "@/components/chosen-activity-card";
import { ChosenLeaderCard } from "@/components/chosen-leader-card";
import { PageHeader } from "@/components/page-header";
import { urlForBanner, urlForImage } from "@/sanity/lib/image";
import { sanityClient } from "@/sanity/lib/client";
import {
  chosenActivitiesQuery,
  chosenLeaderQuery,
  pageBannerByRouteQuery,
} from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import type {
  ChosenActivity,
  ChosenLeader,
  PageBanner,
} from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "The Chosen",
};

/**
 * The Chosen — el grupo de chicos que organiza la iglesia.
 *
 * Reemplazó a `/ministerios`. El documento del banner conserva su `_id` viejo
 * (`pageBanner-ministerios`) y solo se le migró el campo `route`, para no
 * perder la imagen ni los textos ya cargados. La ruta vieja redirige acá desde
 * `next.config.mjs`.
 *
 * Igual que en Capellanía, los títulos de sección van escritos acá: son la
 * estructura de la página. Editable es lo que cambia — la persona a cargo y
 * las actividades.
 */
export default async function TheChosenPage() {
  const [banner, leader, activities] = await Promise.all([
    sanityClient.fetch<PageBanner | null>(
      pageBannerByRouteQuery,
      { route: "/the-chosen" },
      { cache: "force-cache", next: { tags: [SANITY_TAGS.pageBanner] } },
    ),
    sanityClient.fetch<ChosenLeader | null>(chosenLeaderQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.chosenLeader] },
    }),
    sanityClient.fetch<ChosenActivity[]>(chosenActivitiesQuery, {}, {
      cache: "force-cache",
      next: { tags: [SANITY_TAGS.chosenActivity] },
    }),
  ]);

  // Un solo viaje a Sanity y dos listas: separar por el campo `when` acá es
  // más barato que hacer dos consultas casi idénticas.
  const recent = activities.filter((activity) => activity.when === "recent");
  const upcoming = activities.filter(
    (activity) => activity.when === "upcoming",
  );

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

      {leader && (
        <section className="bg-white/[0.03] py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
              Persona a cargo
            </h2>
            <div className="mt-10">
              <ChosenLeaderCard
                name={leader.name}
                role={leader.role}
                description={leader.description}
                image={
                  leader.image ? urlForImage(leader.image).url() : undefined
                }
                imageAlt={leader.imageAlt}
              />
            </div>
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
              Actividades recientes
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Lo que vivimos hace poco con los chicos.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((activity) => (
                <ChosenActivityCard
                  key={activity._id}
                  title={activity.title}
                  date={activity.date}
                  image={urlForImage(activity.image).url()}
                  imageAlt={activity.imageAlt}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="bg-white/[0.03] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
              Actividades próximas
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Lo que viene. Las familias son bienvenidas a acompañar.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((activity) => (
                <ChosenActivityCard
                  key={activity._id}
                  title={activity.title}
                  date={activity.date}
                  image={urlForImage(activity.image).url()}
                  imageAlt={activity.imageAlt}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
