import type { StructureResolver } from "sanity/structure";

/**
 * El menú del Studio espeja el menú del sitio: una entrada por sección, en el
 * mismo orden que `navItems` en `lib/content.ts`.
 *
 * La alternativa —agrupar por tipo de dato, "Páginas" por un lado y las
 * colecciones por otro— parte cada sección en dos ramas del menú y repite los
 * mismos cinco nombres en las dos. El cliente tendría que saber que el título
 * de /ministerios se edita en un lugar y los ministerios en otro, y no hay nada
 * en la interfaz que se lo sugiera.
 *
 * `pageId` tiene que coincidir con el `_id` del documento en el dataset, que el
 * seed escribe como `pageBanner-<slug de la ruta>`.
 */
const SECTIONS = [
  {
    title: "Quiénes somos",
    pageId: "pageBanner-quienes-somos",
  },
  {
    title: "Ministerios",
    pageId: "pageBanner-ministerios",
    collection: { type: "ministry", title: "Lista de ministerios" },
  },
  {
    title: "Capellanes",
    pageId: "pageBanner-capellanes",
    collection: { type: "chaplain", title: "Lista de capellanes" },
  },
  {
    title: "Cultos",
    pageId: "pageBanner-cultos",
    collection: { type: "worshipService", title: "Lista de cultos" },
  },
  {
    title: "Eventos",
    pageId: "pageBanner-eventos",
    collection: { type: "event", title: "Lista de eventos" },
  },
  {
    title: "Noticias",
    pageId: "pageBanner-noticias",
    collection: { type: "newsItem", title: "Lista de noticias" },
  },
  {
    title: "Contacto",
    pageId: "pageBanner-contacto",
  },
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
      ...SECTIONS.map((section) => {
        const pageDocument = S.document()
          .schemaType("pageBanner")
          .documentId(section.pageId)
          .title(section.title);

        // Las secciones sin colección —Quiénes somos y Contacto— entran derecho
        // al documento: un submenú de un solo ítem es un click de más que no
        // informa nada.
        if (!("collection" in section)) {
          return S.listItem()
            .id(section.pageId)
            .title(section.title)
            .child(pageDocument);
        }

        const { type, title } = section.collection;

        return S.listItem()
          .id(section.pageId)
          .title(section.title)
          .child(
            S.list()
              .title(section.title)
              .items([
                S.listItem()
                  .id("page")
                  .title("Textos de la página")
                  .child(pageDocument),
                S.listItem()
                  .id(type)
                  .title(title)
                  .child(S.documentTypeList(type).title(title)),
              ]),
          );
      }),
    ]);
