import type { Metadata } from "next";
import { NewsCard } from "@/components/news-card";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { news } from "@/lib/content";

export const metadata: Metadata = {
  title: "Noticias",
};

export default function NoticiasPage() {
  return (
    <main className="relative overflow-hidden bg-ink-950">
      <PageHeader
        image="/images/pages/noticias-banner.jpg"
        imageAlt="Primer plano de un periódico sobre una mesa"
        eyebrow="Noticias"
        title="Lo que está pasando en nuestra comunidad"
        description="Alianzas, celebraciones y novedades institucionales para que ninguna actualización te tome por sorpresa."
      />

      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Noticias"
            title="Contenido institucional con ritmo editorial"
            copy="Actualizaciones, iniciativas y cobertura de comunidad para mantener la conexión viva."
          />

          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300">
            Reunimos acá las novedades más relevantes de la vida
            institucional de MEC: alianzas nuevas, cambios en nuestros
            espacios de cuidado y celebraciones que vale la pena compartir
            con toda la comunidad.
          </p>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {news.map((item) => (
              <NewsCard
                key={item.title}
                category={item.category}
                title={item.title}
                summary={item.summary}
                image={item.image}
                imageAlt={item.imageAlt}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
