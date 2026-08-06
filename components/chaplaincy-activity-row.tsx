import Image from "next/image";

type ChaplaincyActivityRowProps = {
  name: string;
  day: string;
  time?: string;
  description: string;
  image: string;
  imageAlt: string;
  /** Filas impares: la imagen pasa a la derecha y el bloque baja un poco. */
  reversed?: boolean;
};

/**
 * Una actividad de capellanía, en fila ancha con la imagen a un lado y el
 * texto al otro, alternando de lado en cada fila.
 *
 * Reemplaza a la grilla de cuatro tarjetas chicas: ahí la foto quedaba del
 * tamaño de una miniatura y no se distinguía un hospital de una comisaría,
 * que es justamente lo que la imagen tiene que comunicar acá.
 *
 * El desfase vertical (`lg:mt-16`) es solo en pantallas grandes: en móvil todo
 * se apila en una columna y un margen extra sería un hueco sin sentido.
 */
export function ChaplaincyActivityRow({
  name,
  day,
  time,
  description,
  image,
  imageAlt,
  reversed = false,
}: ChaplaincyActivityRowProps) {
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
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 45vw, 92vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0)_55%,rgba(2,5,12,0.65)_100%)]" />
      </div>

      <div className={reversed ? "lg:order-1" : ""}>
        {/* Sin horario cargado la píldora muestra solo el día, en vez de
            dejar un separador colgado. Mismo criterio que en los eventos. */}
        <p className="inline-flex rounded-full border border-gold-300/35 bg-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">
          {time ? `${day} · ${time}` : day}
        </p>

        <h3 className="mt-5 font-serif text-3xl tracking-tight text-white sm:text-4xl">
          {name}
        </h3>

        <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
          {description}
        </p>
      </div>
    </article>
  );
}
