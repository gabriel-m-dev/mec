import { esESLocale } from "@sanity/locale-es-es";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/deskStructure";

const SINGLETON_TYPES = ["siteSettings", "venue"];

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
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type !== "global") {
        return prev;
      }

      return prev.filter(
        (template) => !SINGLETON_TYPES.includes(template.templateId),
      );
    },
    actions: (prev, { schemaType }) => {
      if (!SINGLETON_TYPES.includes(schemaType)) {
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
