"use client";

import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "next-sanity";

import type { PortableTextBlock } from "@/sanity/lib/types";

/**
 * El cuerpo de una noticia, escrito desde el Studio.
 *
 * ES COMPONENTE DE CLIENTE por una razón concreta: `PortableText` usa
 * `useMemo` y su paquete no declara `"use client"`, así que en un componente
 * de servidor rompería en tiempo de ejecución. No cambia nada para el
 * visitante ni para los buscadores —igual se dibuja en el servidor para el
 * HTML inicial— y solo agrega la hidratación de este bloque.
 *
 * Se importa desde `next-sanity`, que es dependencia DECLARADA del proyecto y
 * lo reexporta. Importarlo de `@portabletext/react` sería usar una dependencia
 * transitiva: hoy está porque la arrastra Sanity, y desaparece el día que
 * cambien sus dependencias, sin que nada lo avise hasta que rompa.
 *
 * Los estilos replican los de las páginas para que el texto que carga la
 * iglesia se vea como el resto del sitio y no como HTML crudo.
 */
type NewsBodyProps = {
  /**
   * El cuerpo con las fotos YA RESUELTAS a una URL, en el campo `src` de cada
   * bloque de imagen.
   *
   * La resolución la hace el servidor y no este componente. No es una
   * preferencia: pasarle una función que arme la URL sería mandar una función
   * a través de la frontera servidor/cliente, y eso no se puede serializar —
   * revienta en tiempo de ejecución. De paso, el constructor de imágenes de
   * Sanity no viaja al navegador.
   */
  value: PortableTextBlock[];
  /** Para el `alt` de las fotos que se hayan cargado sin descripción. */
  fallbackAlt: string;
};

export function NewsBody({ value, fallbackAlt }: NewsBodyProps) {
  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => (
        <p className="mt-5 text-base leading-8 text-slate-300">{children}</p>
      ),
      h2: ({ children }) => (
        <h2 className="mt-12 font-serif text-2xl tracking-tight text-white sm:text-3xl">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="mt-9 font-serif text-xl tracking-tight text-white sm:text-2xl">
          {children}
        </h3>
      ),
      blockquote: ({ children }) => (
        <blockquote className="mt-8 border-l-2 border-gold-400/60 pl-5 font-serif text-lg italic leading-8 text-gold-100/90">
          {children}
        </blockquote>
      ),
    },

    list: {
      bullet: ({ children }) => (
        <ul className="mt-5 list-disc space-y-2 pl-5 text-base leading-8 text-slate-300 marker:text-gold-400">
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className="mt-5 list-decimal space-y-2 pl-5 text-base leading-8 text-slate-300 marker:text-gold-400">
          {children}
        </ol>
      ),
    },

    marks: {
      strong: ({ children }) => (
        <strong className="font-semibold text-white">{children}</strong>
      ),
      link: ({ children, value: mark }) => {
        const href = typeof mark?.href === "string" ? mark.href : "";
        // Solo las direcciones internas usan el router. Un `mailto:` o un
        // `tel:` con `<Link>` no abriría la aplicación de correo o teléfono.
        const esInterno = href.startsWith("/");

        if (esInterno) {
          return (
            <Link href={href} className="text-gold-200 underline underline-offset-4 transition hover:text-gold-100">
              {children}
            </Link>
          );
        }

        return (
          <a
            href={href}
            // `noopener` no es opcional en un enlace externo con target: sin
            // él la página destino puede manipular la nuestra por `opener`.
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-200 underline underline-offset-4 transition hover:text-gold-100"
          >
            {children}
          </a>
        );
      },
    },

    types: {
      image: ({ value: block }) => {
        const src = typeof block?.src === "string" ? block.src : null;
        // Una foto que quedó sin resolver no se dibuja rota: se omite.
        if (!src) return null;

        const alt = typeof block?.alt === "string" && block.alt ? block.alt : fallbackAlt;
        const caption = typeof block?.caption === "string" ? block.caption : null;

        return (
          <figure className="mt-10">
            {/* Proporción fija y `object-cover`: sin un alto declarado, cada
                foto empujaría el texto de abajo al terminar de cargar. */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.25rem] border border-white/10 shadow-luxe">
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 768px) 720px, 92vw"
                className="object-cover"
              />
            </div>
            {caption && (
              <figcaption className="mt-3 text-sm leading-6 text-slate-400">
                {caption}
              </figcaption>
            )}
          </figure>
        );
      },
    },
  };

  return <PortableText value={value} components={components} />;
}
