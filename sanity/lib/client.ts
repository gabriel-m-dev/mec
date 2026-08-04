import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId) {
  throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
}

// Sin fallback a "production": un dataset mal configurado serviría contenido
// del dataset equivocado sin un solo error, y el nombre correcto coincide con
// el fallback, así que el bug pasaría inadvertido hasta que dejara de coincidir.
if (!dataset) {
  throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2025-05-30",
  useCdn: false,
});
