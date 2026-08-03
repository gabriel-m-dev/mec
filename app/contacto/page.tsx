import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection } from "@/components/animated-section";
import {
  ClockIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  MapPinIcon,
  YoutubeIcon,
} from "@/components/contact-icons";
import { contactDetails, socialLinks } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contacto",
};

const socialIcons = {
  youtube: YoutubeIcon,
  facebook: FacebookIcon,
  globe: GlobeIcon,
  instagram: InstagramIcon,
};

export default function ContactoPage() {
  return (
    <main className="relative overflow-hidden bg-ink-950">
      <AnimatedSection className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-gold-300/20 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.22),rgba(2,5,12,0.95)_55%)] p-8 shadow-luxe sm:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:240%_100%] animate-shimmer" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-gold-300/90">
                  CTA comunidad
                </p>
                <h2 className="mt-4 font-serif text-4xl tracking-tight text-white sm:text-5xl">
                  Únete a una comunidad que ora, sirve y construye futuro
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                  Si buscas un lugar para crecer en fe, servir con propósito y
                  conectar con una iglesia sólida, este es tu punto de entrada.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="mailto:contacto@mec.com"
                    className="inline-flex items-center justify-center rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
                  >
                    Escribir al equipo
                  </a>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Volver al inicio
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-ink-950/55 p-6 backdrop-blur-md">
                <p className="text-sm uppercase tracking-[0.3em] text-gold-300/90">
                  Contacto
                </p>
                <div className="mt-5 space-y-4 text-sm leading-7 text-slate-200">
                  <p className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 shrink-0 text-gold-300" />
                    {contactDetails.address}
                  </p>
                  <p className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 shrink-0 text-gold-300" />
                    {contactDetails.schedule}
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    {socialLinks.map((social) => {
                      const SocialIcon = socialIcons[social.icon];
                      return (
                        <Link
                          key={social.name}
                          href={social.href}
                          aria-label={social.name}
                          className="grid h-10 w-10 place-items-center rounded-full border border-gold-300/30 bg-gold-400/10 text-gold-200 transition hover:border-gold-300/70 hover:bg-gold-400/20"
                        >
                          <SocialIcon className="h-5 w-5" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
