/**
 * One GROQ query per page/section. Image fields are returned RAW (the
 * asset reference object, not dereferenced) — `urlForImage()` consumes
 * that raw object directly, no GROQ-side asset resolution needed.
 *
 * Field names below MUST match the schema field names in
 * `sanity/schemaTypes/*.ts` exactly — GROQ/schema drift is NOT caught by
 * `tsc` (query strings are untyped).
 */

export const siteSettingsQuery = /* groq */ `*[_type == "siteSettings"][0]`;

export const venueQuery = /* groq */ `*[_type == "venue"][0]`;

export const worshipServicesQuery = /* groq */ `*[_type == "worshipService"] | order(_createdAt asc)`;

export const chosenLeaderQuery = /* groq */ `*[_type == "chosenLeader"][0]`;

export const chosenActivitiesQuery = /* groq */ `*[_type == "chosenActivity"] | order(_createdAt asc)`;

/** Igual que en los eventos: solo las actividades CON fotos tienen página. */
export const chosenActivitySlugsWithGalleryQuery = /* groq */ `*[_type == "chosenActivity" && defined(slug.current) && count(gallery) > 0].slug.current`;

/** Parametrizada por `$slug`. Devuelve null si no existe. */
export const chosenActivityBySlugQuery = /* groq */ `*[_type == "chosenActivity" && slug.current == $slug][0]`;

export const chaplainsQuery = /* groq */ `*[_type == "chaplain"] | order(_createdAt asc)`;

export const chaplaincyActivitiesQuery = /* groq */ `*[_type == "chaplaincyActivity"] | order(_createdAt asc)`;

export const eventsQuery = /* groq */ `*[_type == "event"] | order(_createdAt asc)`;

export const newsItemsQuery = /* groq */ `*[_type == "newsItem"] | order(_createdAt asc)`;

/**
 * Los slugs que tienen página propia. Solo los eventos CON fotos: sin galería
 * la página sería el título y un párrafo, o sea menos de lo que ya muestra la
 * tarjeta, así que esos eventos no linkean a ningún lado.
 *
 * Alimenta `generateStaticParams` y el sitemap, para que las dos listas salgan
 * de la misma definición y no puedan divergir.
 */
export const eventSlugsWithGalleryQuery = /* groq */ `*[_type == "event" && defined(slug.current) && count(gallery) > 0].slug.current`;

/** Parametrizada por `$slug`. Devuelve null si no existe. */
export const eventBySlugQuery = /* groq */ `*[_type == "event" && slug.current == $slug][0]`;

/**
 * Los destacados del carrusel de la portada, ya desreferenciados: el cliente
 * elige eventos y noticias que ya existen, y de cada uno salen la foto, el
 * título y la descripción que tiene cargados. Si los edita allá, acá cambian
 * solos — no hay copia que mantener.
 *
 * `hasGallery` decide el destino del botón: solo un evento CON fotos tiene
 * página propia (la ruta hace 404 sin galería), y las noticias no tienen. El
 * cálculo vive en la query y no en el componente para que la regla esté en un
 * solo lugar.
 *
 * TRAMPA DE GROQ, aprendida rompiendo el build: después de un `[]->` los
 * operadores que siguen se aplican a CADA elemento, no al array. Tanto
 * `[0...5]` como `[defined(@)]` terminan evaluándose contra cada objeto
 * —`objeto[0...5]`— y devuelven `null`. La query completa pasa a ser
 * `[null, null, null]` sin ningún error: solo se nota al usarla.
 *
 * Por eso acá no va ningún operador después de la proyección. El corte a 5 y
 * el descarte de referencias rotas viven en `app/(site)/page.tsx`, donde el
 * comportamiento es explícito y no depende de precedencias.
 *
 * El `coalesce` del texto no es cosmético: los dos tipos lo guardan con nombre
 * distinto — los eventos en `description`, las noticias en `summary` — y sin
 * él la noticia sale sin una sola línea de texto, sin que nada avise.
 *
 * Y nada de comentarios adentro del template: GROQ no los acepta, y un
 * backtick ahí adentro cierra el literal de TypeScript.
 */
/** El bloque fijo de transmisión en vivo de la portada. */
export const homeLiveQuery = /* groq */ `*[_type == "homePage"][0].live`;

export const homeFeaturedQuery = /* groq */ `*[_type == "homePage"][0].featured[]->{
  _id,
  _type,
  title,
  "description": coalesce(description, summary),
  image,
  imageAlt,
  "slug": slug.current,
  "hasGallery": count(gallery) > 0
}`;

/**
 * Parametrized by `$route` (e.g. "/ministerios"). Returns null if no banner
 * exists for that route. No projection — returns the whole document,
 * including `sections` and `faqs`, so pages get section headings and FAQs
 * from this single fetch (no second round trip).
 */
export const pageBannerByRouteQuery = /* groq */ `*[_type == "pageBanner" && route == $route][0]`;
