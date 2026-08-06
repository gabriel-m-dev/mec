import { defineField, defineType } from "sanity";

/**
 * El contenido propio de la portada. Hoy solo el carrusel de destacados.
 *
 * Es un tipo aparte y no un `pageBanner` porque la portada no tiene banner:
 * no dibuja `<PageHeader>`, así que heredar `title`, `description` e `image`
 * —con `title` obligatorio— la obligaría a llenar campos que nunca se ven.
 *
 * Documento único: se protege de crear/borrar en `sanity.config.ts`.
 */
export const homePage = defineType({
  name: "homePage",
  title: "Inicio",
  type: "document",
  fields: [
    defineField({
      name: "live",
      title: "Transmisión en vivo",
      type: "object",
      description:
        "Aparece siempre como primera diapositiva del carrusel. Cambiá el enlace cuando tengas la dirección real de la transmisión.",
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
          rows: 3,
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "url",
          title: "Enlace de la transmisión",
          type: "url",
          description: "La dirección de YouTube donde se ve el culto en vivo.",
          validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
        }),
        defineField({
          name: "cta",
          title: "Texto del botón",
          type: "string",
          description: 'Por ejemplo "Ver en vivo".',
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
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: "featured",
      title: "Destacados del carrusel",
      type: "array",
      description:
        "Elegí hasta 5 eventos o noticias para mostrar en la portada. Se usan la foto, el título y la descripción que ya tiene cada uno: si los editás allá, acá se actualizan solos.",
      of: [{ type: "reference", to: [{ type: "event" }, { type: "newsItem" }] }],
      validation: (Rule) =>
        Rule.max(5)
          .unique()
          .custom((featured) => {
            // Sanity ya rechaza referencias repetidas con `.unique()`, pero el
            // mensaje por defecto habla de "valores duplicados" y no dice qué
            // hacer. Este aclara la consecuencia real.
            if (!Array.isArray(featured)) return true;
            return featured.length > 5
              ? "El carrusel muestra 5 como máximo; sacá los que sobren."
              : true;
          }),
    }),
  ],
  preview: {
    select: { featured: "featured" },
    prepare: ({ featured }) => ({
      title: "Inicio",
      subtitle: `${Array.isArray(featured) ? featured.length : 0} destacado(s) en el carrusel`,
    }),
  },
});
