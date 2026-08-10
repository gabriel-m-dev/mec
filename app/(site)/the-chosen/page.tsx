import type { Metadata } from "next";
import { ChosenActivityCard } from "@/components/chosen-activity-card";
import { ChosenLeaderCard } from "@/components/chosen-leader-card";
import { PageHeader } from "@/components/page-header";
import { urlForBanner, urlForImage } from "@/sanity/lib/image";
import { fetchContent } from "@/sanity/lib/fetch";
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
 * La tarjeta enlaza SOLO si la actividad tiene fotos cargadas. Sin galería la
 * página sería el título y una fecha —menos de lo que ya muestra la tarjeta— y
 * la ruta hace 404, así que enlazar llevaría a un callejón sin salida.
 *
 * La regla vive acá y no en la tarjeta para que sea la misma que usa
 * `generateStaticParams`: si divergen, se prerenderiza una página que nadie
 * enlaza, o se enlaza una que no existe.
 */
function galleryHref(activity: ChosenActivity): string | undefined {
  const slug = activity.slug?.current;
  const tieneFotos = (activity.gallery?.length ?? 0) > 0;

  return slug && tieneFotos ? `/the-chosen/${slug}` : undefined;
}

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
    fetchContent<PageBanner | null>(pageBannerByRouteQuery, SANITY_TAGS.pageBanner, {
      route: "/the-chosen",
    }),
    fetchContent<ChosenLeader | null>(chosenLeaderQuery, SANITY_TAGS.chosenLeader),
    fetchContent<ChosenActivity[]>(chosenActivitiesQuery, SANITY_TAGS.chosenActivity),
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
                  time={activity.time}
                  place={activity.place}
                  image={urlForImage(activity.image).url()}
                  imageAlt={activity.imageAlt}
                  isPast
                  href={galleryHref(activity)}
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
                  time={activity.time}
                  place={activity.place}
                  image={urlForImage(activity.image).url()}
                  imageAlt={activity.imageAlt}
                  href={galleryHref(activity)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/*
        Va al final, después de las actividades: primero se muestra QUÉ hace
        el grupo y recién después quién lo coordina, que es también donde
        tiene sentido la invitación a sumarse con la que cierra la tarjeta.

        Sin tinte de fondo a propósito. Las secciones alternan fondo, y
        "Actividades próximas" —la de arriba— ya lo lleva: repetirlo acá
        dejaría dos bloques teñidos pegados y se leerían como uno solo.
      */}
      {leader && (
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
              Equipo de The Chosen
            </h2>
            <div
              aria-hidden="true"
              className="mt-5 h-0.5 w-[6.75rem] rounded-full bg-gradient-to-r from-gold-400 to-gold-500/30"
            />
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
    </main>
  );
}
