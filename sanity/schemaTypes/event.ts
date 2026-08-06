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
    defineField({
      name: "slug",
      title: "Dirección de la página",
      type: "slug",
      description:
        "Se genera sola a partir del título y después queda fija: si cambiara, se romperían los enlaces que ya se compartieron.",
      options: { source: "title", maxLength: 96 },
      // Se congela apenas tiene valor. La galería se comparte por link —
      // WhatsApp, redes — y una dirección que cambia deja esos links muertos
      // sin que nadie se entere.
      readOnly: ({ value }) => Boolean(value),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Galería de fotos",
      type: "array",
      description:
        "Fotos de la última vez que se hizo este evento. Si no cargás ninguna, la tarjeta no lleva a ningún lado.",
      of: [
        {
          type: "image",
          name: "galleryImage",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Texto alternativo",
              type: "string",
              // Opcional a propósito, a diferencia del resto del sitio: en una
              // galería de 20 fotos exigirlo garantiza que se llene con "foto".
              // Si falta, se usa el título del evento.
              description: "Opcional. Si lo dejás vacío se usa el título del evento.",
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "day", media: "image" },
  },
});
