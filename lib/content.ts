export const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Quiénes somos", href: "/quienes-somos" },
  { label: "Ministerios", href: "/ministerios" },
  // El nombre visible es "Capellanía"; la ruta sigue siendo `/capellanes`
  // para no romper los enlaces ya compartidos.
  { label: "Capellanía", href: "/capellanes" },
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
    label: "Capellanía",
    cta: "Conócela",
    href: "/capellanes",
  },
  {
    icon: "map",
    label: "Lugar de encuentro",
    cta: "Ver lugar",
    href: "/cultos",
  },
] as const;
