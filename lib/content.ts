export const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Quiénes somos", href: "/quienes-somos" },
  { label: "Ministerios", href: "/ministerios" },
  { label: "Capellanes", href: "/capellanes" },
  { label: "Cultos", href: "/cultos" },
  { label: "Eventos", href: "/eventos" },
  { label: "Noticias", href: "/noticias" },
  { label: "Contacto", href: "/contacto" },
];

export const aboutStats = [
  { label: "Años sirviendo", value: "15+" },
  { label: "Ciudades alcanzadas", value: "7" },
  { label: "Personas acompañadas", value: "1.8K" },
];

export const aboutValues = [
  {
    icon: "shield",
    title: "Fe",
    description:
      "Sostenemos cada decisión y cada paso comunitario en una confianza firme en la Palabra y en la fidelidad de Dios.",
  },
  {
    icon: "users",
    title: "Comunidad",
    description:
      "Creemos en vínculos reales: familias, células y equipos que se acompañan más allá del domingo.",
  },
  {
    icon: "serve",
    title: "Servicio",
    description:
      "Ponemos manos y tiempo al servicio del prójimo, dentro y fuera de nuestras puertas, con humildad y constancia.",
  },
] as const;

export const featureHighlights = [
  {
    icon: "users",
    label: "Miembros ministeriales",
    cta: "Conócelos",
    href: "/quienes-somos",
  },
  {
    icon: "podium",
    label: "Ministros",
    cta: "Ver ministros",
    href: "/ministerios",
  },
  {
    icon: "shield",
    label: "Capellanes",
    cta: "Conócelos",
    href: "/capellanes",
  },
  {
    icon: "map",
    label: "Lugar de encuentro",
    cta: "Ver lugar",
    href: "/cultos",
  },
] as const;
