import { defineField, defineType } from "sanity";

const PAGE_BANNER_ROUTE_OPTIONS = [
  { title: "Quiénes somos", value: "/quienes-somos" },
  { title: "Ministerios", value: "/ministerios" },
  { title: "Capellanes", value: "/capellanes" },
  { title: "Cultos", value: "/cultos" },
  { title: "Eventos", value: "/eventos" },
  { title: "Noticias", value: "/noticias" },
  { title: "Contacto", value: "/contacto" },
];

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
    defineField({
      name: "faqs",
      title: "Preguntas frecuentes",
      type: "array",
      description: "Preguntas y respuestas que se muestran en esta página.",
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
