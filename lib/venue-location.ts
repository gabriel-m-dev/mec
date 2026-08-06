/**
 * Ubicación física de la iglesia — ÚNICO punto de edición del mapa.
 *
 * Cuando el cliente pase la dirección real: se pega en `query` y se pone
 * `isPlaceholder: false`. Nada más. Ningún componente se toca.
 *
 * El mapa se embebe sin clave de API. `maps.google.com/...&output=embed` no es
 * la Maps Embed API documentada, así que Google no lo soporta formalmente y
 * podría cambiarlo; a cambio evita tener que crear un proyecto en Google Cloud,
 * asociar una cuenta de facturación y administrar una clave restringida para
 * dibujar un mapa fijo. Si alguna vez deja de andar, la migración a la vía
 * oficial se resuelve dentro de `getVenueMapEmbedUrl()`.
 */
export const VENUE_LOCATION = {
  /**
   * Exactamente lo que escribirías en el buscador de Google Maps.
   *
   * Conviene copiar la dirección tal como la muestra Google Maps una vez
   * encontrado el lugar: un texto ambiguo ("Av. Vergara 2500" existe en varios
   * partidos) clava el pin en el lugar equivocado sin dar un solo error.
   *
   * También acepta coordenadas — `"-34.5934,-58.6396"` — que son exactas y no
   * dependen de que Google interprete bien el texto. Para sacarlas: click
   * derecho sobre el punto en Google Maps, el primer ítem del menú.
   */
  query: "Av. Vergara 2500, Hurlingham, Provincia de Buenos Aires",
  /** 16 ≈ manzana individual. Subir para acercar, bajar para mostrar el barrio. */
  zoom: 16,
  /**
   * Ubicación de relleno hasta que el cliente confirme la real.
   * Poner en `false` al cargar la definitiva.
   */
  isPlaceholder: true,
} as const;

/** URL del iframe del mapa. Sin clave de API. */
export function getVenueMapEmbedUrl(): string {
  const params = new URLSearchParams({
    q: VENUE_LOCATION.query,
    z: String(VENUE_LOCATION.zoom),
    hl: "es",
    output: "embed",
  });

  return `https://maps.google.com/maps?${params.toString()}`;
}

/**
 * Enlace para abrir la ubicación en Google Maps o en la app del celular.
 * Este sí es el esquema público y documentado de URLs de Maps.
 */
export function getVenueDirectionsUrl(): string {
  const params = new URLSearchParams({
    api: "1",
    query: VENUE_LOCATION.query,
  });

  return `https://www.google.com/maps/search/?${params.toString()}`;
}
