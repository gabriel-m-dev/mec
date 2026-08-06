import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Tarjeta que ven WhatsApp, Facebook e Instagram cuando alguien comparte el
 * link. Antes no existia ninguna y el sitio se compartia como texto pelado,
 * que para una iglesia que se difunde justamente por WhatsApp es casi todo
 * el canal.
 *
 * Se genera con `next/og` en vez de exportar un PNG a mano para que el dia
 * que cambie el nombre o el logo no haya que volver a abrir un editor de
 * imagenes: se toca este archivo y listo.
 */

export const alt = "MEC — Ministerio Evangélico Cristiano";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  // El runtime de `next/og` no resuelve rutas de `public/` solo: hay que leer
  // el archivo y pasarlo embebido. Se lee del filesystem y no por fetch para
  // no depender de que el propio sitio este levantado durante el build.
  const logo = await readFile(
    join(process.cwd(), "public", "images", "logo-mec.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // `bg-ink-950`, el mismo fondo que el sitio.
          backgroundColor: "#02050c",
          // Halo dorado detras del logo, para que la tarjeta no sea un
          // rectangulo negro plano en el feed.
          backgroundImage:
            "radial-gradient(circle at 50% 42%, rgba(227,170,53,0.22), rgba(2,5,12,0) 62%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={460} height={310} />

        {/* `letterSpacing` agrega el espacio TAMBIEN despues de la ultima
            letra, asi que un texto centrado queda corrido a la izquierda
            justo esa cantidad. El `paddingLeft` la compensa. */}
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: 18,
            paddingLeft: 18,
            color: "#ffffff",
            marginTop: 12,
          }}
        >
          MEC
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 32,
            letterSpacing: 8,
            paddingLeft: 8,
            color: "#f0c76b",
            marginTop: 14,
          }}
        >
          MINISTERIO EVANGÉLICO CRISTIANO
        </div>
      </div>
    ),
    size,
  );
}
