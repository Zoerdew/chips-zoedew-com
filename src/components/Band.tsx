import type { ReactNode } from "react";

type BandColor = "pink" | "yellow" | "felt" | "paper";

type BandProps = {
  color: BandColor;
  children: ReactNode;
  narrow?: boolean;
  id?: string;
};

export function Band({ color, children, narrow = false, id }: BandProps) {
  return (
    <section id={id} className={`band band--${color}`}>
      <div className={`band__inner ${narrow ? "band__inner--narrow" : ""}`}>
        {children}
      </div>
    </section>
  );
}
