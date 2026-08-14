import Link from "next/link";
import {
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/contact-icons";
import { fetchContent } from "@/sanity/lib/fetch";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import { SANITY_TAGS } from "@/sanity/lib/tags";
import type { SiteSettings } from "@/sanity/lib/types";

const socialIcons = {
  youtube: YoutubeIcon,
  facebook: FacebookIcon,
  globe: GlobeIcon,
  instagram: InstagramIcon,
};

export async function SiteFooter() {
  const siteSettings = await fetchContent<SiteSettings | null>(
    siteSettingsQuery,
    SANITY_TAGS.siteSettings,
  );
  const socialLinks = siteSettings?.socialLinks ?? [];
  const rnc = siteSettings?.rnc;

  return (
    // `pb-24` y no `py-10`: el botón flotante de WhatsApp ocupa los últimos
    // ~80px del viewport, y al llegar al fondo de la página caía al lado de
    // los íconos de redes — 6px de separación en un móvil de 360px, 25px en
    // desktop. No llegaban a superponerse, pero las áreas táctiles sí: tocar
    // el ícono del sitio web podía abrir WhatsApp. El footer reserva el
    // espacio en vez de que el botón esquive.
    <footer className="border-t border-white/8 pb-24 pt-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="text-center lg:text-left">
          <p>© {new Date().getFullYear()} MEC. Todos los derechos reservados.</p>

          {/* El lema, como en el membrete institucional de la iglesia. */}
          <p className="mt-1 font-serif italic text-gold-300/70">
            Cristo poder y sabiduría de Dios
          </p>

          {/* La inscripción en el Registro Nacional de Cultos. No es un
              adorno legal: es lo que respalda el trabajo de capellanía en
              hospitales, fuerzas y escuelas. Sin número cargado no aparece. */}
          {rnc?.number && (
            <p className="mt-3 text-xs text-slate-500">
              Inscripta en el Registro Nacional de Cultos N.º {rnc.number}
              {rnc.resolution ? ` — ${rnc.resolution}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="transition hover:text-white">
              Inicio
            </Link>
            <Link href="/the-chosen" className="transition hover:text-white">
              The Chosen
            </Link>
            <Link href="/contacto" className="transition hover:text-white">
              Contacto
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            {socialLinks.map((social) => {
              const SocialIcon = socialIcons[social.icon];
              return (
                <Link
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="grid h-9 w-9 place-items-center rounded-full text-gold-200 transition hover:text-gold-100"
                >
                  <SocialIcon className="h-6 w-6" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
