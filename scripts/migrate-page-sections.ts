/**
 * Migración acotada: agrega `sections` y `faqs` a los 7 documentos
 * `pageBanner` que YA EXISTEN en el dataset.
 *
 * Por qué PATCH y no `createOrReplace` (como hace `scripts/seed-sanity.ts`):
 * el seed reescribe el documento COMPLETO con los literales congelados de
 * `scripts/page-banners-data.ts`, así que correrlo hoy pisaría cualquier
 * edición que el cliente haya hecho desde el Studio en `route`, `eyebrow`,
 * `title`, `description`, `image` o `imageAlt`. Esta migración usa
 * `client.patch(id).set({ sections, faqs }).commit()`, que toca
 * EXCLUSIVAMENTE esos dos campos nuevos y deja todo lo demás del documento
 * intacto — es segura de correr sobre el dataset de producción en cualquier
 * momento, incluso después de que el cliente haya estado editando el sitio.
 *
 * Idempotente y no destructiva: si un documento YA tiene `sections` o
 * `faqs` no vacíos, ese campo se saltea (nunca se pisa) salvo que se pase
 * `--force`. Si un documento no existe con el id determinista esperado, se
 * saltea con un mensaje claro — esta migración NUNCA crea documentos
 * (para eso está `scripts/seed-sanity.ts`).
 *
 * Los valores migrados vienen de `scripts/page-banners-data.ts`, la misma
 * fuente que usa `scripts/seed-sanity.ts` — un solo snapshot, no dos copias
 * que puedan divergir.
 *
 * Usage:
 *   npm run migrate:page-sections               # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run migrate:page-sections -- --dry-run   # imprime el plan, no requiere token, no escribe
 *   npm run migrate:page-sections -- --force     # sobrescribe sections/faqs ya existentes
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

import type { PageBanner } from "../sanity/lib/types";
import { PAGE_BANNERS } from "./page-banners-data";

// Carga .env.local igual que Next.js — este script corre standalone vía tsx,
// fuera del proceso de Next.js, así que las env vars no se cargan solas.
loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

// Mismo esquema de id determinista que scripts/seed-sanity.ts usa para
// pageBanner — hay que resolver el mismo documento, no crear uno nuevo.
function bannerId(route: string): string {
  return `pageBanner-${route.replace(/^\//, "")}`;
}

function padLabel(label: string, width: number): string {
  return label.padEnd(width, " ");
}

interface PlanEntry {
  id: string;
  route: string;
  sections: NonNullable<PageBanner["sections"]>;
  faqs: NonNullable<PageBanner["faqs"]>;
}

async function main() {
  if (!PROJECT_ID) {
    throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  }

  // Sin fallback: escribir en el dataset equivocado por una env mal puesta es
  // silencioso y, en un script que hace `patch`, igual de peligroso que en
  // el seed — mejor fallar fuerte antes de tocar nada.
  if (!DATASET) {
    throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");
  }

  console.log(
    DRY_RUN
      ? "=== Migración page sections/FAQs — DRY RUN (no writes performed, no token required) ===\n"
      : "=== Migración page sections/FAQs (patch acotado, no destructivo) ===\n",
  );

  const plan: PlanEntry[] = PAGE_BANNERS.map((banner) => ({
    id: bannerId(banner.route),
    route: banner.route,
    sections: banner.sections ?? [],
    faqs: banner.faqs ?? [],
  }));

  const totalSections = plan.reduce((sum, entry) => sum + entry.sections.length, 0);
  const totalFaqs = plan.reduce((sum, entry) => sum + entry.faqs.length, 0);

  console.log("Plan:");
  const idWidth = 28;
  for (const entry of plan) {
    const nothing = entry.sections.length === 0 && entry.faqs.length === 0;
    console.log(
      `  ${padLabel(entry.id, idWidth)} ${entry.sections.length} sección(es), ${entry.faqs.length} FAQ(s)` +
        (nothing ? " — nada que migrar" : ""),
    );
  }
  console.log("");
  console.log(`Documentos en el plan: ${plan.length}`);
  console.log(`Secciones planificadas: ${totalSections}`);
  console.log(`FAQs planificadas: ${totalFaqs}`);

  if (DRY_RUN) {
    console.log("\nDry run only — nothing was written, no token was required.");
    return;
  }

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    console.error(
      "\nMissing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run migrate:page-sections -- --dry-run` to preview the plan without a token.",
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

  console.log("");

  let updated = 0;
  let skippedEmpty = 0;
  let skippedMissing = 0;
  let skippedExisting = 0;

  for (const entry of plan) {
    if (entry.sections.length === 0 && entry.faqs.length === 0) {
      skippedEmpty += 1;
      continue;
    }

    const existing = (await client.getDocument(entry.id)) as PageBanner | undefined;
    if (!existing) {
      console.log(
        `  ${padLabel(entry.id, idWidth)} NO EXISTE en el dataset — salteado (esta migración nunca crea documentos, correr scripts/seed-sanity.ts si hace falta crearlo)`,
      );
      skippedMissing += 1;
      continue;
    }

    const patch: Partial<Pick<PageBanner, "sections" | "faqs">> = {};
    const alreadyHas: string[] = [];

    if (entry.sections.length > 0) {
      const hasExisting = Array.isArray(existing.sections) && existing.sections.length > 0;
      if (hasExisting && !FORCE) {
        alreadyHas.push("sections");
      } else {
        patch.sections = entry.sections;
      }
    }

    if (entry.faqs.length > 0) {
      const hasExisting = Array.isArray(existing.faqs) && existing.faqs.length > 0;
      if (hasExisting && !FORCE) {
        alreadyHas.push("faqs");
      } else {
        patch.faqs = entry.faqs;
      }
    }

    if (alreadyHas.length > 0) {
      console.log(
        `  ${padLabel(entry.id, idWidth)} ya tiene ${alreadyHas.join(" y ")} — salteado (usar --force para sobrescribir)`,
      );
    }

    if (Object.keys(patch).length === 0) {
      skippedExisting += 1;
      continue;
    }

    await client.patch(entry.id).set(patch).commit();
    console.log(`  ${padLabel(entry.id, idWidth)} actualizado (${Object.keys(patch).join(", ")})`);
    updated += 1;
  }

  console.log("");
  console.log(`Documentos actualizados: ${updated}`);
  console.log(`Documentos salteados — sin sections/faqs para migrar: ${skippedEmpty}`);
  console.log(`Documentos salteados — no existen en el dataset: ${skippedMissing}`);
  console.log(`Documentos salteados — ya tenían datos (sin --force): ${skippedExisting}`);
  console.log("\nMigración completa.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
