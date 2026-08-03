import { defineField, defineType } from "sanity";

export const worshipService = defineType({
  name: "worshipService",
  title: "Culto",
  type: "document",
  fields: [
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "detail",
      title: "Detalle",
      type: "string",
      description: "Ej. día y horario del culto.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "cta",
      title: "Texto del botón",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "detail" },
  },
});
