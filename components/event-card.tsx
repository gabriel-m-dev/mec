type EventCardProps = {
  date: string;
  title: string;
  description: string;
};

export function EventCard({ date, title, description }: EventCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-ink-900/75 p-6 shadow-luxe">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold-300/90">
        {date}
      </p>
      <h3 className="mt-4 font-serif text-2xl text-white">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
    </article>
  );
}
