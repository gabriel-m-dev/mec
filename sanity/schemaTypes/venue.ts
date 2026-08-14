import { defineField, defineType } from "sanity";

export const venue = defineType({
  name: "venue",
  title: "Salón / Sede",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre del salón",
      type: "string",
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
      name: "alt",
      title: "Texto alternativo de la imagen",
      type: "string",
      description: "Describe la imagen para lectores de pantalla y accesibilidad.",
    }),
  ],
  preview: {
    select: { title: "name", media: "image" },
  },
});
