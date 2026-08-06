/**
 * URL canonica del sitio. La usan `metadataBase` (canonical y OpenGraph),
 * `robots.txt` y `sitemap.xml`, asi que un valor equivocado no rompe la
 * pagina: rompe el SEO en silencio, y encima despues de indexar.
 *
 * El orden importa. `VERCEL_URL` es la URL UNICA DE CADA DEPLOY
 * (`proyecto-a1b2c3-equipo.vercel.app`) y cambia en cada push: con ella el
 * sitemap publicado quedaba apuntando a un host que moria en el deploy
 * siguiente. `VERCEL_PROJECT_PRODUCTION_URL` es el dominio de produccion del
 * proyecto y se mantiene estable, por eso va antes.
 *
 * En un preview eso hace que el canonical apunte a produccion, que es lo
 * correcto: un preview nunca deberia competir por el indice.
 *
 * Igual, lo que manda es `NEXT_PUBLIC_SITE_URL`. Al conectar el dominio
 * propio hay que setearla en Vercel; las dos de Vercel son solo la red de
 * seguridad para que el sitemap nunca quede sin host valido.
 */
export function getSiteUrl(): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";

  return siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
}
