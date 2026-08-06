import Image from "next/image";

type PageHeaderProps = {
  // La imagen es opcional porque el campo `image` de `pageBanner` no es
  // obligatorio en el schema: el cliente puede borrarla desde el Studio. El
  // título sí es obligatorio, así que el encabezado se sigue mostrando sin
  // imagen en vez de desaparecer y llevarse el h1 de la página.
  image?: string;
  imageAlt?: string;
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ image, imageAlt, eyebrow, title, description }: PageHeaderProps) {
  return (
    // Más alta que antes (era 288/320/384) para que entre más foto: en
    // /eventos se perdía el 56% de la imagen. En móvil se sube menos, porque
    // ahí la banda compite con la pantalla entera.
    <section className="relative isolate h-80 w-full overflow-hidden border-b border-white/10 bg-ink-950 sm:h-[26rem] lg:h-[35rem]">
      {image && (
        <Image
          src={image}
          alt={imageAlt ?? ""}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(2,5,12,0.96)_8%,rgba(2,5,12,0.72)_45%,rgba(2,5,12,0.32)_78%,rgba(2,5,12,0.55)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,170,53,0.14),transparent_45%)]" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 sm:px-6 lg:px-8 lg:pb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.42em] text-gold-300/90 sm:text-sm">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-3xl tracking-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.65)] sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-slate-200 sm:text-base">
          {description}
        </p>
      </div>
    </section>
  );
}
