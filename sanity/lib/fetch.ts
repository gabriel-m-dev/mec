import { sanityClient } from "./client";
import type { SanityTag } from "./tags";

/**
 * En desarrollo NO se cachea; en producción sí, con etiquetas.
 *
 * Se decide una sola vez, al cargar el módulo: `NODE_ENV` no cambia mientras
 * el proceso vive.
 */
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * La única puerta de entrada al contenido de Sanity.
 *
 * EL PROBLEMA QUE RESUELVE. En producción, cada consulta se cachea sin
 * vencimiento (`force-cache`) y lo único que la invalida es el webhook de
 * Sanity que llama a `/api/revalidate` y hace `revalidateTag`. Ese webhook
 * apunta al sitio DESPLEGADO: no puede llegar a `localhost`. Y Next guarda esa
 * caché EN DISCO, en `.next/cache/fetch-cache`, así que tampoco se limpia al
 * reiniciar.
 *
 * Resultado en local: la primera respuesta de cada consulta quedaba grabada
 * para siempre. Se editaba en el Studio, se recargaba la página y seguía
 * apareciendo el contenido viejo, sin ningún error que lo explicara. La única
 * salida era borrar `.next/cache/fetch-cache` a mano.
 *
 * En desarrollo se pide `no-store` y el problema desaparece. En producción no
 * cambia nada: mismo `force-cache`, mismas etiquetas, mismo webhook.
 *
 * POR QUÉ ACÁ Y NO EN CADA LLAMADA. Antes esto estaba repetido en 30 lugares
 * de 13 archivos, así que no había forma de cambiarlo en uno solo. Además la
 * etiqueta pasa a ser OBLIGATORIA: escribirla a mano en cada `fetch` hacía que
 * olvidarse de una no diera ningún error — solo dejaba una página que no se
 * actualizaba nunca al editar en el Studio, que es exactamente el tipo de bug
 * que nadie encuentra hasta que se queja el cliente.
 *
 * SOBRE `params`, QUE TIENE VALOR POR DEFECTO. Olvidarse de uno en una consulta
 * parametrizada compila, pero NO pasa desapercibido: se comprobó contra la API
 * y responde 400 con `param $slug referenced, but not provided`. Se llegó a
 * escribir acá un chequeo propio para avisar antes, y se sacó: duplicaba un
 * error que la plataforma ya da, y mejor —nombra el parámetro y devuelve la
 * consulta entera—. No hace falta volver a agregarlo.
 *
 * @param tags El tipo de documento del que depende la consulta. Varios cuando
 *   la consulta se arma con más de uno: la portada, por ejemplo, cambia al
 *   editar `homePage`, pero también al editar el evento que tiene destacado.
 */
export function fetchContent<T>(
  query: string,
  tags: SanityTag | SanityTag[],
  params: Record<string, unknown> = {},
): Promise<T> {
  if (isDevelopment) {
    // Sin `next.tags`: no hay nada que invalidar si no se guarda nada.
    return sanityClient.fetch<T>(query, params, { cache: "no-store" });
  }

  return sanityClient.fetch<T>(query, params, {
    cache: "force-cache",
    next: { tags: Array.isArray(tags) ? tags : [tags] },
  });
}
