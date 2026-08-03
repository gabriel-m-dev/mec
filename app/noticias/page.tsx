import type { Metadata } from "next";
import { AnimatedSection } from "@/components/animated-section";
import { NewsCard } from "@/components/news-card";
import { SectionHeading } from "@/components/section-heading";
import { news } from "@/lib/content";

export const metadata: Metadata = {
  title: "Noticias",
};

export default function NoticiasPage() {
  return (
    <main className="relative overflow-hidden bg-ink-950">
      <AnimatedSection className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Noticias"
            title="Contenido institucional con ritmo editorial"
            copy="Actualizaciones, iniciativas y cobertura de comunidad para mantener la conexión viva."
          />

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
      </AnimatedSection>
    </main>
  );
}
