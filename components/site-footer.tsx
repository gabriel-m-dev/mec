import Link from "next/link";
import {
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/contact-icons";
import { socialLinks } from "@/lib/content";

const socialIcons = {
  youtube: YoutubeIcon,
  facebook: FacebookIcon,
  globe: GlobeIcon,
  instagram: InstagramIcon,
};

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>© {new Date().getFullYear()} MEC. Todos los derechos reservados.</p>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-4">
            <Link href="/#inicio" className="transition hover:text-white">
              Inicio
            </Link>
            <Link href="/#ministerios" className="transition hover:text-white">
              Ministerios
            </Link>
            <Link href="/#comunidad" className="transition hover:text-white">
              Contacto
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const SocialIcon = socialIcons[social.icon];
              return (
                <Link
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="grid h-9 w-9 place-items-center rounded-full border border-gold-300/30 bg-gold-400/10 text-gold-200 transition hover:border-gold-300/70 hover:bg-gold-400/20"
                >
                  <SocialIcon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
