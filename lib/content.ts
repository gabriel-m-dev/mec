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
