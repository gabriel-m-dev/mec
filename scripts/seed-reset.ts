/**
 * DESTRUCTIVE reset script for the Sanity dataset.
 *
 * Deletes every document of the managed types (see MANAGED_TYPES below).
 * This is the deliberate opposite of `scripts/seed-sanity.ts`, which is
 * additive-only. Running this requires typing the exact dataset name as a
 * confirmation prompt — any other input aborts with no changes made.
 *
 * Usage:
 *   npm run seed:reset   # requires SANITY_API_WRITE_TOKEN, prompts for confirmation
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

loadEnvConfig(process.cwd());

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

const MANAGED_TYPES = [
  "siteSettings",
  "venue",
  "chaplain",
  "worshipService",
  "event",
  "newsItem",
  "pageBanner",
] as const;

async function main() {
  if (!PROJECT_ID) {
    throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  }

  // Sin fallback: este script BORRA documentos. Apuntar al dataset equivocado
  // por una env mal puesta no puede ser un default silencioso.
  if (!DATASET) {
    throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");
  }

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.",
    );
    process.exit(1);
  }

  console.log("=== Sanity seed:reset — DESTRUCTIVE ===\n");
  console.log(
    `This will PERMANENTLY DELETE every document of these types from dataset "${DATASET}":`,
  );
  console.log(`  ${MANAGED_TYPES.join(", ")}\n`);
  console.log("Documents created manually in Studio (not by the seed script) are");
  console.log("also deleted if their _type is in the list above.\n");

  const rl = readline.createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(
    `Type the dataset name ("${DATASET}") to confirm, anything else cancels: `,
  );
  rl.close();

  if (answer.trim() !== DATASET) {
    console.error("\nConfirmation did not match. Aborting — nothing was deleted.");
    process.exit(1);
  }

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: false,
    token,
  });

  const ids: string[] = await client.fetch(`*[_type in $types]._id`, {
    types: MANAGED_TYPES,
  });

  if (ids.length === 0) {
    console.log("\nNothing to delete — no documents of the managed types exist.");
    return;
  }

  console.log(`\nDeleting ${ids.length} document(s)...`);
  const tx = client.transaction();
  for (const id of ids) {
    tx.delete(id);
  }
  await tx.commit();

  console.log(`Done. Deleted ${ids.length} document(s).`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
