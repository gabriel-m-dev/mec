import type { StructureResolver } from "sanity/structure";

// El título del schema es singular porque nombra un documento ("Nuevo Ministerio").
// La entrada del menú apunta a una lista, así que va en plural.
const COLLECTIONS = [
  { type: "ministry", title: "Ministerios" },
  { type: "chaplain", title: "Capellanes" },
  { type: "worshipService", title: "Cultos" },
  { type: "event", title: "Eventos" },
  { type: "newsItem", title: "Noticias" },
] as const;

/**
 * Las 7 páginas del sitio, en el orden del menú de navegación.
 *
 * Van una por una y no como `S.documentTypeList("pageBanner")` porque el
 * conjunto es CERRADO: hay exactamente una página por ruta y no existe una
 * octava. Una lista de tipo trae el botón "Crear nuevo documento", que acá solo
 * puede producir documentos inservibles — y como `pageBanner` tiene la acción
 * `delete` sacada en `sanity.config.ts`, después no había forma de borrarlos.
 *
 * De paso, entrar por el nombre de la página ("Cultos") en vez de por el título
 * del banner ("Un mismo mensaje, presencial y en vivo") dice mucho mejor qué se
 * está editando.
 *
 * `id` tiene que coincidir con el `_id` del documento en el dataset, que el
 * seed escribe como `pageBanner-<slug de la ruta>`.
 */
const PAGES = [
  { id: "pageBanner-quienes-somos", title: "Quiénes somos" },
  { id: "pageBanner-ministerios", title: "Ministerios" },
  { id: "pageBanner-capellanes", title: "Capellanes" },
  { id: "pageBanner-cultos", title: "Cultos" },
  { id: "pageBanner-eventos", title: "Eventos" },
  { id: "pageBanner-noticias", title: "Noticias" },
  { id: "pageBanner-contacto", title: "Contacto" },
] as const;

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      S.listItem()
        .id("homePage")
        .title("Inicio")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      S.listItem()
        .id("siteSettings")
        .title("Datos de la iglesia")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.listItem()
        .id("venue")
        .title("Salón / Sede")
        .child(S.document().schemaType("venue").documentId("venue")),
      S.divider(),
      S.listItem()
        .id("pageBanner")
        .title("Páginas")
        .child(
          S.list()
            .title("Páginas")
            .items(
              PAGES.map(({ id, title }) =>
                S.listItem()
                  .id(id)
                  .title(title)
                  .child(
                    S.document()
                      .schemaType("pageBanner")
                      .documentId(id)
                      .title(title),
                  ),
              ),
            ),
        ),
      S.divider(),
      ...COLLECTIONS.map(({ type, title }) =>
        S.listItem()
          .id(type)
          .title(title)
          .child(S.documentTypeList(type).title(title)),
      ),
    ]);
