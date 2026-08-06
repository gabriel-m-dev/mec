/**
 * Crea el documento único `homePage` si todavía no existe.
 *
 * El carrusel de la portada se edita desde el Studio, pero el documento está
 * protegido de creación (es un singleton en `sanity.config.ts`), así que el
 * cliente no puede crearlo: tiene que existir de antes.
 *
 * Usa `createIfNotExists`, no `createOrReplace`: si el documento ya está, con
 * destacados elegidos, esto no lo toca. Correrlo de nuevo no rompe nada.
 *
 * A propósito NO está en `scripts/seed-sanity.ts`: el carrusel es 100%
 * contenido del cliente, sin snapshot histórico. Si el seed lo escribiera, su
 * guard vería los destacados elegidos como deriva y abortaría cada vez.
 *
 * Usage:
 *   npm run create:home-page              # crea si falta
 *   npm run create:home-page -- --dry-run  # solo informa
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

const DOC_ID = "homePage";

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.",
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

  const existing = await client.getDocument(DOC_ID);

  if (existing) {
    const featured = existing.featured;
    const count = Array.isArray(featured) ? featured.length : 0;
    console.log(`${DOC_ID} ya existe — ${count} destacado(s). No se toca.`);
    return;
  }

  if (DRY_RUN) {
    console.log(`${DOC_ID} NO existe — se crearía vacío.`);
    return;
  }

  await client.createIfNotExists({ _id: DOC_ID, _type: "homePage", featured: [] });
  console.log(`${DOC_ID} creado, sin destacados. Cargalos desde el Studio → Inicio.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
