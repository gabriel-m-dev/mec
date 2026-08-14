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
      name: "slug",
      title: "Dirección de la página",
      type: "slug",
      description:
        "Se genera sola a partir del título y después queda fija: si cambiara, se romperían los enlaces que ya se compartieron.",
      options: { source: "title", maxLength: 96 },
      // Mismo criterio que los eventos: se congela apenas tiene valor. Una
      // noticia se comparte por link —WhatsApp, redes— y una dirección que
      // cambia deja esos links muertos sin que nadie se entere.
      readOnly: ({ value }) => Boolean(value),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Resumen",
      type: "text",
      description:
        "El texto corto que se ve en la tarjeta de la lista y arriba de todo en la página de la noticia.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Texto de la noticia",
      type: "array",
      description:
        "El cuerpo completo. Se escribe como en un procesador de texto y se pueden intercalar fotos entre los párrafos. Si lo dejás vacío, la página muestra igual la portada, el título y el resumen.",
      of: [
        {
          type: "block",
          // Se acotan los estilos a propósito. Un menú con quince opciones
          // termina en una noticia con seis tamaños de título distintos: lo
          // que se ofrece es lo que se va a usar.
          styles: [
            { title: "Párrafo", value: "normal" },
            { title: "Título", value: "h2" },
            { title: "Subtítulo", value: "h3" },
            { title: "Cita", value: "blockquote" },
          ],
          lists: [
            { title: "Viñetas", value: "bullet" },
            { title: "Números", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Negrita", value: "strong" },
              { title: "Cursiva", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Enlace",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "Dirección",
                    validation: (Rule) =>
                      Rule.required().uri({
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          title: "Foto",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Texto alternativo",
              description:
                "Describe la foto para quien no puede verla. Si la dejás vacía, se usa el título de la noticia.",
            },
            {
              name: "caption",
              type: "string",
              title: "Epígrafe",
              description: "Opcional. Se muestra debajo de la foto.",
            },
          ],
        },
      ],
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
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "image" },
  },
});
