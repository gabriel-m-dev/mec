/**
 * Migración acotada: le pone `slug` a los eventos que ya existen.
 *
 * El campo `slug` es nuevo y es lo que da la dirección de la galería
 * (`/eventos/<slug>`). Los eventos cargados antes de este cambio no lo tienen,
 * así que sin esto sus tarjetas nunca enlazarían — el schema lo exige, pero la
 * API de mutación NO valida contra el schema, así que los documentos viejos
 * siguen ahí, sin slug y sin un solo error.
 *
 * Mismo criterio que las otras migraciones: `patch().set()` sobre documentos
 * que YA EXISTEN, nunca `createOrReplace`, nunca crea nada. Idempotente: un
 * evento que ya tenga slug se saltea, salvo `--force`.
 *
 * El slug se deriva del título con la MISMA función que usa el seed, así que
 * los dos convergen y el guard del seed no ve deriva.
 *
 * OJO: en el Studio el slug queda de solo lectura apenas tiene valor, porque
 * cambiarlo rompe los links ya compartidos. Este script es la única forma de
 * corregir uno mal puesto, y para eso hace falta `--force`.
 *
 * Usage:
 *   npm run migrate:event-slugs              # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run migrate:event-slugs -- --dry-run  # imprime el plan, no escribe
 *   npm run migrate:event-slugs -- --force    # reescribe slugs ya existentes
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

/** Idéntica a la de `scripts/seed-sanity.ts`. Un desajuste crearía dos slugs distintos. */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface EventDoc {
  _id: string;
  title: string;
  slug?: { current?: string };
}

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  console.log(
    DRY_RUN
      ? "=== Slugs de eventos — DRY RUN (no writes performed) ===\n"
      : "=== Slugs de eventos (patch acotado, no destructivo) ===\n",
  );

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run migrate:event-slugs -- --dry-run` to preview the plan.",
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

  const events = await client.fetch<EventDoc[]>(
    '*[_type == "event"] | order(_createdAt asc){_id, title, slug}',
  );

  const taken = new Set<string>();
  let updated = 0;
  let skipped = 0;

  for (const event of events) {
    const current = event.slug?.current;

    if (current && !FORCE) {
      taken.add(current);
      console.log(`  ${event._id} — ya tiene "${current}", salteado`);
      skipped += 1;
      continue;
    }

    // Dos eventos con el mismo título darían el mismo slug, y el segundo
    // taparía al primero: la ruta resuelve por `[0]`, así que uno de los dos
    // quedaría inalcanzable en silencio.
    const base = slugify(event.title) || event._id;
    let slug = base;
    let suffix = 2;
    while (taken.has(slug)) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }
    taken.add(slug);

    if (DRY_RUN) {
      console.log(`  ${event._id} — pondría "${slug}"`);
    } else {
      await client.patch(event._id).set({ slug: { _type: "slug", current: slug } }).commit();
      console.log(`  ${event._id} — "${slug}"`);
    }
    updated += 1;
  }

  console.log("");
  console.log(`Eventos revisados: ${events.length}`);
  console.log(`${DRY_RUN ? "A actualizar" : "Actualizados"}: ${updated}`);
  console.log(`Salteados (ya tenían slug): ${skipped}`);
  console.log(DRY_RUN ? "\nDry run only — nothing was written." : "\nMigración completa.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
