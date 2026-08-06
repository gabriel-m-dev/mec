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
      description: 'Qué es la actividad, por ejemplo "Visitas al hospital".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "day",
      title: "Día",
      type: "string",
      // Mismo criterio que `event.day`: etiqueta y no fecha. La capellanía
      // trabaja con rutinas que se repiten ("Martes", "Primer sábado del
      // mes"), no con una fecha del calendario.
      description: 'Etiqueta del día (ej. "Martes" o "Primer sábado del mes"), no una fecha.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "time",
      title: "Horario",
      type: "string",
      // Texto libre por el mismo motivo que en los eventos: hace falta poder
      // escribir "10 hs", "de 15 a 18" o "a convenir" sin pelearse con un
      // formato que después no entra en los casos reales.
      description: 'Opcional. Por ejemplo "10 hs", "de 15 a 18" o "a convenir".',
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
      rows: 3,
      description: "Un párrafo corto: en la tarjeta se muestra recortado.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Imagen",
      type: "image",
      description: "Una foto de referencia de la actividad.",
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
    select: { title: "name", day: "day", time: "time", media: "image" },
    prepare({ title, day, time, media }) {
      return {
        title,
        // Igual que en los eventos: día y horario juntos en la misma línea,
        // para reconocer la actividad desde la lista sin abrirla.
        subtitle: [day, time].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
