import { defineField, defineType } from "sanity";

/**
 * La persona a cargo de The Chosen. Es un singleton: hay una sola, y por eso
 * no se puede crear ni borrar desde el Studio (ver `SINGLETON_TYPES` en
 * `sanity.config.ts`). Cuando cambie el responsable se editan los campos, no
 * se crea un documento nuevo.
 */
export const chosenLeader = defineType({
  name: "chosenLeader",
  title: "Persona a cargo",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Rol",
      type: "string",
      description: 'Cómo se presenta, por ejemplo "Coordinadora general".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Presentación",
      type: "text",
      rows: 4,
      description: "Un párrafo corto que cuente quién es y desde cuándo acompaña al grupo.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Foto",
      type: "image",
      description:
        "Opcional. Sin foto, la tarjeta se muestra solo con el texto.",
      options: { hotspot: true },
    }),
    defineField({
      name: "imageAlt",
      title: "Texto alternativo de la foto",
      type: "string",
      description: "Describe la foto para lectores de pantalla y accesibilidad.",
      // Obligatorio solo si hay foto: exigirlo siempre bloquearía el
      // documento mientras se consigue la imagen.
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const hasImage = Boolean(
            (context.document as { image?: unknown } | undefined)?.image,
          );

          if (!hasImage) return true;

          return value ? true : "Hace falta describir la foto cargada.";
        }),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "image" },
  },
});
