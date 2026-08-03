import { defineField, defineType } from "sanity";

export const event = defineType({
  name: "event",
  title: "Evento",
  type: "document",
  fields: [
    defineField({
      name: "day",
      title: "Día",
      type: "string",
      description: 'Etiqueta del día (ej. "Viernes"), no una fecha.',
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Imagen",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "imageAlt",
      title: "Texto alternativo de la imagen",
      type: "string",
      description: "Describe la imagen para lectores de pantalla y accesibilidad.",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "day", media: "image" },
  },
});
