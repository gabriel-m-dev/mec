import { defineConfig } from "sanity";
import { schemaTypes } from "./sanity/schemaTypes";

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
  title: "MEC Site",
  projectId,
  dataset,
  basePath: "/studio",
  apiVersion: "2025-05-30",
  schema: {
    types: schemaTypes,
  },
});
