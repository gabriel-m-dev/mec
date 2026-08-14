import Image from "next/image";
import Link from "next/link";

type NewsCardProps = {
  category: string;
  title: string;
  summary: string;
  image: string;
  imageAlt?: string;
  /**
   * La página de la noticia. Sin dirección cargada no hay página, así que se
   * cae a la lista en vez de enlazar a un 404.
   */
  href?: string;
};

/**
 * Una noticia: foto a la izquierda, texto a la derecha.
 *
 * La misma forma en TODOS los tamaños. Antes en celular se apilaba —foto
 * arriba en 4/3, texto abajo— y la categoría se dibujaba encima de la foto.
 * Eran dos diseños distintos para el mismo contenido, y el de celular hacía
 * que cada noticia ocupara casi una pantalla: con tres o cuatro cargadas, la
 * página se volvía un desfile de fotos grandes.
 *
 * En horizontal la foto es una franja y la noticia se lee de un vistazo, así
 * que entran varias sin scrollear.
 */
export function NewsCard({
  category,
  title,
  summary,
  image,
  imageAlt,
  href,
}: NewsCardProps) {
  const card = (
    <article className="group flex h-full flex-row overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/4 shadow-luxe transition hover:-translate-y-1 hover:border-gold-300/25 sm:rounded-[1.75rem]">
      {/* `shrink-0` para que la franja de la foto no se achique cuando el
          texto de al lado es largo. El alto no se declara: lo pone la fila, o
          sea la columna de texto. El mínimo es para las noticias de resumen
          corto, donde si no quedaría una franja demasiado baja. */}
      <div className="relative w-2/5 shrink-0 overflow-hidden">
        <Image
          src={image}
          alt={imageAlt ?? ""}
          fill
          // La foto es 2/5 de la tarjeta. En celular la tarjeta ocupa el ancho
          // entero; desde `lg` la grilla la parte en dos columnas.
          sizes="(min-width: 1024px) 20vw, 40vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {/* Oscurecido hacia la derecha, del lado donde arranca el texto: sin
            esto el borde entre la foto y la tarjeta queda duro. */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,12,0)_55%,rgba(2,5,12,0.55)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.18),transparent_45%)]" />
      </div>

      {/* `min-w-0` para que un título largo sin espacios pueda cortarse en vez
          de empujar la foto fuera de la tarjeta. */}
      <div className="min-w-0 p-4 sm:w-3/5 sm:p-7">
        {/* La categoría vuelve al texto en los dos tamaños. Encima de la foto
            solo entraba cuando la foto ocupaba el ancho completo; sobre una
            franja de 140px quedaba partida en dos renglones. */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-300/90 sm:text-sm sm:tracking-[0.28em]">
          {category}
        </p>
        <h3 className="mt-1.5 font-serif text-base leading-tight text-white sm:mt-4 sm:text-2xl">
          {title}
        </h3>
        <p className="mt-2 text-xs leading-5 text-slate-300 sm:mt-4 sm:text-sm sm:leading-7">
          {summary}
        </p>
        {/* Es un `<p>`, NO un enlace: el enlace envuelve la tarjeta entera y
            anidar anchors es HTML inválido. Se pinta con `group-hover` para
            que siga reaccionando al pasar por encima de cualquier parte. */}
        <p className="mt-3 inline-flex text-xs font-semibold text-gold-200 transition group-hover:text-gold-100 sm:mt-6 sm:text-sm">
          Leer más <span aria-hidden="true">→</span>
        </p>
      </div>
    </article>
  );

  // Un solo anchor envolviendo la tarjeta entera, igual que en las tarjetas de
  // eventos y de The Chosen: así se puede tocar en cualquier parte y no solo
  // en "Leer más", que en celular es un blanco de pocos milímetros.
  //
  // Sin dirección cargada la tarjeta no enlaza, en vez de llevar a un 404.
  if (!href) return card;

  return (
    <Link
      href={href}
      className="block h-full rounded-[1.25rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300 sm:rounded-[1.75rem]"
    >
      {card}
    </Link>
  );
}
