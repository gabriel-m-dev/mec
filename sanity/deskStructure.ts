import type { StructureResolver } from "sanity/structure";

/**
 * El menú del Studio espeja el menú del sitio: una entrada por sección, en el
 * mismo orden que `navItems` en `lib/content.ts`.
 *
 * La alternativa —agrupar por tipo de dato, "Páginas" por un lado y las
 * colecciones por otro— parte cada sección en dos ramas del menú y repite los
 * mismos nombres en las dos. El cliente tendría que saber que el título de una
 * página se edita en un lugar y su contenido en otro, y no hay nada en la
 * interfaz que se lo sugiera.
 *
 * `pageId` tiene que coincidir con el `_id` del documento en el dataset, que el
 * seed escribe como `pageBanner-<slug de la ruta>`.
 */

/** Un documento único dentro de la sección, por ejemplo la persona a cargo. */
type SectionSingleton = { type: string; id: string; title: string };

/** Una lista de documentos del mismo tipo, por ejemplo las actividades. */
type SectionCollection = { type: string; title: string };

type Section = {
  title: string;
  pageId: string;
  singletons?: readonly SectionSingleton[];
  collections?: readonly SectionCollection[];
};

// Tipado explícito y no `as const`: con `as const` cada sección tiene una
// forma distinta y TypeScript no logra estrechar `section.singletons` cuando
// solo una de ellas lo declara.
const SECTIONS: readonly Section[] = [
  {
    title: "Quiénes somos",
    pageId: "pageBanner-quienes-somos",
  },
  {
    title: "The Chosen",
    // El `_id` sigue siendo el viejo aunque la ruta ahora sea `/the-chosen`:
    // se migró el campo `route` del documento en vez de crear uno nuevo, para
    // no perder la imagen ni los textos que la iglesia ya había cargado.
    pageId: "pageBanner-ministerios",
    singletons: [
      { type: "chosenLeader", id: "chosenLeader", title: "Persona a cargo" },
    ],
    collections: [{ type: "chosenActivity", title: "Actividades" }],
  },
  {
    title: "Capellanía",
    pageId: "pageBanner-capellanes",
    // La única sección con dos colecciones. El orden espeja el de la página:
    // primero las actividades, después las personas.
    collections: [
      { type: "chaplaincyActivity", title: "Actividades de capellanía" },
      { type: "chaplain", title: "Lista de capellanes" },
    ],
  },
  {
    title: "Cultos",
    pageId: "pageBanner-cultos",
    collections: [{ type: "worshipService", title: "Lista de cultos" }],
  },
  {
    title: "Eventos",
    pageId: "pageBanner-eventos",
    collections: [{ type: "event", title: "Lista de eventos" }],
  },
  {
    title: "Noticias",
    pageId: "pageBanner-noticias",
    collections: [{ type: "newsItem", title: "Lista de noticias" }],
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

        // Las secciones sin nada más —Quiénes somos y Contacto— entran derecho
        // al documento: un submenú de un solo ítem es un click de más que no
        // informa nada.
        const singletons = section.singletons ?? [];
        const collections = section.collections ?? [];

        if (singletons.length === 0 && collections.length === 0) {
          return S.listItem()
            .id(section.pageId)
            .title(section.title)
            .child(pageDocument);
        }

        // Los singletons van antes que las listas: en The Chosen la persona a
        // cargo se edita una vez y las actividades se cargan seguido, así que
        // el orden del menú espeja el de la página, no la frecuencia de uso.
        const singletonItems = singletons.map(({ type, id, title }) =>
          S.listItem()
            .id(id)
            .title(title)
            .child(S.document().schemaType(type).documentId(id).title(title)),
        );

        const collectionItems = collections.map(({ type, title }) =>
          S.listItem()
            .id(type)
            .title(title)
            .child(S.documentTypeList(type).title(title)),
        );

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
                ...singletonItems,
                ...collectionItems,
              ]),
          );
      }),
    ]);
