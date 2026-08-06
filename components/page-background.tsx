import Image from "next/image";

/**
 * El cielo estrellado que va detrás de todo el sitio, en reemplazo del color
 * plano `bg-ink-950`.
 *
 * Va FIJO y una sola vez, montado en el layout: una imagen que scrollea con el
 * contenido habría que repetirla en vertical —y un campo de estrellas deja ver
 * las costuras— o estirarla hasta reventar la resolución en páginas largas.
 * Fija, siempre cubre exactamente la pantalla.
 *
 * `-z-10` la deja por debajo del contenido pero por encima del color de fondo
 * del `body`, que queda de respaldo mientras carga o si fallara.
 *
 * No la ve el hero ni los banners: esos traen su propia imagen opaca encima.
 * Aparece justo donde el usuario la pidió — de ahí para abajo.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <Image
        src="/images/background_page_mobile.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center sm:hidden"
      />
      <Image
        src="/images/background_page_desktop.png"
        alt=""
        fill
        sizes="100vw"
        className="hidden object-cover object-center sm:block"
      />
    </div>
  );
}
