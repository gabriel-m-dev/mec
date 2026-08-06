import Image from "next/image";

type ChosenActivityCardProps = {
  title: string;
  date?: string;
  image: string;
  imageAlt: string;
};

/**
 * Una actividad de The Chosen dentro de la grilla.
 *
 * La imagen manda: acá lo que cuenta la actividad es la foto —chicos en el
 * día del niño, una salida, un campamento— y el título es la etiqueta. Por eso
 * el texto va SOBRE la foto y no debajo, como en las tarjetas de eventos.
 */
export function ChosenActivityCard({
  title,
  date,
  image,
  imageAlt,
}: ChosenActivityCardProps) {
  return (
    <article className="group relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10 shadow-luxe transition hover:-translate-y-1 hover:border-gold-300/25">
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      {/* El degradado no es decorativo: sin él, un título blanco sobre una
          foto clara queda ilegible. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0)_40%,rgba(2,5,12,0.85)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        {date && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-200">
            {date}
          </p>
        )}
        <h3 className="mt-1 font-serif text-2xl leading-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">
          {title}
        </h3>
      </div>
    </article>
  );
}
