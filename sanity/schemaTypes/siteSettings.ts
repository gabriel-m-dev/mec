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
      name: "phone",
      title: "Teléfono",
      type: "string",
      description:
        "Se muestra en la página de contacto. Escribilo como querés que se lea, por ejemplo (011) 4444-5555. Si lo dejás vacío, no aparece.",
      // A diferencia del de WhatsApp, este NO se normaliza a dígitos pelados:
      // se muestra tal cual se escribe, porque es un número para leer y
      // marcar. Solo se controla que tenga suficientes dígitos para ser uno.
      validation: (Rule) =>
        Rule.custom((value?: string) => {
          if (!value) return true;

          const digits = value.replace(/\D/g, "");

          return (
            (digits.length >= 6 && digits.length <= 15) ||
            "Tiene que ser un teléfono: entre 6 y 15 dígitos. Podés usar espacios, guiones y paréntesis."
          );
        }),
    }),
    defineField({
      name: "email",
      title: "Correo electrónico",
      type: "string",
      description:
        "Se muestra en la página de contacto y es la dirección del botón «Escribir al equipo». Si lo dejás vacío, ese botón no aparece.",
      validation: (Rule) =>
        Rule.email().error("Escribí una dirección de correo válida."),
    }),
    defineField({
      name: "whatsapp",
      title: "WhatsApp",
      type: "object",
      description:
        "Botón flotante de WhatsApp. Si dejás el número vacío, el botón no aparece en el sitio.",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "phone",
          title: "Número",
          type: "string",
          description:
            "Con código de país y solo números: sin +, sin espacios y sin guiones. En Argentina es 549, la característica SIN el 0 y el número SIN el 15. Ejemplo: para el (011) 15-2233-4455 se escribe 5491122334455.",
          // Un número mal escrito no rompe nada visible: el botón aparece igual
          // y el enlace lleva a un chat que no existe. Se valida acá porque es
          // el único lugar donde alguien lo va a ver antes de publicarlo.
          validation: (Rule) =>
            Rule.custom((value?: string) => {
              // Vacío es válido a propósito: es la forma de apagar el botón.
              if (!value) return true;

              return (
                /^[0-9]{8,15}$/.test(value) ||
                "Solo números, entre 8 y 15 dígitos. Sin +, sin espacios, sin guiones y sin el 15."
              );
            }),
        }),
        defineField({
          name: "message",
          title: "Mensaje inicial",
          type: "string",
          description:
            "Texto que aparece ya escrito en el chat cuando alguien toca el botón. Opcional.",
        }),
      ],
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
