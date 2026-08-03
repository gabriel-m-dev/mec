import type { Metadata } from "next";
import Image from "next/image";
import { AnimatedSection } from "@/components/animated-section";
import { SectionHeading } from "@/components/section-heading";
import { aboutStats } from "@/lib/content";

export const metadata: Metadata = {
  title: "Quiénes somos",
};

export default function QuienesSomosPage() {
  return (
    <main className="relative overflow-hidden bg-ink-950">
      <AnimatedSection className="bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.09),transparent_38%)] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Quiénes somos"
            title="Una iglesia con estética refinada y convicción espiritual"
            copy="MEC une excelencia visual, profundidad bíblica y un lenguaje contemporáneo para conectar con personas y familias que buscan dirección, comunidad y propósito."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/4 p-8 shadow-luxe backdrop-blur-md">
              <p className="text-lg leading-8 text-slate-200">
                Somos una comunidad que sirve con orden, belleza y reverencia.
                Creemos en una fe práctica, en la formación de discípulos y en
                una vida ministerial que impacta la ciudad con integridad.
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Nuestro enfoque integra adoración, cuidado pastoral, formación
                de liderazgos y presencia digital para que cada persona encuentre
                un lugar seguro para crecer.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {aboutStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-gold-300/15 bg-black/20 p-4"
                  >
                    <p className="font-serif text-3xl text-gold-200">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 shadow-luxe">
                <Image
                  src="/images/igle-background-desktop.png"
                  alt="Ambiente visual MEC"
                  width={1600}
                  height={900}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-ink-900/70 p-6">
                <p className="text-sm uppercase tracking-[0.32em] text-gold-300/90">
                  Visión
                </p>
                <p className="mt-3 text-lg leading-8 text-slate-200">
                  Ser una casa espiritual donde la presencia de Dios, la
                  excelencia ministerial y la compasión se encuentren en cada
                  experiencia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
