/**
 * Migración acotada: le pone `slug` a las noticias.
 *
 * `slug` es un campo nuevo y es lo que da la dirección de la página
 * (`/noticias/<slug>`). Las noticias cargadas antes de este cambio no lo
 * tienen, así que sin esto su botón "Leer más" cae a la lista en vez de abrir
 * la noticia — el schema lo exige, pero la API de mutación NO valida contra el
 * schema, así que los documentos viejos siguen ahí, sin slug y sin un solo
 * error.
 *
 * Mismo criterio que las otras migraciones: `patch().set()` sobre documentos
 * que YA EXISTEN, nunca `createOrReplace`, nunca crea nada. Idempotente: una
 * noticia que ya tenga slug se saltea, salvo `--force`.
 *
 * El slug se deriva del título con la MISMA función que usan las migraciones
 * de eventos y de The Chosen, así que las tres convergen.
 *
 * OJO: en el Studio el slug queda de solo lectura apenas tiene valor, porque
 * cambiarlo rompe los links ya compartidos. Este script es la única forma de
 * corregir uno mal puesto, y para eso hace falta `--force`.
 *
 * Usage:
 *   npm run migrate:news-slugs                 # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run migrate:news-slugs -- --dry-run    # imprime el plan, no escribe
 *   npm run migrate:news-slugs -- --force      # reescribe slugs ya cargados
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface NewsDoc {
  _id: string;
  title: string;
  slug?: { current?: string };
}

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  console.log(
    DRY_RUN
      ? "=== Slugs de noticias — DRY RUN (no writes performed) ===\n"
      : "=== Slugs de noticias (patch acotado, no destructivo) ===\n",
  );

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run migrate:news-slugs -- --dry-run` to preview the plan.",
    );
    process.exit(1);
  }

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: false,
    ...(token ? { token } : {}),
  });

  const news = await client.fetch<NewsDoc[]>(
    '*[_type == "newsItem"] | order(_createdAt asc){_id, title, slug}',
  );

  let updated = 0;
  let skipped = 0;
  const vistos = new Set<string>();

  for (const item of news) {
    if (item.slug?.current && !FORCE) {
      console.log(`  ${item._id} — ya tiene "${item.slug.current}", salteada`);
      vistos.add(item.slug.current);
      skipped += 1;
      continue;
    }

    let slug = slugify(item.title);

    // Dos noticias con el mismo título darían el mismo slug y la segunda
    // pisaría la página de la primera. Se desambigua con un sufijo.
    if (vistos.has(slug)) {
      let n = 2;
      while (vistos.has(`${slug}-${n}`)) n += 1;
      console.log(`  ${item._id} — "${slug}" ya estaba tomado, va "${slug}-${n}"`);
      slug = `${slug}-${n}`;
    }
    vistos.add(slug);

    if (DRY_RUN) {
      console.log(`  ${item._id} — pondría "${slug}"`);
    } else {
      await client
        .patch(item._id)
        .set({ slug: { _type: "slug", current: slug } })
        .commit();
      console.log(`  ${item._id} — "${slug}"`);
    }
    updated += 1;
  }

  console.log("");
  console.log(`Noticias revisadas: ${news.length}`);
  console.log(`${DRY_RUN ? "A actualizar" : "Actualizadas"}: ${updated}`);
  console.log(`Salteadas — ya tenían slug: ${skipped}`);
  console.log(DRY_RUN ? "\nDry run only — nothing was written." : "\nMigración completa.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
