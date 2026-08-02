export const homePage = {
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    { name: "heroTitle", title: "Hero title", type: "string" },
    { name: "heroSubtitle", title: "Hero subtitle", type: "text" },
    {
      name: "heroBackground",
      title: "Hero background",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "featuredEvent",
      title: "Featured event",
      type: "object",
      fields: [
        { name: "title", title: "Title", type: "string" },
        { name: "date", title: "Date", type: "string" },
        { name: "location", title: "Location", type: "string" },
      ],
    },
  ],
};
