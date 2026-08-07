export const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Quiénes somos", href: "/quienes-somos" },
  { label: "The Chosen", href: "/the-chosen" },
  // El nombre visible es "Capellanía"; la ruta sigue siendo `/capellanes`
  // para no romper los enlaces ya compartidos.
  { label: "Capellanía", href: "/capellanes" },
  { label: "Cultos", href: "/cultos" },
  { label: "Eventos", href: "/eventos" },
  { label: "Noticias", href: "/noticias" },
  { label: "Contacto", href: "/contacto" },
];

/**
 * Los cuatro accesos rápidos del hero.
 *
 * Cada etiqueta NOMBRA la sección a la que lleva. Antes no era así y tres de
 * las cuatro mentían: "Ministros" llevaba a The Chosen —un grupo de chicos—,
 * "Lugar de encuentro" llevaba a Cultos, y "Miembros ministeriales" no decía
 * nada sobre /quienes-somos. Si la etiqueta no coincide con el destino, el
 * visitante toca a ciegas.
 */
export const featureHighlights = [
  {
    icon: "users",
    label: "Quiénes somos",
    cta: "Conocenos",
    href: "/quienes-somos",
  },
  {
    icon: "hands",
    label: "The Chosen",
    cta: "Ver el grupo",
    href: "/the-chosen",
  },
  {
    icon: "shield",
    label: "Capellanía",
    cta: "Conocela",
    href: "/capellanes",
  },
  {
    icon: "podium",
    label: "Cultos",
    cta: "Ver horarios",
    href: "/cultos",
  },
] as const;
