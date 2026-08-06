// Export nombrado, no el default: el default está deprecado y el paquete lo
// avisa por consola en cada arranque.
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto("format");
}

/**
 * La imagen de un banner de página, recortada por el CDN respetando el
 * hotspot que el cliente marcó en el Studio.
 *
 * Existe aparte de `urlForImage` por una razón concreta: el hotspot **solo se
 * aplica si se piden ancho Y alto con `fit("crop")`**. Sin dimensiones, el
 * builder devuelve la imagen entera y el punto marcado en el Studio no hace
 * absolutamente nada — que es lo que pasaba hasta ahora.
 *
 * Se pide en proporción de banner (2.5:1) en vez de la de la foto original,
 * que en estas 7 va de 0.67 a 1.78. Así el recorte grande lo decide el CDN
 * con el criterio del cliente, y al navegador casi no le queda nada que
 * cortar por su cuenta.
 */
export function urlForBanner(source: SanityImageSource) {
  return builder.image(source).width(1800).height(720).fit("crop").auto("format");
}
