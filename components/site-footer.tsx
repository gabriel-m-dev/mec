import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>© {new Date().getFullYear()} MEC. Todos los derechos reservados.</p>
        <div className="flex items-center gap-4">
          <Link href="/#inicio" className="transition hover:text-white">
            Inicio
          </Link>
          <Link href="/#ministerios" className="transition hover:text-white">
            Ministerios
          </Link>
          <Link href="/#comunidad" className="transition hover:text-white">
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
}
