"use client";

import { ScratchCard, type CardData } from "./ScratchCard";

// Dismissible modal shown right after a rep crosses a 25-minute threshold.
// The card is also always available on the Scratch tab, so dismissing here
// loses nothing.
export function ScratchModal({
  cards,
  onClose,
}: {
  cards: CardData[];
  onClose: () => void;
}) {
  if (cards.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10, 6, 8, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="sticker sticker--no-tilt"
        style={{ maxWidth: 380, width: "100%", margin: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="sticker__tab sticker__tab--pink">YOU EARNED A CARD</span>
        <h2 className="text-h3" style={{ marginTop: 4 }}>
          {cards.length === 1
            ? "25 minutes done. Scratch it."
            : `${cards.length} cards. Scratch them.`}
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            marginTop: 18,
          }}
        >
          {cards.map((card) => (
            <ScratchCard key={card.id} card={card} />
          ))}
        </div>
        <button
          type="button"
          className="btn btn--paper"
          onClick={onClose}
          style={{ marginTop: 20 }}
        >
          Done →
        </button>
        <p className="text-small" style={{ marginTop: 10, opacity: 0.75 }}>
          You can always come back to these on the Scratch tab.
        </p>
      </div>
    </div>
  );
}
