/**
 * Snapshot histórico congelado de los 7 `pageBanner` y sus secciones/FAQs.
 *
 * Este archivo es la ÚNICA fuente de estos literales — `scripts/seed-sanity.ts`
 * (seed completo, `createOrReplace`) y `scripts/migrate-page-sections.ts`
 * (migración acotada, `patch` solo de `sections`/`faqs`) importan de acá en
 * vez de mantener cada uno su propia copia, para que el contenido no pueda
 * divergir entre los dos scripts.
 *
 * NO editar estos literales para reflejar cambios hechos por el cliente en
 * el Studio — el dataset vivo es la fuente de verdad ahora, esto es solo el
 * punto de partida histórico transcripto a mano desde el código fuente
 * original de cada `app/(site)/*\/page.tsx`.
 */

import type { Faq, PageSection } from "../sanity/lib/types";

export interface BannerSeed {
  route: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  sections?: PageSection[];
  faqs?: Faq[];
}

// Las 4 FAQs mostradas en /cultos — transcriptas tal cual del const `faqs`
// que antes vivía al principio de app/(site)/cultos/page.tsx, antes de que
// este contenido se mudara a pageBanner.faqs. Orden preservado.
export const CULTOS_FAQS: Faq[] = [
  {
    question: "¿Necesito registrarme para asistir?",
    answer:
      "No es obligatorio. Podés llegar directamente a cualquiera de nuestros cultos; si querés que te reservemos un lugar en un evento especial, avisanos por contacto.",
  },
  {
    question: "¿Hay actividades para niños durante el culto?",
    answer:
      "Sí, contamos con espacio de niños y familias durante el culto de domingo, con material acorde a cada edad y un equipo de voluntarios a cargo.",
  },
  {
    question: "¿Cómo llego en transporte público?",
    answer:
      "El auditorio se encuentra a pocas cuadras de las principales líneas de colectivo del centro, con parada a menos de 5 minutos caminando.",
  },
  {
    question: "¿Puedo participar solo de la transmisión en vivo?",
    answer:
      "Por supuesto. Muchas personas de nuestra comunidad se conectan cada semana por YouTube o Facebook Live y participan del chat y la oración en línea.",
  },
];

// Los 7 page banners no están en lib/content.ts — eran literales hardcodeados
// dentro de cada llamada a <PageHeader/> en app/(site)/*/page.tsx.
// Transcriptos acá a mano desde el código fuente original.
//
// `sections` está transcripto igual, a mano, desde los literales
// <SectionHeading/> de cada página (feature: encabezados de sección
// editables). Home y /contacto no tienen <SectionHeading/> en su página, así
// que no tienen ninguna.
export const PAGE_BANNERS: BannerSeed[] = [
  {
    route: "/quienes-somos",
    eyebrow: "Quiénes somos",
    title: "Una comunidad que adora, aprende y sirve junta",
    description:
      "Conocé la historia, la convicción y los valores que sostienen cada encuentro, cada ministerio y cada gesto de cuidado en MEC.",
    image: "/images/pages/quienes-somos-banner.jpg",
    imageAlt: "Congregación reunida durante un culto",
    sections: [
      {
        key: "main",
        eyebrow: "Quiénes somos",
        title: "Una iglesia con estética refinada y convicción espiritual",
        copy: "MEC une excelencia visual, profundidad bíblica y un lenguaje contemporáneo para conectar con personas y familias que buscan dirección, comunidad y propósito.",
      },
      {
        key: "values",
        eyebrow: "Nuestros valores",
        title: "Lo que no negociamos, sin importar cuánto crezcamos",
      },
    ],
  },
  {
    route: "/ministerios",
    eyebrow: "Ministerios",
    title: "Equipos que convierten la fe en acción concreta",
    description:
      "Desde la adoración hasta el cuidado de niños, cada ministerio es un espacio para poner tus dones al servicio de la comunidad.",
    image: "/images/pages/ministerios-banner.jpg",
    imageAlt: "Equipo de voluntarios sirviendo juntos",
    sections: [
      {
        key: "main",
        eyebrow: "Ministerios",
        title: "Equipos diseñados para servir con precisión y calidez",
        copy: "Cada ministerio está pensado como una puerta de entrada al discipulado, la acción y el cuidado mutuo.",
      },
    ],
  },
  {
    route: "/capellanes",
    eyebrow: "Capellanes",
    title: "Un equipo preparado para escuchar antes de hablar",
    description:
      "Consejería, oración y acompañamiento para atravesar procesos personales, familiares e institucionales con respaldo real.",
    image: "/images/pages/capellanes-banner.jpg",
    imageAlt: "Sesión de consejería y acompañamiento pastoral",
    sections: [
      {
        key: "main",
        eyebrow: "Capellanes",
        title: "Acompañamiento espiritual con criterio y sensibilidad",
        copy: "Un equipo preparado para cuidar, escuchar y orientar procesos personales, familiares e institucionales.",
      },
    ],
  },
  {
    route: "/cultos",
    eyebrow: "Cultos",
    title: "Un mismo mensaje, presencial y en vivo",
    description:
      "Sumate a nuestros encuentros semanales en el auditorio o desde donde estés, con la misma calidez y el mismo propósito.",
    image: "/images/pages/cultos-banner.jpg",
    imageAlt: "Multitud en un culto con luces de escenario",
    sections: [
      {
        key: "main",
        eyebrow: "Cultos presenciales y online",
        title:
          "Una experiencia unificada para quienes están cerca y para quienes se conectan a distancia",
        copy: "La misma esencia ministerial, con múltiples formatos para reunir, transmitir y servir.",
      },
      {
        key: "faq",
        eyebrow: "Preguntas frecuentes",
        title: "Antes de tu primera visita",
        copy: "Algunas respuestas rápidas para que llegues sin dudas al auditorio.",
      },
    ],
    faqs: CULTOS_FAQS,
  },
  {
    route: "/eventos",
    eyebrow: "Eventos",
    title: "Encuentros para vivir la fe más allá del domingo",
    description:
      "Vigilias, conferencias, retiros y jornadas de servicio pensadas para distintas etapas de tu caminar con Dios.",
    image: "/images/pages/eventos-banner.jpg",
    imageAlt: "Orador presentando ante una audiencia en un evento",
    sections: [
      {
        key: "main",
        eyebrow: "Eventos",
        title: "Fechas clave para conectar, crecer y servir",
        copy: "Una agenda clara que ayuda a la comunidad a planificar su participación.",
      },
    ],
  },
  {
    route: "/noticias",
    eyebrow: "Noticias",
    title: "Lo que está pasando en nuestra comunidad",
    description:
      "Alianzas, celebraciones y novedades institucionales para que ninguna actualización te tome por sorpresa.",
    image: "/images/pages/noticias-banner.jpg",
    imageAlt: "Primer plano de un periódico sobre una mesa",
    sections: [
      {
        key: "main",
        eyebrow: "Noticias",
        title: "Contenido institucional con ritmo editorial",
        copy: "Actualizaciones, iniciativas y cobertura de comunidad para mantener la conexión viva.",
      },
    ],
  },
  {
    route: "/contacto",
    eyebrow: "Contacto",
    title: "Estamos para recibirte, escribinos cuando quieras",
    description:
      "Contanos qué necesitás — una pregunta, un pedido de oración o ganas de conocernos — y te respondemos a la brevedad.",
    image: "/images/pages/contacto-banner.jpg",
    imageAlt: "Recepción con personas conversando en un lobby luminoso",
  },
];
