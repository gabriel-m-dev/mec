import Image from "next/image";
import Link from "next/link";

type ChosenActivityCardProps = {
  title: string;
  date: string;
  time?: string;
  place?: string;
  image: string;
  imageAlt: string;
  /** Si ya pasó, el pie dice "Ver las fotos"; si no, "Más información". */
  isPast?: boolean;
  /** Dirección de la galería. Sin fotos cargadas no se pasa y no enlaza. */
  href?: string;
};

/**
 * Una actividad de The Chosen dentro de la grilla.
 *
 * La imagen manda: lo que cuenta la actividad es la foto —chicos en el día del
 * niño, una salida, un campamento— y el título es la etiqueta. Por eso el
 * texto va SOBRE la foto y no debajo.
 *
 * Enlaza a su galería solo cuando tiene fotos cargadas, igual que las tarjetas
 * de eventos: sin fotos la página sería el título y una fecha, menos de lo que
 * ya muestra la tarjeta.
 */
export function ChosenActivityCard({
  title,
  date,
  time,
  place,
  image,
  imageAlt,
  isPast = false,
  href,
}: ChosenActivityCardProps) {
  // Cuándo y dónde, en una sola línea. El lugar solo aparece si la actividad
  // NO es en la iglesia, así no se repite la dirección en cada tarjeta.
  const cuando = [date, time].filter(Boolean).join(" · ");

  const card = (
    <article className="group relative aspect-[4/3] h-full overflow-hidden rounded-[1.5rem] border border-white/10 shadow-luxe transition hover:-translate-y-1 hover:border-gold-300/25">
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      {/* El degradado no es decorativo: sin él, un título blanco sobre una
          foto clara queda ilegible. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0)_35%,rgba(2,5,12,0.9)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="inline-flex rounded-full border border-gold-300/35 bg-ink-950/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-200 backdrop-blur-sm">
          {cuando}
        </p>

        <h3 className="mt-2.5 font-serif text-2xl leading-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">
          {title}
        </h3>

        {place && (
          <p className="mt-1 text-xs leading-5 text-slate-300">{place}</p>
        )}

        {href && (
          <p className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 transition group-hover:text-gold-200">
            {isPast ? "Ver las fotos" : "Más información"}{" "}
            <span aria-hidden="true">→</span>
          </p>
        )}
      </div>
    </article>
  );

  // Un solo anchor envolviendo la tarjeta entera. Adentro no hay ningún otro
  // enlace: anidar <a> es HTML inválido y el navegador reacomoda el DOM en
  // silencio.
  if (!href) return card;

  return (
    <Link
      href={href}
      className="block h-full rounded-[1.5rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
    >
      {card}
    </Link>
  );
}
