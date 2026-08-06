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
          S.documentTypeList("pageBanner").title("Páginas"),
        ),
      S.divider(),
      ...COLLECTIONS.map(({ type, title }) =>
        S.listItem()
          .id(type)
          .title(title)
          .child(S.documentTypeList(type).title(title)),
      ),
    ]);
