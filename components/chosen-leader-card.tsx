import Image from "next/image";

type ChosenLeaderCardProps = {
  name: string;
  role: string;
  description: string;
  /** Opcional: sin foto, la tarjeta se muestra solo con el texto. */
  image?: string;
  imageAlt?: string;
};

/**
 * La persona a cargo de The Chosen.
 *
 * Es una tarjeta ancha, con la foto al costado, y no una del mismo tamaño que
 * las de capellanes: acá hay UNA sola persona. Una tarjeta angosta y solitaria
 * en una grilla de tres deja dos huecos y parece que falta contenido.
 */
export function ChosenLeaderCard({
  name,
  role,
  description,
  image,
  imageAlt,
}: ChosenLeaderCardProps) {
  return (
    <article className="grid gap-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 p-6 shadow-luxe sm:p-8 lg:grid-cols-[320px_1fr] lg:items-center lg:gap-10">
      {image && (
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] border border-white/10">
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            sizes="(min-width: 1024px) 320px, 90vw"
            className="object-cover"
          />
        </div>
      )}

      <div>
        <div className="h-1 w-12 rounded-full bg-gradient-to-r from-gold-300 to-gold-500" />
        <h3 className="mt-4 font-serif text-3xl tracking-tight text-white sm:text-4xl">
          {name}
        </h3>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-gold-300/90">
          {role}
        </p>
        <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-8 text-slate-300">
          {description}
        </p>
      </div>
    </article>
  );
}
