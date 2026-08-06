/**
 * Migra la sección de Ministerios a The Chosen.
 *
 * Hace dos cosas, en este orden:
 *
 *   1. Le cambia la ruta al banner: `pageBanner-ministerios` pasa de
 *      `/ministerios` a `/the-chosen`. Se conserva el `_id` viejo a propósito
 *      —crear un documento nuevo perdería la imagen y los textos que la
 *      iglesia ya había cargado—.
 *
 *   2. BORRA los 4 documentos de tipo `ministry`. La sección deja de existir,
 *      así que quedarían invisibles y el seed los volvería a crear en cada
 *      corrida: exactamente el callejón sin salida de los banners huérfanos
 *      que ya se arregló una vez.
 *
 * El contenido borrado NO se pierde del todo: los textos vivían congelados en
 * `scripts/seed-sanity.ts` y las fotos en `public/images/ministries/`, y las
 * dos cosas están en el historial de git.
 *
 * El paso 1 corre siempre; el paso 2 solo con `--delete-ministries`, para que
 * borrar sea un acto deliberado y no un efecto secundario.
 *
 * Usage:
 *   npm run migrate:the-chosen -- --dry-run                      # imprime el plan
 *   npm run migrate:the-chosen                                   # solo migra la ruta
 *   npm run migrate:the-chosen -- --delete-ministries            # migra y borra
 */

import { loadEnvConfig } from "@next/env";
import { createClient } from "@sanity/client";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");
const DELETE_MINISTRIES = process.argv.includes("--delete-ministries");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = "2025-05-30";

const BANNER_ID = "pageBanner-ministerios";
const NEW_ROUTE = "/the-chosen";

interface BannerDoc {
  _id: string;
  route?: string;
  title?: string;
}

/**
 * El título que el banner traía de la época de Ministerios. Solo si sigue
 * siendo EXACTAMENTE este se reescriben los textos: si la iglesia ya lo
 * cambió, lo suyo manda y no se toca.
 */
const OLD_TITLE = "Equipos que convierten la fe en acción concreta";

/** Los mismos textos que el snapshot de `scripts/page-banners-data.ts`. */
const NEW_TEXTS = {
  eyebrow: "The Chosen",
  title: "Un lugar donde los chicos crecen, juegan y aprenden",
  description:
    "The Chosen es el grupo de chicos de la iglesia: salidas, juegos y actividades para crecer en comunidad y en la fe.",
};

interface MinistryDoc {
  _id: string;
  name: string;
}

async function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  console.log(
    DRY_RUN
      ? "=== Ministerios → The Chosen — DRY RUN (no writes performed) ===\n"
      : "=== Ministerios → The Chosen ===\n",
  );

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!DRY_RUN && !token) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.\n" +
        "Tip: run `npm run migrate:the-chosen -- --dry-run` to preview the plan.",
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

  // --- 1. la ruta del banner ---
  const banner = await client.fetch<BannerDoc | null>(
    "*[_id == $id][0]{_id, route, title}",
    { id: BANNER_ID },
  );

  if (!banner) {
    console.error(
      `No existe el documento ${BANNER_ID}.\n` +
        "Sin él la página de The Chosen queda sin encabezado y sin <h1>.",
    );
    process.exit(1);
  }

  if (banner.route === NEW_ROUTE) {
    console.log(`  ${BANNER_ID} — ya apunta a ${NEW_ROUTE}, salteado`);
  } else if (DRY_RUN) {
    console.log(`  ${BANNER_ID} — cambiaría "${banner.route}" por "${NEW_ROUTE}"`);
  } else {
    await client.patch(BANNER_ID).set({ route: NEW_ROUTE }).commit();
    console.log(`  ${BANNER_ID} — ruta ${NEW_ROUTE}`);
  }

  // --- 1b. los textos del banner ---
  // Sin esto el encabezado seguiría diciendo "Equipos que convierten la fe en
  // acción concreta" arriba de una página sobre un grupo de chicos.
  if (banner.title !== OLD_TITLE) {
    console.log(
      `  ${BANNER_ID} — el título ya no es el de Ministerios, textos sin tocar`,
    );
  } else if (DRY_RUN) {
    console.log(`  ${BANNER_ID} — reescribiría los textos del encabezado`);
  } else {
    await client.patch(BANNER_ID).set(NEW_TEXTS).commit();
    console.log(`  ${BANNER_ID} — textos del encabezado actualizados`);
  }

  // --- 2. los ministerios ---
  const ministries = await client.fetch<MinistryDoc[]>(
    '*[_type == "ministry"] | order(_createdAt asc){_id, name}',
  );

  console.log("");

  if (ministries.length === 0) {
    console.log("  No quedan documentos de tipo ministry.");
  } else if (!DELETE_MINISTRIES) {
    console.log(`  ${ministries.length} ministerio(s) siguen en el dataset:`);
    for (const ministry of ministries) {
      console.log(`    - ${ministry.name} (${ministry._id})`);
    }
    console.log(
      "\n  NO se borraron. Volvé a correr con --delete-ministries para eliminarlos.",
    );
  } else {
    for (const ministry of ministries) {
      if (DRY_RUN) {
        console.log(`  ${ministry._id} — borraría "${ministry.name}"`);
        continue;
      }

      await client.delete(ministry._id);
      console.log(`  ${ministry._id} — "${ministry.name}" borrado`);
    }
  }

  console.log(DRY_RUN ? "\nDry run only — nothing was written." : "\nListo.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
