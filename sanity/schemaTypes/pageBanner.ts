import {
  defineField,
  defineType,
  type ConditionalPropertyCallbackContext,
  type ValidationContext,
} from "sanity";

import {
  duplicatedSectionKeys,
  faqHeadingWithoutQuestions,
  questionsWithoutFaqHeading,
} from "./pageBannerValidation";

const PAGE_BANNER_ROUTE_OPTIONS = [
  { title: "Quiénes somos", value: "/quienes-somos" },
  { title: "Ministerios", value: "/ministerios" },
  { title: "Capellanes", value: "/capellanes" },
  { title: "Cultos", value: "/cultos" },
  { title: "Eventos", value: "/eventos" },
  { title: "Noticias", value: "/noticias" },
  { title: "Contacto", value: "/contacto" },
];

/** La única página que usa los bloques de abajo. */
const ABOUT_ROUTE = "/quienes-somos";

const VALUE_ICON_OPTIONS = [
  { title: "Escudo con cruz", value: "shield" },
  { title: "Personas", value: "users" },
  { title: "Manos que sirven", value: "serve" },
];

/**
 * Los bloques de `/quienes-somos` viven en `pageBanner` como campos
 * opcionales, así que sin esto aparecerían vacíos en las otras 6 páginas y el
 * cliente tendría que adivinar cuáles le corresponden.
 */
function hiddenUnlessAbout({ document }: ConditionalPropertyCallbackContext): boolean {
  return (document as { route?: string } | undefined)?.route !== ABOUT_ROUTE;
}

/**
 * El texto alternativo es obligatorio SOLO si se cargó la imagen: exigirlo
 * siempre bloquearía documentos que legítimamente no tienen esa imagen.
 */
function requiredWhenImagePresent(imageField: string) {
  return (alt: string | undefined, context: ValidationContext): true | string => {
    const parent = context.parent as Record<string, unknown> | undefined;
    return parent?.[imageField] && !alt ? "Requerido cuando hay una imagen" : true;
  };
}

const PAGE_SECTION_KEY_OPTIONS = [
  { title: "Principal", value: "main" },
  { title: "Valores", value: "values" },
  { title: "Preguntas frecuentes", value: "faq" },
];

