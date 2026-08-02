import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
  action?: ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left",
  action,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.36em] text-gold-300/90">
        {eyebrow}
      </p>
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className={centered ? "mx-auto" : undefined}>
          <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          {copy ? (
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              {copy}
            </p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}
