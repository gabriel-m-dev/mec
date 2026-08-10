/**
 * Copia de seguridad del contenido: documentos MÁS los archivos de imagen.
 *
 * POR QUÉ EXISTE. El plan gratuito de Sanity no da restauración útil, y quien
 * tenga rol de administrador puede borrar el dataset entero. En este proyecto
 * la persona que edita el contenido necesita ese rol —el plan gratuito solo
 * ofrece Administrator y Viewer, y Viewer no puede editar—, así que la única
 * red que queda es tener una copia afuera.
 *
 * Conviene correrlo antes de cada carga grande de contenido y cada tanto por
 * las dudas. No hace falta ninguna configuración: usa las mismas variables de
 * `.env.local` que el resto de los scripts.
 *
 * QUÉ GUARDA. Un `.tar.gz` con todos los documentos y los archivos de imagen
 * descargados. Es una copia completa: si mañana no queda nada, de acá se
 * reconstruye con `npx sanity dataset import <archivo> <dataset>`.
 *
 * DÓNDE. En `backups/`, con la fecha y la hora en el nombre para que las
 * copias no se pisen. Esa carpeta está ignorada por git: son megabytes de
 * fotos, y además contenido de la iglesia que no tiene por qué vivir en un
 * repositorio público.
 *
 * Usage:
 *   npm run backup
 */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";

import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;

/** `2026-08-10_2214`, ordenable alfabéticamente y sin caracteres raros. */
function marcaDeTiempo(): string {
  const ahora = new Date();
  const dosDigitos = (n: number) => String(n).padStart(2, "0");

  return (
    `${ahora.getFullYear()}-${dosDigitos(ahora.getMonth() + 1)}-${dosDigitos(ahora.getDate())}` +
    `_${dosDigitos(ahora.getHours())}${dosDigitos(ahora.getMinutes())}`
  );
}

/**
 * La ruta al ejecutable de la CLI de Sanity dentro de `node_modules`.
 *
 * Se resuelve desde el `package.json` del paquete en vez de escribirla a mano:
 * si Sanity mueve su binario, esto sigue funcionando.
 */
function rutaDeLaCli(): string {
  const require = createRequire(import.meta.url);
  const packageJsonPath = require.resolve("sanity/package.json");
  const { bin } = require("sanity/package.json") as {
    bin: string | Record<string, string>;
  };
  const relativa = typeof bin === "string" ? bin : bin.sanity;

  return path.join(path.dirname(packageJsonPath), relativa);
}

function main() {
  if (!PROJECT_ID) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) throw new Error("Missing required env var: NEXT_PUBLIC_SANITY_DATASET");

  if (!TOKEN) {
    console.error(
      "Missing required env var: SANITY_API_WRITE_TOKEN.\n" +
        "Sin token la CLI pediría iniciar sesión a mano y el script no podría correr solo.\n" +
        "Set it directly in .env.local — never paste it in chat, never commit it.",
    );
    process.exit(1);
  }

  const carpeta = path.join(process.cwd(), "backups");
  mkdirSync(carpeta, { recursive: true });

  const destino = path.join(carpeta, `${DATASET}_${marcaDeTiempo()}.tar.gz`);

  console.log("=== Copia de seguridad del contenido ===\n");
  console.log(`  proyecto: ${PROJECT_ID}`);
  console.log(`  dataset:  ${DATASET}`);
  console.log(`  destino:  ${path.relative(process.cwd(), destino)}\n`);

  // Se invoca la CLI en vez de pegarle a la API de exportación a mano porque
  // la CLI además DESCARGA las imágenes. Una exportación de solo documentos
  // deja referencias a archivos que, si se borró el dataset, ya no existen.
  //
  // Se ejecuta el script de la CLI con el Node que ya está corriendo, y NO
  // `npx`: en Windows, `npx` es un `.cmd`, y Node se niega a lanzar archivos
  // `.cmd` sin shell —falla con EINVAL—. Meter un shell traería además
  // problemas de comillas con las rutas que tienen espacios.
  const hijo = spawn(
    process.execPath,
    [rutaDeLaCli(), "dataset", "export", DATASET, destino, "--overwrite"],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        // La CLI lee el token de acá; `sanity.cli.ts` lee el proyecto y el
        // dataset de las otras dos.
        SANITY_AUTH_TOKEN: TOKEN,
        NEXT_PUBLIC_SANITY_PROJECT_ID: PROJECT_ID,
        NEXT_PUBLIC_SANITY_DATASET: DATASET,
      },
    },
  );

  hijo.on("close", (code) => {
    if (code === 0) {
      console.log(`\nListo: ${path.relative(process.cwd(), destino)}`);
      console.log("Para restaurar:  npx sanity dataset import <archivo> <dataset>");
      return;
    }
    console.error(`\nLa exportación terminó con código ${code}.`);
    process.exit(code ?? 1);
  });
}

main();
