import Image from "next/image";
import Link from "next/link";

type EventCardProps = {
  day: string;
  time?: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  /** Dirección de la galería. Sin fotos cargadas no se pasa y la tarjeta no enlaza. */
  href?: string;
};

export function EventCard({
  day,
  time,
  title,
  description,
  image,
  imageAlt,
  href,
}: EventCardProps) {
  const card = (
    <article className="group h-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/4 shadow-luxe transition hover:-translate-y-1 hover:border-gold-300/25">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={image}
          alt={imageAlt ?? ""}
          fill
          sizes="(min-width: 768px) 30vw, 90vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0)_28%,rgba(2,5,12,0.55)_66%,rgba(2,5,12,0.95)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.18),transparent_45%)]" />

        <div className="absolute inset-x-0 top-0 p-6">
          <p className="inline-flex rounded-full border border-gold-300/35 bg-ink-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-gold-200 backdrop-blur-sm">
            {/* El horario es opcional: sin cargar, la píldora queda igual que
                antes en vez de mostrar un separador colgado. */}
            {time ? `${day} · ${time}` : day}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-gold-300 to-gold-500" />
          <h3 className="mt-3 font-serif text-2xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">
            {title}
          </h3>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm leading-7 text-slate-300">{description}</p>
        {href && (
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 transition group-hover:text-gold-200">
            Reviví el último <span aria-hidden="true">→</span>
          </p>
        )}
      </div>
    </article>
  );

  // Un solo anchor envolviendo la tarjeta entera. Adentro no hay ningún otro
  // enlace — anidar <a> es HTML inválido y el navegador reacomoda el DOM en
  // silencio, que es justo lo que nos pasó con los highlights del inicio.
  if (!href) return card;

  return (
    <Link href={href} className="block h-full rounded-[1.75rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300">
      {card}
    </Link>
  );
}
