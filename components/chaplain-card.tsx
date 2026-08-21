import Image from "next/image";
import Link from "next/link";

type ChaplainCardProps = {
  name: string;
  role: string;
  description: string;
  /** Opcional: sin número, la tarjeta no dibuja la placa. */
  badgeNumber?: string;
  image: string;
  imageAlt?: string;
  /**
   * La página propia del capellán. Sin slug cargado no hay página, así que
   * la tarjeta no enlaza en vez de llevar a un 404 — pasa con los capellanes
   * cargados antes de este campo, hasta que se les corra la migración.
   */
  slug?: string;
};

export function ChaplainCard({
  name,
  role,
  description,
  badgeNumber,
  image,
  imageAlt,
  slug,
}: ChaplainCardProps) {
  const card = (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/4 shadow-luxe transition hover:-translate-y-1 hover:border-gold-300/25">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={image}
          alt={imageAlt ?? ""}
          fill
          sizes="(min-width: 1024px) 23vw, 45vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0)_28%,rgba(2,5,12,0.55)_66%,rgba(2,5,12,0.95)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.18),transparent_45%)]" />

        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-gold-300 to-gold-500" />
          <h3 className="mt-3 font-serif text-2xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">
            {name}
          </h3>
          <p className="mt-1 text-sm uppercase tracking-[0.24em] text-gold-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
            {role}
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* La placa va ANTES de la descripción y no dentro de la foto: es un
            dato de identidad, y sobre la imagen tendría que competir con el
            nombre y el cargo, que son lo primero que hay que leer.

            `tabular-nums` para que todas las cifras midan lo mismo: sin eso,
            en una fila de tres capellanes los números quedan de distinto largo
            aunque tengan la misma cantidad de dígitos. */}
        {badgeNumber && (
          <p className="mb-4 inline-flex rounded-full border border-gold-300/25 bg-gold-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-200 tabular-nums">
            Placa N.º {badgeNumber}
          </p>
        )}
        <p className="text-sm leading-7 text-slate-300">{description}</p>
      </div>
    </article>
  );

  if (!slug) return card;

  return (
    <Link
      href={`/capellan/${slug}`}
      className="block rounded-[1.75rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
    >
      {card}
    </Link>
  );
}
