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
 * Antes la tarjeta ocupaba los 1280px del contenedor con una foto vertical de
 * 320px y una descripción corta: quedaba un vacío enorme a la derecha. La
 * versión anterior tenía razón en ser ancha —hay UNA sola persona y una
 * tarjeta angosta en una grilla de tres deja huecos— pero se pasó para el otro
 * lado.
 *
 * Ahora se limita a `max-w-4xl` y NO se centra: alinea a la izquierda con el
 * título de la sección. El ancho lo pone el texto, no el contenedor.
 *
 * La foto pasa a cuadrada y chica. En una tarjeta de presentación la cara
 * alcanza; una vertical de 4/5 pedía relleno alrededor para no quedar sola.
 */
export function ChosenLeaderCard({
  name,
  role,
  description,
  image,
  imageAlt,
}: ChosenLeaderCardProps) {
  return (
    <article className="max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-luxe backdrop-blur-sm">
      <div className="flex flex-col gap-7 p-7 sm:flex-row sm:items-center sm:gap-9 sm:p-9">
        {image && (
          <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 sm:h-44 sm:w-44">
            <Image
              src={image}
              alt={imageAlt ?? ""}
              fill
              sizes="176px"
              className="object-cover"
            />
          </div>
        )}

        {/* `min-w-0` para que el texto largo pueda encogerse dentro del flex
            en vez de empujar la foto fuera de la tarjeta. */}
        <div className="min-w-0">
          {/* El rol como píldora y no como línea de versalitas anchas: ocupa
              menos, se lee de un golpe y deja el nombre como lo primero
              grande que ve el ojo. */}
          <p className="inline-flex rounded-full border border-gold-300/25 bg-gold-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-gold-200">
            {role}
          </p>

          <h3 className="mt-4 font-serif text-3xl tracking-tight text-white sm:text-4xl">
            {name}
          </h3>

          <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-slate-300">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}
