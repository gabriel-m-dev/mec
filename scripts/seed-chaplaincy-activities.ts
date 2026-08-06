/**
 * Carga las actividades de capellanía de ejemplo.
 *
 * No son contenido definitivo: son un punto de partida para que la iglesia
 * vea la sección armada y las edite desde el Studio en vez de arrancar
 * frente a una lista vacía.
 *
 * Van SIN foto a propósito. Poner una imagen cualquiera —una noche de
 * adoración debajo del título "Hospitales"— quedaría publicado y le mentiría
 * al visitante. Sin imagen la fila se dibuja solo con el texto, que es
 * honesto y se ve bien igual. La foto la carga la iglesia.
 *
 * Usa `create` con `_id` determinista y NO `createOrReplace`: si el documento
 * ya existe, la API falla con conflicto y el script lo reporta como salteado.
 * Así una segunda corrida nunca pisa lo que el cliente haya editado.
 *
 * Usage:
 *   npm run seed:chaplaincy-activities              # escribe (requiere SANITY_API_WRITE_TOKEN)
 *   npm run seed:chaplaincy-activities -- --dry-run  # imprime el plan, no escribe
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

const ACTIVITIES = [
  {
    _id: "chaplaincyActivity-hospitales",
    name: "Hospitales",
    description:
      "Visitamos a personas internadas y acompañamos a sus familias durante el tratamiento y la espera.",
  },
  {
    _id: "chaplaincyActivity-fuerzas-policiales",
    name: "Fuerzas policiales",
    description:
      "Contención para el personal y sus familias, en un trabajo que desgasta en silencio.",
  },
  {
    _id: "chaplaincyActivity-fuerzas-armadas",
    name: "Fuerzas armadas",
    description:
      "Acompañamiento espiritual en unidades y en destinos alejados de casa.",
  },
  {
    _id: "chaplaincyActivity-escuelas",
    name: "Escuelas y comedores",
    description:
      "Presencia junto a docentes, familias y equipos de trabajo del barrio.",
  },
];

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  console.log(
    DRY_RUN
      ? "=== Actividades de capellanía — DRY RUN (no writes performed) ===\n"
      : "=== Actividades de capellanía (create, nunca pisa lo existente) ===\n",
  );

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run seed:chaplaincy-activities -- --dry-run` to preview the plan.",
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

  let created = 0;
  let skipped = 0;

  for (const activity of ACTIVITIES) {
    if (DRY_RUN) {
      console.log(`  ${activity._id} — crearía "${activity.name}"`);
      created += 1;
      continue;
    }

    try {
      await client.create({ _type: "chaplaincyActivity", ...activity });
      console.log(`  ${activity._id} — creada`);
      created += 1;
    } catch (err) {
      // El conflicto de ID es el caso esperado en una segunda corrida: el
      // documento ya está y no hay que tocarlo.
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already exists") || message.includes("conflict")) {
        console.log(`  ${activity._id} — ya existe, salteada`);
        skipped += 1;
        continue;
      }
      throw err;
    }
  }

  console.log("");
  console.log(`${DRY_RUN ? "A crear" : "Creadas"}: ${created}`);
  console.log(`Salteadas — ya existían: ${skipped}`);
  console.log(
    DRY_RUN
      ? "\nDry run only — nothing was written."
      : "\nListo. Las fotos se cargan desde el Studio: sin imagen, la fila se muestra solo con el texto.",
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
