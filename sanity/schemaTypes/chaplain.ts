import { defineField, defineType } from "sanity";

export const chaplain = defineType({
  name: "chaplain",
  title: "Capellán",
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
      title: "Cargo",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Dirección de la página",
      type: "slug",
      description:
        "Se genera sola a partir del nombre y después queda fija: es la dirección que va en el QR de este capellán, así que si cambiara, el QR ya impreso dejaría de funcionar.",
      options: { source: "name", maxLength: 96 },
      // Mismo criterio que noticias y eventos: se congela apenas tiene valor.
      readOnly: ({ value }) => Boolean(value),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "badgeNumber",
      title: "Número de placa",
      type: "string",
      description:
        "El número de la credencial de capellán, tal como figura en la placa. Si todavía no lo tenés a mano, dejalo vacío: la tarjeta simplemente no lo muestra.",
      // Es TEXTO y no número a propósito: un número descarta los ceros a la
      // izquierda —"0042" se guardaría como 42— y no admite guiones ni letras,
      // que estas credenciales suelen tener. Acá no se hacen cuentas con el
      // valor, se muestra tal como lo escribieron.
      //
      // Opcional para no trabar el documento: los capellanes ya cargados no lo
      // tienen, y exigirlo dejaría sus fichas sin poder guardarse hasta
      // conseguir el dato de cada uno.
    }),
    defineField({
      name: "email",
      title: "Gmail",
      type: "email",
      description:
        "Opcional. Se muestra en la ficha del capellán. Sin dato, esa línea no se dibuja.",
    }),
    defineField({
      name: "phone",
      title: "Teléfono",
      type: "string",
      description:
        "Opcional. Tal como se quiere mostrar (con espacios o guiones). Sin dato, esa línea no se dibuja.",
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
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "image" },
  },
});
