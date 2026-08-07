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
      // escribir "29 de agosto", "Sábado 16" o "Vacaciones de invierno" sin
      // pelearse con un formato que después no entra en los casos reales.
      //
      // Obligatoria: una actividad sin fecha no le dice al visitante si ya
      // pasó o si todavía puede ir, que es lo único que necesita saber.
      description: 'En texto libre: "29 de agosto", "Sábado 16", "Vacaciones de invierno".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "time",
      title: "Horario",
      type: "string",
      description: 'Opcional. Por ejemplo "de 12 a 17 hs" o "15 hs".',
    }),
    defineField({
      name: "place",
      title: "Lugar",
      type: "string",
      description:
        "Opcional. Solo si la actividad NO es en la iglesia; si es acá, no hace falta repetirlo.",
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
    defineField({
      name: "slug",
      title: "Dirección de la página",
      type: "slug",
      description:
        "Se genera sola a partir del título y después queda fija: si cambiara, se romperían los enlaces que ya se compartieron.",
      options: { source: "title", maxLength: 96 },
      // Se congela apenas tiene valor, igual que en los eventos: la galería se
      // comparte por WhatsApp y una dirección que cambia deja esos links
      // muertos sin que nadie se entere.
      readOnly: ({ value }) => Boolean(value),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Galería de fotos",
      type: "array",
      description:
        "Fotos de la actividad. Si no cargás ninguna, la tarjeta no lleva a ningún lado.",
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
              // Si falta, se usa el título de la actividad.
              description: "Opcional. Si lo dejás vacío se usa el título de la actividad.",
            }),
          ],
        },
      ],
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
