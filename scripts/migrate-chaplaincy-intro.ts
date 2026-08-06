/**
 * Migración acotada: mueve al dataset el párrafo de "qué es la capellanía".
 *
 * Ese texto vivía escrito a mano en `app/(site)/capellanes/page.tsx`, así que
 * la iglesia lo veía publicado pero no podía tocarlo. Ahora es el campo
 * `chaplaincyIntro` de `pageBanner-capellanes`. Sin esta migración el campo
 * arranca vacío y el párrafo desaparecería de la página.
 *
 * Mismo criterio que las otras migraciones: `patch().set()` sobre un documento
 * que YA EXISTE, nunca `createOrReplace`, nunca crea nada. Idempotente: si el
 * campo ya tiene texto se saltea, salvo `--force`.
 *
 * Usage:
 *   npm run migrate:chaplaincy-intro                 # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run migrate:chaplaincy-intro -- --dry-run    # imprime el plan, no escribe
 *   npm run migrate:chaplaincy-intro -- --force      # reescribe un texto ya cargado
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

const DOC_ID = "pageBanner-capellanes";

/** Copiado tal cual de lo que la página venía mostrando. */
const INTRO =
  "El programa de capellanía existe para que nadie atraviese un momento " +
  "difícil en soledad. Nuestros capellanes ofrecen escucha confidencial, " +
  "oración y orientación práctica en situaciones de duelo, crisis familiar, " +
  "enfermedad o simplemente cuando la vida se siente demasiado pesada para " +
  "llevarla solos.";

interface BannerDoc {
  _id: string;
  chaplaincyIntro?: string;
}

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  console.log(
    DRY_RUN
      ? "=== Texto de capellanía — DRY RUN (no writes performed) ===\n"
      : "=== Texto de capellanía (patch acotado, no destructivo) ===\n",
  );

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run migrate:chaplaincy-intro -- --dry-run` to preview the plan.",
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

  const banner = await client.fetch<BannerDoc | null>(
    '*[_id == $id][0]{_id, chaplaincyIntro}',
    { id: DOC_ID },
  );

  if (!banner) {
    console.error(
      `No existe el documento ${DOC_ID}.\n` +
        "Esta migración solo parchea documentos existentes: no crea ninguno.",
    );
    process.exit(1);
  }

  if (banner.chaplaincyIntro && !FORCE) {
    console.log(`  ${DOC_ID} — ya tiene texto cargado, salteado`);
    console.log("\nNada que hacer. Usá --force para reescribirlo.");
    return;
  }

  if (DRY_RUN) {
    console.log(`  ${DOC_ID} — pondría:\n`);
    console.log(`    "${INTRO}"`);
    console.log("\nDry run only — nothing was written.");
    return;
  }

  await client.patch(DOC_ID).set({ chaplaincyIntro: INTRO }).commit();
  console.log(`  ${DOC_ID} — texto cargado`);
  console.log("\nMigración completa.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
