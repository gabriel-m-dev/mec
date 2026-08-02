import Image from "next/image";

type EventCardProps = {
  date: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

export function EventCard({ date, title, description, image, imageAlt }: EventCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/4 shadow-luxe transition hover:-translate-y-1 hover:border-gold-300/25">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 768px) 30vw, 90vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0)_28%,rgba(2,5,12,0.55)_66%,rgba(2,5,12,0.95)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.18),transparent_45%)]" />

        <div className="absolute inset-x-0 top-0 p-6">
          <p className="inline-flex rounded-full border border-gold-300/35 bg-ink-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-gold-200 backdrop-blur-sm">
            {date}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-gold-300 to-gold-500" />
          <h3 className="mt-3 font-serif text-2xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">
            {title}
          </h3>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm leading-7 text-slate-300">{description}</p>
      </div>
    </article>
  );
}
