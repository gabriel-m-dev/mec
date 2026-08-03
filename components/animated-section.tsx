import type { ReactNode } from "react";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function AnimatedSection({ children, className = "", id }: AnimatedSectionProps) {
  return (
    <section id={id} className={className}>
      {children}
    </section>
  );
}
