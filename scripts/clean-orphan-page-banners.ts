/**
 * Borra borradores sueltos de `pageBanner` que no correspondan a ninguna de las
 * 7 páginas del sitio.
 *
 * Por qué hace falta un script: `pageBanner` tiene las acciones `delete`,
 * `duplicate` y `unpublish` sacadas en `sanity.config.ts` para que el cliente
 * no pueda borrar la página de una sección por accidente. El efecto de borde es
 * que un documento creado de más TAMPOCO se puede borrar desde el Studio: no
 * hay botón. Antes se podían crear desde el botón "Crear nuevo documento" de la
 * lista de Páginas; ese agujero está cerrado, pero los que ya se crearon siguen
 * ahí y hay que sacarlos por API.
 *
 * Solo toca `drafts.*` cuyo id NO esté entre los 7 conocidos. Los 7 documentos
 * reales, publicados o con cambios sin publicar, quedan intactos por
 * construcción. Un huérfano PUBLICADO se reporta pero no se borra: borrar algo
 * publicado deja una página sin encabezado y sin <h1>, y esa decisión no la
 * toma un script.
 *
 * Leer borradores necesita token: la API pública no los devuelve.
 *
 * Usage:
 *   npm run clean:page-banners -- --dry-run   # solo informa
 *   npm run clean:page-banners                # borra
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

/** Los 7 documentos legítimos. Tiene que coincidir con `PAGES` en `sanity/deskStructure.ts`. */
const KNOWN_IDS = new Set([
  "pageBanner-quienes-somos",
  "pageBanner-ministerios",
  "pageBanner-capellanes",
  "pageBanner-cultos",
  "pageBanner-eventos",
  "pageBanner-noticias",
  "pageBanner-contacto",
]);

type PageBannerDoc = { _id: string; route?: string; title?: string };

function publishedId(id: string): string {
  return id.replace(/^drafts\./, "");
}

function describe({ _id, route, title }: PageBannerDoc): string {
  return `  ${_id}  route=${route ?? "(sin elegir)"}  título=${title ?? "(sin título)"}`;
}

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  // El token hace falta incluso con --dry-run: sin él la API no devuelve los
  // borradores y el script informaría "no hay nada" con el dataset lleno.
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Los borradores no se leen sin token, ni siquiera para --dry-run.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.",
    );
    process.exit(1);
  }

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: false,
    token,
  });

  const docs = await client.fetch<PageBannerDoc[]>(
    `*[_type == "pageBanner"]{_id, route, title} | order(_id asc)`,
  );

  const orphans = docs.filter((doc) => !KNOWN_IDS.has(publishedId(doc._id)));
  const orphanDrafts = orphans.filter((doc) => doc._id.startsWith("drafts."));
  const orphanPublished = orphans.filter((doc) => !doc._id.startsWith("drafts."));

  console.log(`${docs.length} documento(s) de tipo pageBanner en el dataset.`);

  if (orphanPublished.length > 0) {
    console.warn(
      `\nATENCIÓN — ${orphanPublished.length} huérfano(s) PUBLICADO(s). No se tocan:`,
    );
    orphanPublished.forEach((doc) => console.warn(describe(doc)));
    console.warn("Revisalos a mano antes de borrar nada publicado.");
  }

  if (orphanDrafts.length === 0) {
    console.log("\nNo hay borradores huérfanos. Nada que hacer.");
    return;
  }

  console.log(`\n${orphanDrafts.length} borrador(es) huérfano(s):`);
  orphanDrafts.forEach((doc) => console.log(describe(doc)));

  if (DRY_RUN) {
    console.log("\n--dry-run: no se borró nada.");
    return;
  }

  const tx = orphanDrafts.reduce(
    (acc, doc) => acc.delete(doc._id),
    client.transaction(),
  );
  await tx.commit();

  console.log(`\n${orphanDrafts.length} borrador(es) borrado(s).`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
