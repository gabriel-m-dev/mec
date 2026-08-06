/**
 * Sube las fotos de las actividades de capellanía y se las engancha.
 *
 * Las fotos son de Unsplash, con licencia libre para uso comercial y sin
 * atribución obligatoria. Son un punto de partida: la idea es que la iglesia
 * las reemplace por fotos propias de su gente en sus lugares.
 *
 * Se eligieron sin banderas, sin parches legibles y sin rostros
 * identificables. El stock de estas categorías suele mostrar policía de
 * Nueva York o ejército de Estados Unidos, y eso en el sitio de una iglesia
 * argentina se lee como relleno de banco de imágenes.
 *
 * Mismo criterio que las otras migraciones: `patch().set()` sobre documentos
 * que YA EXISTEN, nunca crea ninguno. Idempotente: una actividad que ya tenga
 * imagen se saltea, salvo `--force`.
 *
 * Usage:
 *   npm run attach:chaplaincy-images                 # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run attach:chaplaincy-images -- --dry-run    # imprime el plan, no escribe
 *   npm run attach:chaplaincy-images -- --force      # reemplaza imagenes ya cargadas
 */

import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

const IMAGES = [
  {
    docId: "chaplaincyActivity-hospitales",
    file: "public/images/chaplaincy/hospitales.jpg",
    alt: "Dos manos tomadas sobre la cama de un hospital.",
  },
  {
    docId: "chaplaincyActivity-fuerzas-policiales",
    file: "public/images/chaplaincy/fuerzas-policiales.jpg",
    alt: "Un patrullero con las balizas encendidas en una calle de noche.",
  },
  {
    docId: "chaplaincyActivity-fuerzas-armadas",
    file: "public/images/chaplaincy/fuerzas-armadas.jpg",
    alt: "Personal uniformado sentado en la caja de un camión de transporte.",
  },
  {
    docId: "chaplaincyActivity-escuelas",
    file: "public/images/chaplaincy/escuelas.jpg",
    alt: "Manos sirviendo un plato de comida en un comedor.",
  },
];

interface ActivityDoc {
  _id: string;
  name: string;
  image?: unknown;
}

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  console.log(
    DRY_RUN
      ? "=== Fotos de capellanía — DRY RUN (no writes performed) ===\n"
      : "=== Fotos de capellanía (patch acotado, no destructivo) ===\n",
  );

  // Se valida ANTES de tocar nada: si falta un archivo, mejor cortar acá que
  // dejar la mitad de las actividades con foto y la otra mitad sin.
  for (const { file } of IMAGES) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      console.error(`No existe el archivo: ${file}`);
      process.exit(1);
    }
  }

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run attach:chaplaincy-images -- --dry-run` to preview the plan.",
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

  let updated = 0;
  let skipped = 0;

  for (const { docId, file, alt } of IMAGES) {
    const doc = await client.fetch<ActivityDoc | null>(
      "*[_id == $id][0]{_id, name, image}",
      { id: docId },
    );

    if (!doc) {
      console.log(`  ${docId} — no existe el documento, salteado`);
      skipped += 1;
      continue;
    }

    if (doc.image && !FORCE) {
      console.log(`  ${docId} — ya tiene imagen, salteado`);
      skipped += 1;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  ${docId} — subiría ${path.basename(file)}`);
      updated += 1;
      continue;
    }

    const asset = await client.assets.upload(
      "image",
      fs.createReadStream(path.join(process.cwd(), file)),
      { filename: path.basename(file) },
    );

    await client
      .patch(docId)
      .set({
        image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
        imageAlt: alt,
      })
      .commit();

    console.log(`  ${docId} — "${doc.name}" con foto`);
    updated += 1;
  }

  console.log("");
  console.log(`${DRY_RUN ? "A actualizar" : "Actualizadas"}: ${updated}`);
  console.log(`Salteadas: ${skipped}`);
  console.log(DRY_RUN ? "\nDry run only — nothing was written." : "\nListo.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
