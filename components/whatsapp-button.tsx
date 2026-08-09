import { WhatsAppIcon } from "@/components/contact-icons";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { fetchContent } from "@/sanity/lib/fetch";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import type { SiteSettings } from "@/sanity/lib/types";

/**
 * Botón flotante de WhatsApp, presente en todas las páginas del sitio.
 *
 * Es un componente de servidor a propósito: es un enlace, no necesita estado
 * ni animación, y así no suma un solo byte de JavaScript al cliente. El resto
 * del sitio usa framer-motion, pero un botón de contacto tiene que estar
 * disponible apenas pinta la página, no después de hidratar.
 *
 * El número sale de `siteSettings`, igual que las redes del pie. Sin número
 * cargado no se renderiza nada.
 */
export async function WhatsAppButton() {
  const siteSettings = await fetchContent<SiteSettings | null>(
    siteSettingsQuery,
    SANITY_TAGS.siteSettings,
  );

  const href = buildWhatsAppUrl(
    siteSettings?.whatsapp?.phone,
    siteSettings?.whatsapp?.message,
  );

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      // z-40 y no z-50: el header es sticky con z-50 y el panel del menú
      // móvil se despliega desde ahí. El botón tiene que quedar por debajo
      // para no pisar los enlaces de navegación cuando el menú está abierto.
      className="group fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 ring-1 ring-black/10 transition hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
