import { defineField, defineType } from "sanity";

const SOCIAL_ICON_OPTIONS = [
  { title: "YouTube", value: "youtube" },
  { title: "Facebook", value: "facebook" },
  { title: "Instagram", value: "instagram" },
  { title: "Sitio web (genérico)", value: "globe" },
];

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Datos de la iglesia",
  type: "document",
  fields: [
    defineField({
      name: "address",
      title: "Dirección",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "schedule",
      title: "Horario",
      type: "text",
      description: "Horario de cultos y actividades, tal como se muestra en el sitio.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "socialLinks",
      title: "Redes sociales",
      type: "array",
      description: "Enlaces a redes sociales que aparecen en el pie de página.",
      of: [
        {
          type: "object",
          name: "socialLink",
          fields: [
            defineField({
              name: "name",
              title: "Nombre",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "href",
              title: "Enlace",
              type: "url",
              validation: (Rule) =>
                Rule.required().uri({ scheme: ["http", "https"] }),
            }),
            defineField({
              name: "icon",
              title: "Ícono",
              type: "string",
              description: "Debe coincidir con el ícono disponible en el sitio.",
              options: { list: SOCIAL_ICON_OPTIONS },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "icon" },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { subtitle: "address" },
    prepare({ subtitle }) {
      return {
        title: "Datos de la iglesia",
        subtitle,
      };
    },
  },
});
