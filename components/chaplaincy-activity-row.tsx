import Image from "next/image";

type ChaplaincyActivityRowProps = {
  name: string;
  description: string;
  /** Opcional: sin foto, la fila se dibuja solo con el texto. */
  image?: string;
  imageAlt?: string;
  /** Filas impares: la imagen pasa a la derecha y el bloque baja un poco. */
  reversed?: boolean;
};

/**
 * Una actividad de capellanía, en fila ancha con la imagen a un lado y el
 * texto al otro, alternando de lado en cada fila.
 *
 * Reemplazó a una grilla de tarjetas chicas: ahí la foto quedaba del tamaño
 * de una miniatura y no se distinguía un hospital de una comisaría, que es
 * justamente lo que la imagen tiene que comunicar acá.
 *
 * El desfase vertical (`lg:mt-16`) es solo en pantallas grandes: en móvil todo
 * se apila en una columna y un margen extra sería un hueco sin sentido.
 */
export function ChaplaincyActivityRow({
  name,
  description,
  image,
  imageAlt,
  reversed = false,
}: ChaplaincyActivityRowProps) {
  const text = (
    <div className={image && reversed ? "lg:order-1" : ""}>
      <h3 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
        {name}
      </h3>
      <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
        {description}
      </p>
    </div>
  );

  // Sin foto no se dibuja media fila vacía: la actividad se muestra como un
  // bloque de texto y sigue siendo legible. Cuando la iglesia cargue la
  // imagen, la fila pasa sola al formato de dos columnas.
  if (!image) {
    return <article className="max-w-3xl">{text}</article>;
  }

  return (
    <article
      className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
        reversed ? "lg:mt-16" : ""
      }`}
    >
      <div
        className={`relative aspect-[16/10] w-full overflow-hidden rounded-[1.75rem] border border-white/10 shadow-luxe ${
          reversed ? "lg:order-2" : ""
        }`}
      >
        <Image
          src={image}
          alt={imageAlt ?? ""}
          fill
          sizes="(min-width: 1024px) 45vw, 92vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0)_55%,rgba(2,5,12,0.65)_100%)]" />
      </div>

      {text}
    </article>
  );
}
