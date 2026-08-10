import { defineCliConfig } from "sanity/cli";

/**
 * Configuración de la línea de comandos de Sanity.
 *
 * Sin este archivo la CLI no sabe a qué proyecto apunta y cualquier comando de
 * dataset —exportar, importar, listar— falla pidiendo un `projectId`. No lo
 * necesita el sitio ni el Studio: los dos leen `sanity.config.ts`.
 *
 * Las variables se leen del entorno, igual que en el resto del proyecto: acá
 * no va ningún identificador escrito a mano. Quien invoca los comandos es
 * `scripts/backup-dataset.ts`, que carga `.env.local` y se las pasa al proceso
 * hijo.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
});
