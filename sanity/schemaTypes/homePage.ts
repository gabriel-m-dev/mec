import { defineField, defineType } from "sanity";
import {
  HERO_DESKTOP_SPEC,
  HERO_MOBILE_SPEC,
  formatDimensions,
  heroImageIssue,
} from "./heroImageValidation";

/**
 * El contenido propio de la portada: la imagen de fondo grande y el carrusel
 * de destacados.
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
      name: "hero",
      title: "Imagen de portada",
      type: "object",
      description:
        "El fondo grande que se ve al entrar al sitio, detrás del nombre de la iglesia. Son DOS imágenes distintas y conviene cargar las dos: la pantalla de una computadora es apaisada y la de un celular es parada, así que la misma foto no puede servir para las dos sin recortarse mal. Si dejás alguna vacía, se sigue usando la que está puesta hoy.",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "desktopImage",
          title: "Imagen para computadora (apaisada)",
          type: "image",
          description: `Horizontal. Subila de ${formatDimensions(
            HERO_DESKTOP_SPEC.recommended,
          )} píxeles, que es la medida ideal; el mínimo es ${formatDimensions(
            HERO_DESKTOP_SPEC.minimum,
          )}. Más chica que eso se ve borrosa, porque ocupa la pantalla entera. Usá el recuadro de recorte para marcar qué parte NO se puede perder: en pantallas muy anchas o muy altas el resto se recorta solo.`,
          options: { hotspot: true },
          validation: (Rule) =>
            Rule.warning().custom((value) =>
              heroImageIssue(value, HERO_DESKTOP_SPEC),
            ),
        }),
        defineField({
          name: "mobileImage",
          title: "Imagen para celular (parada)",
          type: "image",
          description: `Vertical. Subila de ${formatDimensions(
            HERO_MOBILE_SPEC.recommended,
          )} píxeles, que es la medida ideal; el mínimo es ${formatDimensions(
            HERO_MOBILE_SPEC.minimum,
          )}. Tiene que ser una imagen PARADA: si subís acá la misma que en computadora, en el celular se le van a recortar los costados y puede quedar cortada justo lo importante.`,
          options: { hotspot: true },
          validation: (Rule) =>
            Rule.warning().custom((value) =>
              heroImageIssue(value, HERO_MOBILE_SPEC),
            ),
        }),
      ],
    }),
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
