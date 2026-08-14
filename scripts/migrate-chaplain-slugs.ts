/**
 * Migración acotada: le pone `slug` a los capellanes.
 *
 * `slug` es un campo nuevo y es lo que da la dirección de la página propia de
 * cada capellán (`/capellan/<slug>`), la que va en su QR. Los capellanes
 * cargados antes de este cambio no lo tienen, así que sin esto su tarjeta en
 * `/capellanes` no enlaza a ningún lado — el schema lo exige, pero la API de
 * mutación NO valida contra el schema, así que los documentos viejos siguen
 * ahí, sin slug y sin un solo error.
 *
 * Mismo criterio que noticias y eventos: `patch().set()` sobre documentos que
 * YA EXISTEN, nunca `createOrReplace`, nunca crea nada. Idempotente: un
 * capellán que ya tenga slug se saltea, salvo `--force`.
 *
 * OJO: en el Studio el slug queda de solo lectura apenas tiene valor, porque
 * cambiarlo rompería un QR ya impreso. Este script es la única forma de
 * corregir uno mal puesto, y para eso hace falta `--force`.
 *
 * Usage:
 *   npm run migrate:chaplain-slugs                 # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run migrate:chaplain-slugs -- --dry-run    # imprime el plan, no escribe
 *   npm run migrate:chaplain-slugs -- --force      # reescribe slugs ya cargados
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

interface ChaplainDoc {
  _id: string;
  name: string;
  slug?: { current?: string };
}

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  console.log(
    DRY_RUN
      ? "=== Slugs de capellanes — DRY RUN (no writes performed) ===\n"
      : "=== Slugs de capellanes (patch acotado, no destructivo) ===\n",
  );

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run migrate:chaplain-slugs -- --dry-run` to preview the plan.",
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

  const chaplains = await client.fetch<ChaplainDoc[]>(
    '*[_type == "chaplain"] | order(_createdAt asc){_id, name, slug}',
  );

  let updated = 0;
  let skipped = 0;
  const vistos = new Set<string>();

  for (const chaplain of chaplains) {
    if (chaplain.slug?.current && !FORCE) {
      console.log(`  ${chaplain._id} — ya tiene "${chaplain.slug.current}", salteado`);
      vistos.add(chaplain.slug.current);
      skipped += 1;
      continue;
    }

    let slug = slugify(chaplain.name);

    // Dos capellanes con el mismo nombre darían el mismo slug y el segundo
    // pisaría la página del primero. Se desambigua con un sufijo.
    if (vistos.has(slug)) {
      let n = 2;
      while (vistos.has(`${slug}-${n}`)) n += 1;
      console.log(`  ${chaplain._id} — "${slug}" ya estaba tomado, va "${slug}-${n}"`);
      slug = `${slug}-${n}`;
    }
    vistos.add(slug);

    if (DRY_RUN) {
      console.log(`  ${chaplain._id} — pondría "${slug}"`);
    } else {
      await client
        .patch(chaplain._id)
        .set({ slug: { _type: "slug", current: slug } })
        .commit();
      console.log(`  ${chaplain._id} — "${slug}"`);
    }
    updated += 1;
  }

  console.log("");
  console.log(`Capellanes revisados: ${chaplains.length}`);
  console.log(`${DRY_RUN ? "A actualizar" : "Actualizados"}: ${updated}`);
  console.log(`Salteados — ya tenían slug: ${skipped}`);
  console.log(DRY_RUN ? "\nDry run only — nothing was written." : "\nMigración completa.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
