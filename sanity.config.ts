import { esESLocale } from "@sanity/locale-es-es";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/deskStructure";

// Existe exactamente un documento de cada uno de estos tipos.
const SINGLETON_TYPES = ["homePage", "siteSettings", "venue"];

// Conjunto fijo: hay un `pageBanner` por ruta y cada página lo busca por su
// campo `route`. Un banner de más no se muestra en ninguna parte, y uno de
// menos deja a esa página sin encabezado y sin su <h1>. Los 7 se editan, no se
// crean ni se borran: si alguna vez hace falta uno nuevo, lo agrega el seed.
const FIXED_SET_TYPES = ["pageBanner"];

const PROTECTED_TYPES = [...SINGLETON_TYPES, ...FIXED_SET_TYPES];

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId) {
  throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
}

if (!dataset) {
  throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");
}

export default defineConfig({
  name: "mec-site",
  title: "MEC — Panel de edición",
  projectId,
  dataset,
  basePath: "/studio",
  apiVersion: "2025-05-30",
  schema: {
    types: schemaTypes,
  },
  plugins: [structureTool({ structure }), esESLocale()],
  document: {
    // Se filtra en TODOS los contextos de creación, no solo en el "+" global.
    // Filtrar únicamente `global` dejaba pasar el botón "Crear nuevo documento"
    // de las listas del menú lateral (contexto `structure`), y por ahí se podía
    // crear un `pageBanner` de más. Como el tipo también tiene la acción
    // `delete` sacada, ese documento quedaba imposible de borrar desde Studio:
    // se creaba un callejón sin salida.
    newDocumentOptions: (prev) =>
      prev.filter((template) => !PROTECTED_TYPES.includes(template.templateId)),
    actions: (prev, { schemaType }) => {
      if (!PROTECTED_TYPES.includes(schemaType)) {
        return prev;
      }

      return prev.filter(
        ({ action }) =>
          action !== "delete" &&
          action !== "duplicate" &&
          action !== "unpublish",
      );
    },
  },
});
