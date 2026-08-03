import Image from "next/image";
import Link from "next/link";

type NewsCardProps = {
  category: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
};

export function NewsCard({ category, title, summary, image, imageAlt }: NewsCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/4 shadow-luxe transition hover:-translate-y-1 hover:border-gold-300/25 sm:flex sm:flex-row">
      <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-auto sm:w-2/5 sm:min-h-[240px]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 640px) 22vw, 90vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0)_35%,rgba(2,5,12,0.6)_78%,rgba(2,5,12,0.95)_100%)] sm:bg-[linear-gradient(90deg,rgba(2,5,12,0)_55%,rgba(2,5,12,0.55)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.18),transparent_45%)]" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
            {category}
          </p>
        </div>
      </div>

      <div className="p-7 sm:w-3/5">
        <p className="hidden text-sm uppercase tracking-[0.28em] text-gold-300/90 sm:block">
          {category}
        </p>
        <h3 className="mt-2 font-serif text-2xl text-white sm:mt-4">{title}</h3>
        <p className="mt-4 text-sm leading-7 text-slate-300">{summary}</p>
        <Link
          href="/contacto"
          className="mt-6 inline-flex text-sm font-semibold text-gold-200 transition hover:text-gold-100"
        >
          Leer más →
        </Link>
      </div>
    </article>
  );
}
