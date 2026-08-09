import type { Metadata } from "next";
import Link from "next/link";
import { ChaplainCard } from "@/components/chaplain-card";
import { ChaplaincyActivityRow } from "@/components/chaplaincy-activity-row";
import { PageHeader } from "@/components/page-header";
import { urlForBanner, urlForImage } from "@/sanity/lib/image";
import { fetchContent } from "@/sanity/lib/fetch";
import {
  chaplaincyActivitiesQuery,
  chaplainsQuery,
  pageBannerByRouteQuery,
  siteSettingsQuery,
} from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import {
  type Chaplain,
  type ChaplaincyActivity,
  type PageBanner,
  type SiteSettings,
} from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Capellanía",
};

/**
 * Los títulos de sección van escritos acá y no en el Studio a propósito: son
 * la ESTRUCTURA de la página, no su contenido. Si fueran editables, un título
 * cambiado por error dejaría la página sin sentido y nadie se daría cuenta.
 *
 * Editable queda lo que de verdad cambia con el tiempo: el párrafo que explica
 * qué es la capellanía, las actividades y los capellanes.
 *
 * La ruta sigue siendo `/capellanes` aunque la sección se llame "Capellanía":
 * cambiarla obligaría a migrar el `pageBanner` y a redirigir enlaces ya
 * compartidos, sin que el visitante gane nada.
 */

/**
 * Las situaciones salen del párrafo que la página ya venía mostrando —duelo,
 * crisis familiar, enfermedad, y cuando la vida pesa demasiado—. No es
 * contenido inventado: es el mismo, ordenado para que se lea de un vistazo.
 */
const SITUACIONES = [
  {
    title: "Duelo y pérdida",
    copy: "Acompañamiento en los primeros días y también en el tiempo largo que viene después.",
  },
  {
    title: "Crisis familiar",
    copy: "Un espacio de escucha para conflictos de pareja, de familia y de crianza.",
  },
  {
    title: "Enfermedad e internación",
    copy: "Visita, oración y presencia concreta en el hospital y en casa.",
  },
  {
    title: "Momentos de agobio",
    copy: "Cuando la vida se siente demasiado pesada para llevarla solo, aunque no haya una crisis.",
  },
];

export default async function CapellaniaPage() {
  const [banner, activities, chaplains, siteSettings] = await Promise.all([
    fetchContent<PageBanner | null>(pageBannerByRouteQuery, SANITY_TAGS.pageBanner, {
      route: "/capellanes",
    }),
    fetchContent<ChaplaincyActivity[]>(
      chaplaincyActivitiesQuery,
      SANITY_TAGS.chaplaincyActivity,
    ),
    fetchContent<Chaplain[]>(chaplainsQuery, SANITY_TAGS.chaplain),
    fetchContent<SiteSettings | null>(siteSettingsQuery, SANITY_TAGS.siteSettings),
  ]);

  const rnc = siteSettings?.rnc;


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

      <section className="bg-white/[0.03] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-gold-300/90">
            Capellanía
          </p>
          <h2 className="mt-4 font-serif text-4xl tracking-tight text-white sm:text-5xl">
            Qué es la capellanía
          </h2>

          {/* Este párrafo estaba escrito a mano en el código: explicaba de qué
              se trata la capellanía pero la iglesia no podía tocarlo. Ahora
              sale del Studio, y sin cargar no se dibuja. */}
          {banner?.chaplaincyIntro && (
            <p className="mt-6 max-w-3xl whitespace-pre-line text-lg leading-8 text-slate-300">
              {banner.chaplaincyIntro}
            </p>
          )}
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
            Para qué sirve
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            No hace falta atravesar una emergencia para pedir acompañamiento.
            Estos son los momentos en los que solemos estar.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {SITUACIONES.map((situacion) => (
              <div
                key={situacion.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/4 p-6 shadow-luxe"
              >
                <div className="h-1 w-10 rounded-full bg-gradient-to-r from-gold-300 to-gold-500" />
                <h3 className="mt-4 font-serif text-2xl text-white">
                  {situacion.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {situacion.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {activities.length > 0 && (
        <section className="bg-white/[0.03] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
              Qué hacemos
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Los ámbitos donde la capellanía está presente y acompaña.
            </p>

            <div className="mt-14 space-y-16 lg:space-y-8">
              {activities.map((activity, index) => (
                <ChaplaincyActivityRow
                  key={activity._id}
                  name={activity.name}
                  description={activity.description}
                  image={
                    activity.image
                      ? urlForImage(activity.image).url()
                      : undefined
                  }
                  imageAlt={activity.imageAlt}
                  reversed={index % 2 === 1}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {chaplains.length > 0 && (
            <>
              <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
                Quiénes acompañan
              </h2>
              <div className="mt-10 grid gap-5 lg:grid-cols-3">
                {chaplains.map((chaplain) => (
                  <ChaplainCard
                    key={chaplain._id}
                    name={chaplain.name}
                    role={chaplain.role}
                    description={chaplain.description}
                    badgeNumber={chaplain.badgeNumber}
                    image={urlForImage(chaplain.image).url()}
                    imageAlt={chaplain.imageAlt}
                  />
                ))}
              </div>
            </>
          )}

          <div className="mt-20 rounded-[2rem] border border-white/10 bg-ink-900/60 p-8 text-center shadow-luxe sm:p-12">
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

            {/* El RNC va acá y no en cualquier lado: es la inscripción que
                habilita a la capellanía a entrar a hospitales, comisarías y
                escuelas. Quien evalúa si abrirles la puerta lo busca, y una
                familia que duda si confiar también. */}
            {rnc?.number && (
              <p className="mx-auto mt-8 max-w-2xl text-xs leading-6 text-slate-500">
                Entidad religiosa inscripta en el Registro Nacional de Cultos
                bajo el N.º {rnc.number}
                {rnc.resolution ? `, Resolución ${rnc.resolution}` : ""}.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
