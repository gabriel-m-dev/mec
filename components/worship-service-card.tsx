type WorshipServiceCardProps = {
  title: string;
  description: string;
  detail: string;
  cta: string;
};

function ServiceIcon({ title }: { title: string }) {
  const common = "h-6 w-6 text-gold-200";

  if (title === "En vivo") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path
          d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M6.5 11.5v.5a5.5 5.5 0 0 0 11 0v-.5M12 17.5V21m-3 0h6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M4 8.5c-.8 2.3-.8 4.7 0 7M20 8.5c.8 2.3.8 4.7 0 7"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (title === "En línea") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="11.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2 19.5h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 9.5h8M8 12.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
      <path d="M12 3 4 8v12h16V8l-8-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 21v-6h4v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 6.5v3M10.5 8h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function WorshipServiceCard({ title, description, detail, cta }: WorshipServiceCardProps) {
  return (
    <article className="group flex flex-col justify-between gap-5 rounded-[1.75rem] border border-white/10 bg-white/4 p-6 shadow-luxe transition hover:-translate-y-1 hover:border-gold-300/25 md:flex-row md:items-center">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-300/30 bg-gold-400/10">
          <ServiceIcon title={title} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gold-300/90">{title}</p>
          <h3 className="mt-2 font-serif text-2xl text-white">{description}</h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">{detail}</p>
        </div>
      </div>
      <a
        href="/#comunidad"
        className="inline-flex shrink-0 items-center justify-center rounded-full border border-gold-300/35 px-5 py-3 text-sm font-semibold text-gold-100 transition hover:border-gold-200/70 hover:bg-gold-400/10"
      >
        {cta}
      </a>
    </article>
  );
}
