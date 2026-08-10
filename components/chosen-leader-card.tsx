import Image from "next/image";
import Link from "next/link";

type ChosenLeaderCardProps = {
  name: string;
  role: string;
  description: string;
  /** Opcional: sin foto, la tarjeta se muestra solo con el texto. */
  image?: string;
  imageAlt?: string;
};

/**
 * Grupo de personas. Marca el bloque de invitación del pie como una llamada a
 * sumarse, no como un dato más de la persona a cargo.
 */
function GroupIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 19v-1a4 4 0 0 0-3-3.87" />
      <path d="M16 4.13a4 4 0 0 1 0 5.75" />
    </svg>
  );
}

/**
 * La persona a cargo de The Chosen.
 *
 * La tarjeta ocupa el ancho completo del contenedor y parte en dos: la foto
 * grande a la izquierda, y a la derecha la jerarquía de lectura —rol, nombre,
 * a qué responde, presentación—. Al pie, separada por una línea, la invitación
 * a sumarse: es lo que el visitante puede HACER después de leer, y por eso va
 * última y centrada, no mezclada con la presentación.
 *
 * El texto fijo ("Responsable de The Chosen", la invitación del pie) vive acá y
 * no en Sanity, igual que los títulos de sección: es la estructura de la
 * tarjeta. Lo editable es la persona.
 */
export function ChosenLeaderCard({
  name,
  role,
  description,
  image,
  imageAlt,
}: ChosenLeaderCardProps) {
  return (
    /* Borde de un pixel hecho con degradado: nace dorado en la esquina
       superior derecha y se apaga hacia abajo a la izquierda. Un `border`
       plano no puede cambiar de color a lo largo del trazo. */
    /* `max-w-4xl` acota la tarjeta: presentar a UNA persona no necesita los
       1216px del contenedor. A ancho completo la foto quedaba enorme y el
       texto nadaba, y la tarjeta se comía el 85% del alto de la pantalla. */
    <div className="max-w-4xl rounded-[1.5rem] bg-gradient-to-bl from-gold-300/70 via-white/10 to-white/[0.06] p-px shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      <article className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-gradient-to-b from-white/[0.07] via-white/[0.04] to-white/[0.02] backdrop-blur-sm">
        {/* Luz cálida detrás de la esquina que enciende el borde. Decorativa. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold-400/10 blur-3xl"
        />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
            {image && (
              /* Mismo recurso que el borde de la tarjeta, en chico: el marco
                 dorado de la foto es un degradado de un pixel.

                 El ancho está acotado en los dos tamaños. Antes en celular
                 ocupaba todo el ancho —una foto de 298px solo para la cara— y
                 en escritorio 428px, que era el bloque más alto de la tarjeta
                 y el que la estiraba. */
              <div className="w-full max-w-[11rem] shrink-0 self-center rounded-[1rem] bg-gradient-to-br from-gold-300/60 via-gold-400/20 to-gold-500/10 p-px sm:max-w-none sm:w-44 sm:self-start">
                <div className="relative aspect-square overflow-hidden rounded-[calc(1rem-1px)]">
                  <Image
                    src={image}
                    alt={imageAlt ?? ""}
                    fill
                    sizes="(min-width: 640px) 176px, 176px"
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* `min-w-0` para que el texto largo pueda encogerse dentro del
                flex en vez de empujar la foto fuera de la tarjeta. */}
            <div className="min-w-0">
              <p className="inline-flex rounded-full border border-gold-300/40 bg-gold-400/[0.07] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-200">
                {role}
              </p>

              <h3 className="mt-3 font-serif text-2xl tracking-tight text-white sm:text-3xl">
                {name}
              </h3>

              <p className="mt-1.5 text-sm text-slate-300 sm:text-base">
                Responsable de{" "}
                <span className="font-serif italic text-gold-300">
                  The Chosen
                </span>
              </p>

              <div
                aria-hidden="true"
                className="mt-4 h-0.5 w-12 rounded-full bg-gradient-to-r from-gold-400 to-gold-500/20"
              />

              {/* El interlineado era de 38px sobre texto de 17px: más del
                  doble. Se veía aireado pero estiraba el bloque entero. */}
              <p className="mt-4 max-w-[34rem] whitespace-pre-line text-sm leading-6 text-slate-300">
                {description}
              </p>
            </div>
          </div>

          {/* La invitación a sumarse. Centrada y al pie: cierra la tarjeta con
              la única acción que ofrece. */}
          <div className="mt-6 border-t border-white/10 pt-5">
            {/* Pasa a fila desde `sm` y no desde `lg`: apilado son cuatro
                bloques uno abajo del otro, y era la mitad del alto de la
                tarjeta en celular. */}
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-5 sm:text-left">
              <span
                aria-hidden="true"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold-300/40 text-gold-300"
              >
                <GroupIcon />
              </span>

              <div className="min-w-0">
                <p className="font-serif text-base text-white sm:text-lg">
                  ¿Querés que tu hijo o hija se sume?
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Si te interesa colaborar como voluntario, escribinos y te
                  ponemos en contacto con el equipo.
                </p>
              </div>

              <span
                aria-hidden="true"
                className="hidden h-10 w-px shrink-0 bg-white/10 sm:block"
              />

              <Link
                href="/contacto"
                className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-gold-300/50 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-200 transition hover:border-gold-200/80 hover:bg-gold-400/10"
              >
                Ponete en contacto
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
