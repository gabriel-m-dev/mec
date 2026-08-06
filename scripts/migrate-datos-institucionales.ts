/**
 * Carga los datos institucionales reales de MEC.
 *
 * Salen de una nota oficial de la iglesia a la Municipalidad de Hurlingham
 * —membrete y pie de firma—, no de un snapshot inventado. Hasta ahora el
 * dataset tenía datos de relleno del seed original.
 *
 * NO se carga el DNI de la presidenta, aunque figura en la nota: es dato
 * personal sensible, no le sirve a ningún visitante y publicarlo la expondría
 * a fraude de identidad.
 *
 * Cada campo se escribe solo si está vacío, salvo los que se marcan como
 * correcciones explícitas (`address`, `venue.name`): esos SÍ pisan, porque lo
 * que hay es contenido de relleno del seed y está mal.
 *
 * Usage:
 *   npm run migrate:datos-institucionales -- --dry-run
 *   npm run migrate:datos-institucionales
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

/**
 * La nota se contradice: el membrete dice "Vigo 2595" y el cuerpo "ubicada en
 * Bustamante 2595 y Vigo". Se toma Vigo 2595 —confirmado por el usuario— y se
 * aclara la esquina, porque Bustamante cambió de nombre y los vecinos todavía
 * la buscan por el viejo.
 */
const ADDRESS = "Vigo 2595 (esq. Eva Perón, ex Bustamante), William Morris, Hurlingham";

/** El nombre real, en vez del "Auditorio Luz de Vida" que inventó el seed. */
const VENUE_NAME = "Ministerio Evangélico Cristiano (M.E.C.)";

/**
 * Valores de prueba que quedaron cargados en el dataset. Si el campo tiene
 * EXACTAMENTE uno de estos, se reemplaza por el dato real; si tiene otra cosa,
 * alguien lo escribió a conciencia y no se toca.
 */
const PLACEHOLDERS: Record<string, string> = {
  phone: "1122334455",
  email: "correo@gmail.com",
};

const REAL = {
  phone: "11-2530-9266",
  email: "graciela-noemi-rojas@hotmail.com",
  rnc: {
    number: "8587",
    resolution: "RESOL-2025-354-APN-SCYC#MRE",
  },
};

/**
 * El WhatsApp NO se toca. El dataset tiene `5491141648955`, que no es el
 * teléfono de la nota (`11-2530-9266`). Puede ser el número real de otra
 * persona de la iglesia, y pisarlo mandaría los mensajes a cualquier lado.
 * Lo cambia quien sepa cuál corresponde.
 */

interface SettingsDoc {
  _id: string;
  phone?: string;
  email?: string;
  whatsapp?: { phone?: string };
  rnc?: { number?: string };
}

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  console.log(
    DRY_RUN
      ? "=== Datos institucionales — DRY RUN (no writes performed) ===\n"
      : "=== Datos institucionales ===\n",
  );

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

  const settings = await client.fetch<SettingsDoc | null>(
    '*[_id == "siteSettings"][0]{_id, phone, email, whatsapp, rnc}',
  );

  if (!settings) {
    console.error("No existe el documento siteSettings.");
    process.exit(1);
  }

  // --- correcciones: pisan lo que hay porque lo que hay está mal ---
  const corrections: Record<string, unknown> = { address: ADDRESS };

  // --- campos vacíos, o con un valor de prueba conocido ---
  const fill: Record<string, unknown> = {};

  for (const key of ["phone", "email"] as const) {
    const current = settings[key];

    if (!current || current === PLACEHOLDERS[key]) {
      fill[key] = REAL[key];
    } else {
      console.log(`  siteSettings.${key} — "${current}" no es de prueba, salteado`);
    }
  }

  if (!settings.rnc?.number) {
    fill.rnc = REAL.rnc;
  } else {
    console.log("  siteSettings.rnc — ya cargado, salteado");
  }

  console.log(
    `  siteSettings.whatsapp — "${settings.whatsapp?.phone ?? "vacío"}" no se toca a propósito`,
  );

  const changes = { ...corrections, ...fill };

  for (const [key, value] of Object.entries(changes)) {
    const shown = typeof value === "string" ? value : JSON.stringify(value);
    console.log(`  siteSettings.${key} ${DRY_RUN ? "→" : "="} ${shown}`);
  }

  if (!DRY_RUN) {
    await client.patch("siteSettings").set(changes).commit();
  }

  // --- el nombre del salón ---
  console.log("");
  const venue = await client.fetch<{ _id: string; name?: string } | null>(
    '*[_id == "venue"][0]{_id, name}',
  );

  if (!venue) {
    console.log("  No existe el documento venue, salteado");
  } else if (venue.name === VENUE_NAME) {
    console.log("  venue.name — ya es el correcto, salteado");
  } else if (DRY_RUN) {
    console.log(`  venue.name → "${VENUE_NAME}" (era "${venue.name}")`);
  } else {
    await client.patch("venue").set({ name: VENUE_NAME }).commit();
    console.log(`  venue.name = "${VENUE_NAME}"`);
  }

  console.log(
    DRY_RUN ? "\nDry run only — nothing was written." : "\nListo.",
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
