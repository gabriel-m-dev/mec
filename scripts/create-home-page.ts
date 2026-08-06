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
import fs from "node:fs";
import path from "node:path";

loadEnvConfig(process.cwd());

/**
 * Contenido de arranque del bloque de transmisión en vivo. Es un PLACEHOLDER:
 * el enlace apunta a la portada de YouTube hasta que la iglesia pase la
 * dirección real de su transmisión, que se cambia desde el Studio sin tocar
 * código.
 */
const LIVE_PLACEHOLDER = {
  title: "Seguí el culto en vivo",
  description:
    "Conectate desde donde estés y participá de la transmisión con el resto de la comunidad.",
  url: "https://www.youtube.com",
  cta: "Ver en vivo",
  imagePath: "/images/pages/cultos-banner.jpg",
  imageAlt: "Culto transmitido en vivo desde el auditorio",
};

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

  async function uploadLiveImage() {
    const abs = path.join(process.cwd(), "public", LIVE_PLACEHOLDER.imagePath);
    if (!fs.existsSync(abs)) {
      throw new Error(`Imagen no encontrada en disco: ${LIVE_PLACEHOLDER.imagePath}`);
    }
    const asset = await client.assets.upload("image", fs.createReadStream(abs), {
      filename: path.basename(abs),
    });
    return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  }

  function liveBlock(image: unknown) {
    return {
      title: LIVE_PLACEHOLDER.title,
      description: LIVE_PLACEHOLDER.description,
      url: LIVE_PLACEHOLDER.url,
      cta: LIVE_PLACEHOLDER.cta,
      image,
      imageAlt: LIVE_PLACEHOLDER.imageAlt,
    };
  }

  const existing = await client.getDocument(DOC_ID);

  if (existing) {
    const count = Array.isArray(existing.featured) ? existing.featured.length : 0;

    // El documento ya está, pero puede venir de antes del bloque de vivo.
    // Solo se completa si falta: si la iglesia ya puso su enlace real, no se
    // le pisa nada.
    if (existing.live) {
      console.log(`${DOC_ID} ya existe — ${count} destacado(s), vivo cargado. No se toca.`);
      return;
    }

    if (DRY_RUN) {
      console.log(`${DOC_ID} existe pero SIN bloque de vivo — se agregaría el placeholder.`);
      return;
    }

    await client.patch(DOC_ID).set({ live: liveBlock(await uploadLiveImage()) }).commit();
    console.log(`${DOC_ID} — bloque de transmisión en vivo agregado (enlace placeholder).`);
    return;
  }

  if (DRY_RUN) {
    console.log(`${DOC_ID} NO existe — se crearía con el bloque de vivo y sin destacados.`);
    return;
  }

  await client.createIfNotExists({
    _id: DOC_ID,
    _type: "homePage",
    featured: [],
    live: liveBlock(await uploadLiveImage()),
  });
  console.log(`${DOC_ID} creado con el bloque de vivo. Cargá los destacados en Studio → Inicio.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
