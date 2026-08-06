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

export const ministriesQuery = /* groq */ `*[_type == "ministry"] | order(_createdAt asc)`;

export const chaplainsQuery = /* groq */ `*[_type == "chaplain"] | order(_createdAt asc)`;

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
 * Parametrized by `$route` (e.g. "/ministerios"). Returns null if no banner
 * exists for that route. No projection — returns the whole document,
 * including `sections` and `faqs`, so pages get section headings and FAQs
 * from this single fetch (no second round trip).
 */
export const pageBannerByRouteQuery = /* groq */ `*[_type == "pageBanner" && route == $route][0]`;
