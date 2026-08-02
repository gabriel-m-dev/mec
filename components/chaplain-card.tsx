import Image from "next/image";

type ChaplainCardProps = {
  name: string;
  role: string;
  description: string;
  image: string;
  imageAlt: string;
};

export function ChaplainCard({ name, role, description, image, imageAlt }: ChaplainCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/4 shadow-luxe transition hover:-translate-y-1 hover:border-gold-300/25">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 30vw, 90vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0)_28%,rgba(2,5,12,0.55)_66%,rgba(2,5,12,0.95)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.18),transparent_45%)]" />

        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-gold-300 to-gold-500" />
          <h3 className="mt-3 font-serif text-2xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">
            {name}
          </h3>
          <p className="mt-1 text-sm uppercase tracking-[0.24em] text-gold-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
            {role}
          </p>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm leading-7 text-slate-300">{description}</p>
      </div>
    </article>
  );
}
