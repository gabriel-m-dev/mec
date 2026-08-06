/**
 * Migración acotada: le pone `time` a los eventos que ya existen.
 *
 * `time` es un campo nuevo y opcional. Los eventos cargados antes de este
 * cambio no lo tienen, así que sus tarjetas mostrarían solo el día. Los
 * valores salen del mismo snapshot congelado que usa `scripts/seed-sanity.ts`,
 * emparejando por título, para que el seed y el dataset no diverjan y el guard
 * del seed no vea deriva.
 *
 * Mismo criterio que las otras migraciones: `patch().set()` sobre documentos
 * que YA EXISTEN, nunca `createOrReplace`, nunca crea nada. Idempotente: un
 * evento que ya tenga horario se saltea, salvo `--force`.
 *
 * Un evento que el cliente haya creado desde el Studio no está en el snapshot
 * y se saltea: no hay horario que inventarle.
 *
 * Usage:
 *   npm run migrate:event-times              # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run migrate:event-times -- --dry-run  # imprime el plan, no escribe
 *   npm run migrate:event-times -- --force    # reescribe horarios ya cargados
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

/**
 * Los mismos horarios que el snapshot de `scripts/seed-sanity.ts`, emparejados
 * por título. Si los dos lados divergen, el guard del seed lo va a reportar.
 */
const TIMES_BY_TITLE: Record<string, string> = {
  "Noche de adoración": "20:00",
  "Encuentro de familias": "11:00",
  "Conferencia de liderazgo": "09:30",
  "Vigilia de oración": "22:00",
  "Encuentro de mentoría": "19:00",
};

interface EventDoc {
  _id: string;
  title: string;
  time?: string;
}

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  console.log(
    DRY_RUN
      ? "=== Horarios de eventos — DRY RUN (no writes performed) ===\n"
      : "=== Horarios de eventos (patch acotado, no destructivo) ===\n",
  );

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run migrate:event-times -- --dry-run` to preview the plan.",
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
    '*[_type == "event"] | order(_createdAt asc){_id, title, time}',
  );

  let updated = 0;
  let skippedExisting = 0;
  let skippedUnknown = 0;

  for (const event of events) {
    const time = TIMES_BY_TITLE[event.title];

    if (!time) {
      console.log(`  ${event._id} — no está en el snapshot, salteado`);
      skippedUnknown += 1;
      continue;
    }

    if (event.time && !FORCE) {
      console.log(`  ${event._id} — ya tiene "${event.time}", salteado`);
      skippedExisting += 1;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  ${event._id} — pondría "${time}"`);
    } else {
      await client.patch(event._id).set({ time }).commit();
      console.log(`  ${event._id} — "${time}"`);
    }
    updated += 1;
  }

  console.log("");
  console.log(`Eventos revisados: ${events.length}`);
  console.log(`${DRY_RUN ? "A actualizar" : "Actualizados"}: ${updated}`);
  console.log(`Salteados — ya tenían horario: ${skippedExisting}`);
  console.log(`Salteados — no están en el snapshot: ${skippedUnknown}`);
  console.log(DRY_RUN ? "\nDry run only — nothing was written." : "\nMigración completa.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
