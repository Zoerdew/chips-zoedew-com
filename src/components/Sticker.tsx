import type { ReactNode } from "react";

type Tilt = "left" | "right" | "tinyLeft" | "tinyRight";
type TabColor = "yellow" | "pink";

const tiltClass: Record<Tilt, string> = {
  left: "sticker--tilt-left",
  right: "sticker--tilt-right",
  tinyLeft: "sticker--tilt-tiny-left",
  tinyRight: "sticker--tilt-tiny-right",
};

type StickerProps = {
  tab: string;
  tabColor?: TabColor;
  tilt?: Tilt;
  children: ReactNode;
};

export function Sticker({ tab, tabColor = "yellow", tilt = "left", children }: StickerProps) {
  return (
    <section className={`sticker ${tiltClass[tilt]}`}>
      <span className={`sticker__tab ${tabColor === "pink" ? "sticker__tab--pink" : ""}`}>
        {tab}
      </span>
      {children}
    </section>
  );
}
