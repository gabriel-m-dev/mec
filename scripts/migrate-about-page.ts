/**
 * Migración acotada: carga en el `pageBanner` de `/quienes-somos` los bloques
 * que hasta ahora estaban hardcodeados en la página.
 *
 * Mismo criterio que `scripts/migrate-page-sections.ts` y por las mismas
 * razones: `patch().set()` sobre el documento que YA EXISTE, nunca
 * `createOrReplace`, nunca crea documentos. Solo toca los campos nuevos, así
 * que todo lo que el cliente haya editado desde el Studio queda intacto.
 *
 * Idempotente: un campo que ya tenga contenido se saltea, salvo `--force`.
 *
 * A DIFERENCIA de la migración de secciones, esta SUBE IMÁGENES: los dos
 * `<Image src="/images/...">` hardcodeados pasan a ser assets de Sanity para
 * que el cliente pueda cambiarlos. Sanity deduplica los assets por hash, así
 * que volver a correrla no genera copias.
 *
 * EL ORDEN IMPORTA — correr esto ANTES de mergear el código que lee estos
 * campos. Al revés, `/quienes-somos` pierde la presentación, las cifras, la
 * visión, la historia y los valores hasta que la migración corra.
 *
 * Usage:
 *   npm run migrate:about                # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run migrate:about -- --dry-run   # imprime el plan, no escribe
 *   npm run migrate:about -- --force     # sobrescribe campos que ya tengan contenido
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

import { PAGE_BANNERS } from "./page-banners-data";
import { keyedStats, keyedValues } from "./sanity-array-keys";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

const ABOUT_ROUTE = "/quienes-somos";
const ABOUT_ID = "pageBanner-quienes-somos";

type ImageValue = { _type: "image"; asset: { _type: "reference"; _ref: string } };

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  console.log(
    DRY_RUN
      ? "=== Migración /quienes-somos — DRY RUN (no writes performed) ===\n"
      : "=== Migración /quienes-somos (patch acotado, no destructivo) ===\n",
  );

  const seed = PAGE_BANNERS.find((banner) => banner.route === ABOUT_ROUTE);
  if (!seed) throw new Error(`No hay datos de seed para ${ABOUT_ROUTE}`);

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run migrate:about -- --dry-run` to preview the plan without a token.",
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

  const existing = await client.getDocument(ABOUT_ID);
  if (!existing) {
    console.error(
      `${ABOUT_ID} NO EXISTE en el dataset — esta migración nunca crea documentos.\n` +
        "Correr `npm run seed` si hace falta crearlo.",
    );
    process.exit(1);
  }

  async function uploadImage(imagePath: string): Promise<ImageValue | undefined> {
    if (DRY_RUN) return undefined;

    const absPath = path.join(process.cwd(), "public", imagePath);
    if (!fs.existsSync(absPath)) {
      throw new Error(`Imagen referenciada por el seed no encontrada en disco: ${imagePath}`);
    }
    const asset = await client.assets.upload("image", fs.createReadStream(absPath), {
      filename: path.basename(absPath),
    });
    return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  }

  const patch: Record<string, unknown> = {};
  const skipped: string[] = [];

  /** Solo escribe el campo si está vacío en el dataset, o si se pasó --force. */
  function stage(field: string, value: unknown): boolean {
    if (value === undefined) return false;

    const live = (existing as Record<string, unknown>)[field];
    const hasContent = Array.isArray(live) ? live.length > 0 : Boolean(live);
    if (hasContent && !FORCE) {
      skipped.push(field);
      return false;
    }
    patch[field] = value;
    return true;
  }

  stage("introParagraphs", seed.introParagraphs);
  stage("introImageAlt", seed.introImageAlt);
  stage("stats", seed.stats && keyedStats(seed.stats));
  stage("vision", seed.vision);
  stage("values", seed.values && keyedValues(seed.values));

  // Las imágenes se suben solo si el campo se va a escribir, para no dejar
  // assets huérfanos cuando la migración ya corrió. En dry-run no se sube
  // nada, así que el campo se anuncia pero no se arma.
  function needsWrite(field: string): boolean {
    return FORCE || !(existing as Record<string, unknown>)[field];
  }

  const planned: string[] = [];

  if (seed.introImage !== undefined) {
    if (!needsWrite("introImage")) {
      skipped.push("introImage");
    } else if (DRY_RUN) {
      planned.push(`introImage — se subiría ${seed.introImage}`);
    } else {
      patch.introImage = await uploadImage(seed.introImage);
    }
  }

  if (seed.story !== undefined) {
    if (!needsWrite("story")) {
      skipped.push("story");
    } else if (DRY_RUN) {
      planned.push(`story — se subiría ${seed.story.image ?? "(sin imagen)"}`);
    } else {
      const image = seed.story.image ? await uploadImage(seed.story.image) : undefined;
      patch.story = { ...seed.story, image };
    }
  }

  console.log("Plan:");
  for (const field of Object.keys(patch)) console.log(`  ${field} — se escribe`);
  for (const entry of planned) console.log(`  ${entry}`);
  for (const field of skipped) console.log(`  ${field} — ya tiene contenido, salteado`);
  if (Object.keys(patch).length === 0 && planned.length === 0 && skipped.length === 0) {
    console.log("  (nada que migrar)");
  }

  if (DRY_RUN) {
    console.log("\nDry run only — nothing was written, images were not uploaded.");
    return;
  }

  if (Object.keys(patch).length === 0) {
    console.log("\nNada para escribir. Usar --force para sobrescribir lo que ya tiene contenido.");
    return;
  }

  await client.patch(ABOUT_ID).set(patch).commit();
  console.log(`\n${ABOUT_ID} actualizado (${Object.keys(patch).join(", ")}).`);
  console.log("Migración completa.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
