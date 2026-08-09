"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type GalleryPhoto = {
  key: string;
  /** La chica, la que ya se ve en la grilla. */
  thumb: string;
  /** La grande, para el visor. */
  full: string;
  alt: string;
};

/** Recorrido mínimo del dedo para contar como gesto, en px. */
const SWIPE_THRESHOLD = 40;

/** Resto siempre positivo: `-1 % 5` da `-1` en JavaScript, y acá hace falta 4. */
function wrap(value: number, length: number): number {
  return ((value % length) + length) % length;
}

/**
 * La grilla de fotos de una galería, con visor a pantalla completa.
 *
 * En la grilla las fotos van recortadas a 4/3 con `object-cover`, que es lo
 * que hace que la cuadrícula quede pareja. En el visor van con
 * `object-contain`: ahí la foto se ve ENTERA, que es el motivo de abrirla.
 *
 * El visor es un `<dialog>` con `showModal()` y no un `<div>` fijo. Eso lo
 * pone en la capa superior del navegador, así que:
 *
 * - No lo puede recortar ningún `overflow-hidden` ni tapar ningún `z-index`
 *   de los que ya hay en la página.
 * - El foco queda atrapado adentro sin que haya que programarlo, y al cerrar
 *   vuelve solo al botón desde el que se abrió.
 * - `Escape` cierra sin código propio.
 *
 * Escribir eso a mano —sobre todo la trampa de foco— es donde suelen fallar
 * los visores hechos a medida.
 */
export function PhotoGallery({
  photos,
  className = "",
}: {
  photos: GalleryPhoto[];
  className?: string;
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const isOpen = openAt !== null;

  const go = useCallback(
    (direction: 1 | -1) => {
      setOpenAt((current) =>
        current === null ? current : wrap(current + direction, photos.length),
      );
    },
    [photos.length],
  );

  // Abrir y cerrar el diálogo es imperativo: `showModal()` es lo que lo manda
  // a la capa superior. Renderizarlo con `open` puesto NO hace lo mismo —
  // queda como un elemento común, sin trampa de foco ni fondo inerte.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // El navegador cierra por su cuenta con `Escape`. Sin escuchar `close`, el
  // estado de React se quedaría creyendo que sigue abierto y el visor no se
  // podría volver a abrir.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onClose = () => setOpenAt(null);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  // Con el visor abierto, la página de atrás no tiene que poder desplazarse:
  // `showModal()` bloquea la interacción pero no el scroll.
  useEffect(() => {
    if (!isOpen) return;

    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [isOpen]);

  // Flechas del teclado: el equivalente en escritorio del gesto del dedo.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, go]);

  function onTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: React.TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;

    const delta = (event.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;

    go(delta < 0 ? 1 : -1);
  }

  if (photos.length === 0) return null;

  // La posición y la foto viajan juntas para que al comprobar una quede
  // comprobada la otra: con dos variables sueltas, verificar la foto no le
  // dice nada a TypeScript sobre si la posición sigue siendo `null`.
  const current = openAt === null ? null : { position: openAt, photo: photos[openAt] };
  const hasControls = photos.length > 1;

  return (
    <>
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {photos.map((item, index) => (
          // Es un `<button>` y no un `<div>` con `onClick` para que se pueda
          // llegar tabulando y abrir con Enter o barra espaciadora.
          <button
            key={item.key}
            type="button"
            onClick={() => setOpenAt(index)}
            aria-label={`Ampliar la foto ${index + 1} de ${photos.length}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/4 shadow-luxe transition hover:border-gold-300/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
          >
            <Image
              src={item.thumb}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Foto ampliada"
        // Se le sacan los estilos propios del `<dialog>` (margen centrado,
        // borde, fondo blanco) para que ocupe la pantalla entera.
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-white [&::backdrop]:bg-ink-950/95"
        // Un clic en el fondo cierra. Se compara contra el `<dialog>` mismo
        // porque el fondo NO es un elemento aparte: los clics afuera del
        // contenido tienen al diálogo como destino.
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpenAt(null);
        }}
      >
        {current && (
          <div
            className="relative flex h-full w-full flex-col"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-6">
              <p className="text-sm tabular-nums text-white/70">
                {current.position + 1} / {photos.length}
              </p>
              <button
                type="button"
                onClick={() => setOpenAt(null)}
                aria-label="Cerrar"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/5 text-xl leading-none transition hover:border-gold-300/50 hover:bg-white/10"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            {/*
              `min-h-0` para que este bloque pueda encogerse dentro del flex y
              la foto se acomode al alto disponible. Sin eso el hijo impone su
              tamaño y la foto se sale de la pantalla.
            */}
            <div className="relative min-h-0 flex-1">
              {/*
                La miniatura, debajo y ampliada. Ya está en la caché del
                navegador porque es la misma que se ve en la grilla, así que
                aparece al instante y tapa el negro mientras baja la grande.
              */}
              <Image
                key={`${current.photo.key}-thumb`}
                src={current.photo.thumb}
                alt=""
                aria-hidden="true"
                fill
                sizes="100vw"
                className="scale-105 object-contain blur-sm"
              />
              <Image
                key={current.photo.key}
                src={current.photo.full}
                alt={current.photo.alt}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <div className="flex shrink-0 items-center justify-center gap-6 px-4 py-5">
              {hasControls && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Foto anterior"
                    className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/5 transition hover:border-gold-300/50 hover:bg-white/10"
                  >
                    <span aria-hidden="true">←</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Foto siguiente"
                    className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/5 transition hover:border-gold-300/50 hover:bg-white/10"
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
