type ChaplainCardProps = {
  name: string;
  role: string;
  description: string;
};

export function ChaplainCard({ name, role, description }: ChaplainCardProps) {
  const initials = name
    .split(" ")
    .filter((part) => !part.endsWith("."))
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-ink-900/75 p-6 shadow-luxe">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-full border border-gold-300/30 bg-gold-400/10 font-serif text-2xl text-gold-200">
          {initials}
        </div>
        <div>
          <h3 className="font-serif text-2xl text-white">{name}</h3>
          <p className="text-sm uppercase tracking-[0.24em] text-gold-300/90">
            {role}
          </p>
        </div>
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-300">{description}</p>
    </article>
  );
}
