import { defineField, defineType } from "sanity";

/**
 * Una actividad de The Chosen.
 *
 * "Recientes" y "próximas" son el MISMO tipo con un campo que las separa, y
 * no dos tipos distintos: se ven igual, se cargan igual, y cuando una
 * actividad próxima ya pasó se corrige un campo en vez de borrarla de una
 * lista y volver a cargarla en otra.
 */

export const CHOSEN_ACTIVITY_WHEN_OPTIONS = [
  { title: "Reciente — ya pasó", value: "recent" },
  { title: "Próxima — todavía no pasó", value: "upcoming" },
];

export const chosenActivity = defineType({
  name: "chosenActivity",
  title: "Actividad de The Chosen",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      description: 'Cómo se llama la actividad, por ejemplo "Día del niño".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "when",
      title: "¿Ya pasó o está por venir?",
      type: "string",
      description:
        "Decide en qué lista aparece. Cuando una actividad próxima ya sucedió, cambiá este campo a «Reciente».",
      options: { list: CHOSEN_ACTIVITY_WHEN_OPTIONS, layout: "radio" },
      initialValue: "upcoming",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Fecha",
      type: "string",
      // Texto libre, mismo criterio que en los eventos: hace falta poder
      // escribir "Agosto", "Sábado 16" o "Vacaciones de invierno" sin
      // pelearse con un formato que después no entra en los casos reales.
      description: 'Opcional y en texto libre: "Agosto", "Sábado 16", "Vacaciones de invierno".',
    }),
    defineField({
      name: "image",
      title: "Imagen",
      type: "image",
      description: "La foto que se ve en la grilla.",
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
    select: { title: "title", when: "when", date: "date", media: "image" },
    prepare({ title, when, date, media }) {
      const bucket = when === "recent" ? "Reciente" : "Próxima";

      return {
        title,
        // El estado va en la lista para poder ordenarlas de un vistazo sin
        // abrir cada una.
        subtitle: [bucket, date].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
