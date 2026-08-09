/**
 * Las reglas de resolución de las dos imágenes de la portada, como funciones
 * puras.
 *
 * Viven afuera del schema por la misma razón que las de `pageBanner`: solo se
 * manifiestan adentro del Studio, que no se puede inspeccionar desde acá, así
 * que la única forma de saber que hacen lo que dicen es poder ejecutarlas
 * aisladas. Ver `pageBannerValidation.ts`.
 *
 * OJO — ESTO NO PROTEGE EL DATASET: la validación de Sanity corre en el
 * Studio, NO en la API de mutación. Son avisos para la persona que edita, no
 * una garantía de integridad.
 *
 * De dónde salen las medidas: el hero ocupa la pantalla completa
 * (`min-h-[100svh]`, `sizes="100vw"`), así que la imagen se estira hasta el
 * ancho del monitor. En escritorio eso llega a 2560px en pantallas grandes; en
 * teléfono, 1080px de ancho real (360 CSS px a 3x). Pedir menos que eso es
 * pedir una imagen que el navegador va a agrandar, y agrandar se ve borroso.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface HeroImageSpec {
  /** Cómo nombrar la imagen en el mensaje. */
  label: string;
  /** Lo que se recomienda subir. Es exactamente lo que sirve el CDN. */
  recommended: ImageDimensions;
  /** Abajo de esto se ve borrosa a pantalla completa. */
  minimum: ImageDimensions;
  orientation: "landscape" | "portrait";
}

/**
 * Las medidas que sirve el CDN. El schema las usa para el aviso y
 * `sanity/lib/image.ts` para pedir el recorte: si divergieran, le pediríamos
 * al cliente una resolución y serviríamos otra.
 */
export const HERO_DESKTOP_SPEC: HeroImageSpec = {
  label: "La imagen de escritorio",
  recommended: { width: 2560, height: 1440 },
  minimum: { width: 1920, height: 1080 },
  orientation: "landscape",
};

export const HERO_MOBILE_SPEC: HeroImageSpec = {
  label: "La imagen de celular",
  recommended: { width: 1080, height: 1920 },
  minimum: { width: 900, height: 1600 },
  orientation: "portrait",
};

/** "2560 × 1440", para meter en un mensaje. */
export function formatDimensions({ width, height }: ImageDimensions): string {
  return `${width} × ${height}`;
}

/**
 * Las medidas de una imagen de Sanity, sacadas del `_ref` del asset.
 *
 * El `_ref` las trae adentro: `image-<id>-<ancho>x<alto>-<extensión>`. Se leen
 * de ahí y no del `metadata.dimensions` del asset porque **dentro de la
 * validación el valor del campo es solo la referencia**: el documento guarda
 * `{ asset: { _ref } }`, no el asset expandido. Pedir el asset implicaría una
 * consulta asíncrona en cada tecleo.
 */
export function dimensionsFromAssetRef(value: unknown): ImageDimensions | null {
  const ref = (value as { asset?: { _ref?: unknown } } | undefined)?.asset?._ref;
  if (typeof ref !== "string") return null;

  // El id del asset puede tener guiones, así que se ancla al FINAL: las dos
  // últimas partes son siempre `<ancho>x<alto>` y la extensión.
  const match = /-(\d+)x(\d+)-[a-z0-9]+$/i.exec(ref);
  if (!match) return null;

  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  if (width <= 0 || height <= 0) return null;

  return { width, height };
}

/**
 * El aviso que corresponde a una imagen de portada, o `true` si está bien.
 *
 * Devuelve un solo problema y en este orden a propósito: una imagen vertical
 * puesta en escritorio TAMBIÉN suele fallar la medida mínima, y decirle a la
 * persona "es chica" cuando el problema real es que está de costado la manda a
 * buscar una vertical más grande, que sigue sin servir.
 *
 * Sin imagen devuelve `true`: que el campo sea obligatorio u opcional lo decide
 * el schema, no esta regla.
 */
export function heroImageIssue(
  value: unknown,
  spec: HeroImageSpec,
): string | true {
  if (!value) return true;

  const dimensions = dimensionsFromAssetRef(value);
  // Sin medidas legibles no se inventa un problema: puede ser una imagen recién
  // subida cuyo `_ref` todavía no está en el documento.
  if (!dimensions) return true;

  const { width, height } = dimensions;
  const actual = formatDimensions(dimensions);
  const recommended = formatDimensions(spec.recommended);

  if (spec.orientation === "landscape" && height > width) {
    return `${spec.label} está parada (${actual}) y el lugar donde va es apaisado: se le recortarían los costados y quedaría casi todo el alto afuera. Subí una horizontal, idealmente de ${recommended}.`;
  }

  if (spec.orientation === "portrait" && width > height) {
    return `${spec.label} está acostada (${actual}) y el lugar donde va es vertical: se le recortarían casi todos los costados. Subí una parada, idealmente de ${recommended}.`;
  }

  if (width < spec.minimum.width || height < spec.minimum.height) {
    return `${spec.label} mide ${actual} y es chica para ocupar toda la pantalla: se va a ver borrosa. El mínimo es ${formatDimensions(spec.minimum)} y lo ideal son ${recommended}.`;
  }

  return true;
}
