import { defineField, defineType } from "sanity";

export const chaplaincyActivity = defineType({
  name: "chaplaincyActivity",
  title: "Actividad de capellanía",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      description:
        'Dónde está presente la capellanía, por ejemplo "Hospitales" o "Fuerzas policiales".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
      rows: 3,
      description: "Un párrafo corto que cuente en qué consiste.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Imagen",
      type: "image",
      // Opcional a propósito: permite dejar la actividad cargada mientras se
      // consigue una foto. Sin imagen la fila se dibuja solo con el texto, en
      // vez de mostrar un hueco.
      description:
        "Opcional. Una foto de referencia del lugar o de la actividad. Sin imagen, la actividad se muestra solo con el texto.",
      options: { hotspot: true },
    }),
    defineField({
      name: "imageAlt",
      title: "Texto alternativo de la imagen",
      type: "string",
      description: "Describe la imagen para lectores de pantalla y accesibilidad.",
      // Obligatorio SOLO si hay imagen: exigirlo siempre bloquearía las
      // actividades que todavía no tienen foto.
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const hasImage = Boolean(
            (context.document as { image?: unknown } | undefined)?.image,
          );

          if (!hasImage) return true;

          return value ? true : "Hace falta describir la imagen cargada.";
        }),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "description", media: "image" },
  },
});
