import Image from "next/image";

type ChaplaincyActivityCardProps = {
  name: string;
  day: string;
  time?: string;
  description: string;
  image: string;
  imageAlt: string;
};

/**
 * Tarjeta chica de una actividad de capellanía.
 *
 * Es deliberadamente más baja que `EventCard` —`aspect-[16/10]` contra
 * `aspect-[4/5]`— y entra en una grilla de cuatro. En esta página las
 * actividades van ARRIBA de los capellanes, y si tuvieran el mismo peso
 * visual competirían con las personas, que son el contenido principal.
 *
 * No enlaza a ningún lado: una actividad se cuenta entera acá.
 */
export function ChaplaincyActivityCard({
  name,
  day,
  time,
  description,
  image,
  imageAlt,
}: ChaplaincyActivityCardProps) {
  return (
    <article className="group h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/4 shadow-luxe transition hover:-translate-y-1 hover:border-gold-300/25">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0)_35%,rgba(2,5,12,0.85)_100%)]" />

        <div className="absolute inset-x-0 top-0 p-4">
          {/* Mismo criterio que en los eventos: sin horario cargado, la
              píldora muestra solo el día en vez de un separador colgado. */}
          <p className="inline-flex rounded-full border border-gold-300/35 bg-ink-950/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-200 backdrop-blur-sm">
            {time ? `${day} · ${time}` : day}
          </p>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-serif text-xl leading-tight text-white">{name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      </div>
    </article>
  );
}
