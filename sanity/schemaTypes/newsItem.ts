import { defineField, defineType } from "sanity";

export const newsItem = defineType({
  name: "newsItem",
  title: "Noticia",
  type: "document",
  fields: [
    defineField({
      name: "category",
      title: "Categoría",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Resumen",
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
    select: { title: "title", subtitle: "category", media: "image" },
  },
});