export const pageBanner = defineType({
  name: "pageBanner",
  title: "Página",
  type: "document",
  fields: [
    defineField({
      name: "route",
      title: "Página",
      type: "string",
      description: "Página del sitio a la que pertenece este banner. Solo puede haber un banner por página.",
      options: { list: PAGE_BANNER_ROUTE_OPTIONS },
      validation: (Rule) =>
        Rule.required().custom(async (route, context) => {
          if (!route) return true;

          const { document, getClient } = context;
          const client = getClient({ apiVersion: "2025-05-30" });
          const id = document?._id.replace(/^drafts\./, "");
          const params = {
            draft: `drafts.${id}`,
            published: id,
            route,
          };
          const query = `*[_type == "pageBanner" && route == $route && !(_id in [$draft, $published])][0]._id`;

          try {
            const duplicateId = await client.fetch(query, params);

            return duplicateId
              ? "Ya existe un banner para esta página"
              : true;
          } catch {
            return true;
          }
        }),
    }),
    defineField({
      name: "eyebrow",
      title: "Antetítulo",
      type: "string",
      description: "Texto pequeño opcional que aparece sobre el título.",
    }),
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
    }),
    defineField({
      name: "image",
      title: "Imagen",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "imageAlt",
      title: "Texto alternativo de la imagen",
      type: "string",
      description: "Obligatorio solo si se cargó una imagen. Describe la imagen para accesibilidad.",
      validation: (Rule) =>
        Rule.custom((imageAlt, context) => {
          const document = context.document as { image?: unknown } | undefined;
          if (document?.image && !imageAlt) {
            return "Requerido cuando hay una imagen";
          }
          return true;
        }),
    }),
    defineField({
      name: "sections",
      title: "Secciones",
      type: "array",
      description: "Encabezados de las secciones de contenido de esta página.",
      // Cada página busca su encabezado con `.find(s => s.key === "...")`, así
      // que dos secciones con la misma "Sección" dejan a la segunda muerta: no
      // se muestra en ningún lado y no hay ninguna pista de por qué.
      validation: (Rule) =>
        Rule.custom((sections, context) => {
          const faqs = (context.document as { faqs?: unknown[] } | undefined)?.faqs;

          const orphanHeading = faqHeadingWithoutQuestions(sections, faqs);
          if (orphanHeading !== true) return orphanHeading;

          return duplicatedSectionKeys(sections, PAGE_SECTION_KEY_OPTIONS);
        }),
      of: [
        {
          type: "object",
          name: "pageSection",
          fields: [
            defineField({
              name: "key",
              title: "Sección",
              type: "string",
              description: "Qué sección de la página es.",
              options: { list: PAGE_SECTION_KEY_OPTIONS },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "eyebrow",
              title: "Antetítulo",
              type: "string",
              description: "Texto pequeño en mayúsculas que aparece sobre el título.",
            }),
            defineField({
              name: "title",
              title: "Título",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "copy",
              title: "Texto",
              type: "text",
              description: "Párrafo opcional debajo del título.",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "key" },
          },
        },
      ],
    }),
    // --- Bloques propios de /quienes-somos ---------------------------------
    // Viven en `pageBanner` y no en un tipo aparte para respetar la decisión
    // ya tomada de un documento por página. Son opcionales, así que las otras
    // 6 páginas simplemente no los usan, y `hidden` los saca de la vista para
    // que el cliente no vea campos que no le sirven.
    defineField({
      name: "introParagraphs",
      title: "Presentación",
      type: "array",
      description: "Párrafos de apertura. Cada elemento es un párrafo.",
      of: [{ type: "text", rows: 3 }],
      hidden: hiddenUnlessAbout,
    }),
    defineField({
      name: "introImage",
      title: "Imagen de la presentación",
      type: "image",
      options: { hotspot: true },
      hidden: hiddenUnlessAbout,
    }),
    defineField({
      name: "introImageAlt",
      title: "Texto alternativo de la imagen de presentación",
      type: "string",
      description: "Describe la imagen para quienes usan lectores de pantalla.",
      validation: (Rule) => Rule.custom(requiredWhenImagePresent("introImage")),
      hidden: hiddenUnlessAbout,
    }),
    defineField({
      name: "stats",
      title: "Cifras",
      type: "array",
      description: 'Las cifras destacadas, por ejemplo "15+ años sirviendo".',
      of: [
        {
          type: "object",
          name: "statItem",
          fields: [
            defineField({
              name: "value",
              title: "Cifra",
              type: "string",
              description: 'El número tal como se muestra: "15+", "1.8K".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Descripción",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
      hidden: hiddenUnlessAbout,
    }),
    defineField({
      name: "vision",
      title: "Visión",
      type: "object",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Antetítulo",
          type: "string",
          description: 'El texto chico en mayúsculas, hoy "Visión".',
        }),
        defineField({
          name: "body",
          title: "Texto",
          type: "text",
          rows: 4,
          validation: (Rule) => Rule.required(),
        }),
      ],
      hidden: hiddenUnlessAbout,
    }),
    defineField({
      name: "story",
      title: "Nuestra historia",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Antetítulo", type: "string" }),
        defineField({
          name: "title",
          title: "Título",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "paragraphs",
          title: "Párrafos",
          type: "array",
          of: [{ type: "text", rows: 4 }],
        }),
        defineField({
          name: "image",
          title: "Imagen",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "imageAlt",
          title: "Texto alternativo de la imagen",
          type: "string",
          validation: (Rule) => Rule.custom(requiredWhenImagePresent("image")),
        }),
      ],
      hidden: hiddenUnlessAbout,
    }),
    defineField({
      name: "values",
      title: "Valores",
      type: "array",
      description: "Las tarjetas de valores. El encabezado se edita en Secciones.",
      of: [
        {
          type: "object",
          name: "valueItem",
          fields: [
            defineField({
              name: "icon",
              title: "Ícono",
              type: "string",
              options: { list: VALUE_ICON_OPTIONS },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "title",
              title: "Título",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Descripción",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: "title", subtitle: "icon" } },
        },
      ],
      hidden: hiddenUnlessAbout,
    }),

    defineField({
      name: "faqs",
      title: "Preguntas frecuentes",
      type: "array",
      description:
        'Preguntas y respuestas que se muestran en esta página. Necesitan que exista una sección "Preguntas frecuentes" arriba: el bloque se muestra solo si están las dos cosas.',
      // Las preguntas y su encabezado viven en dos arrays separados, así que se
      // pueden desincronizar. La página exige los dos para mostrar el bloque —
      // sin este aviso, borrar el encabezado hace desaparecer preguntas
      // perfectamente cargadas y nada explica por qué.
      validation: (Rule) =>
        Rule.custom((faqs, context) => {
          const sections = (context.document as { sections?: unknown[] } | undefined)?.sections;
          return questionsWithoutFaqHeading(faqs, sections);
        }),
      of: [
        {
          type: "object",
          name: "faqItem",
          fields: [
            defineField({
              name: "question",
              title: "Pregunta",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "answer",
              title: "Respuesta",
              type: "text",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "question" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "route", media: "image" },
  },
});
