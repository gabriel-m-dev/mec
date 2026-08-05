import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    // Mismo alias que `tsconfig.json`, para que los tests importen igual que la app.
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    // Node, no jsdom: lo que se testea acá es lógica pura (validación de
    // schemas, comparación de documentos), no componentes. Cuando haya tests
    // de componentes va a hacer falta agregar jsdom y @testing-library.
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
});
