"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type CardData = {
  id: string;
  triggerThreshold: number;
  revealed: boolean;
  outcome: string;
  tier: string;
  discountCode: string | null;
  freeResource: string | null;
};

type RevealResult = {
  outcome: string;
  tier: string;
  discountCode: string | null;
  freeResource: string | null;
};

const CARD_W = 300;
const CARD_H = 180;
const REVEAL_THRESHOLD = 0.55; // fraction scratched before auto-reveal

// The text shown under the foil once scratched.
function prizeText(r: { outcome: string; discountCode: string | null; freeResource: string | null }) {
  switch (r.outcome) {
    case "No win":
      return { big: "No dice.", small: "Try again at the next 25." };
    case "1 bonus chip":
      return { big: "+1 chip", small: "Straight into your pile." };
    case "2 bonus chips":
      return { big: "+2 chips", small: "Mini jackpot. Nice." };
    case "10% off Dig Your Data":
      return { big: "10% off Dig Your Data", small: r.discountCode ?? "" };
    case "10% off Lead Tracker":
      return { big: "10% off the Lead Tracker", small: r.discountCode ?? "" };
    case "Free resource":
      return { big: "Free resource", small: r.freeResource ?? "" };
    default:
      return { big: r.outcome, small: "" };
  }
}

export function ScratchCard({ card }: { card: CardData }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(card.revealed);
  const [result, setResult] = useState<RevealResult | null>(
    card.revealed
      ? {
          outcome: card.outcome,
          tier: card.tier,
          discountCode: card.discountCode,
          freeResource: card.freeResource,
        }
      : null
  );
  const drawing = useRef(false);
  const revealing = useRef(false);

  // Paint the foil layer.
  useEffect(() => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#F11787";
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = "#fff4fa";
    ctx.font = "800 22px 'Bricolage Grotesque', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH HERE", CARD_W / 2, CARD_H / 2);
  }, [revealed]);

  async function doReveal() {
    if (revealing.current) return;
    revealing.current = true;
    try {
      const res = await fetch("/api/reveal-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(data.result as RevealResult);
        setRevealed(true);
        router.refresh(); // update chip counter if the card paid out
      }
    } catch {
      // leave the card scratchable; they can try again
      revealing.current = false;
    }
  }

  function scratchAt(x: number, y: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Measure how much has been scratched.
    const { data } = ctx.getImageData(0, 0, CARD_W, CARD_H);
    let clear = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) clear++;
    }
    const fraction = clear / (CARD_W * CARD_H);
    if (fraction > REVEAL_THRESHOLD) {
      doReveal();
    }
  }

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CARD_W,
      y: ((e.clientY - rect.top) / rect.height) * CARD_H,
    };
  }

  const prize = result ? prizeText(result) : null;
  const isWin = result && result.outcome !== "No win";

  return (
    <div
      style={{
        width: CARD_W,
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          position: "relative",
          width: CARD_W,
          height: CARD_H,
          maxWidth: "100%",
          border: "4px solid var(--ink)",
          borderRadius: 14,
          overflow: "hidden",
          background: isWin ? "var(--yellow)" : "var(--paper)",
        }}
      >
        {/* Prize layer underneath */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 16px",
          }}
        >
          {prize ? (
            <>
              <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.05 }}>
                {prize.big}
              </span>
              {prize.small && (
                <span style={{ fontSize: 15, fontWeight: 500, marginTop: 8 }}>
                  {prize.small}
                </span>
              )}
            </>
          ) : (
            <span style={{ fontSize: 15, fontWeight: 500, opacity: 0.5 }}>
              Scratch to reveal
            </span>
          )}
        </div>

        {/* Foil layer */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            width={CARD_W}
            height={CARD_H}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              cursor: "crosshair",
              touchAction: "none",
            }}
            onPointerDown={(e) => {
              drawing.current = true;
              const { x, y } = pointerPos(e);
              scratchAt(x, y);
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              const { x, y } = pointerPos(e);
              scratchAt(x, y);
            }}
            onPointerUp={() => {
              drawing.current = false;
            }}
            onPointerLeave={() => {
              drawing.current = false;
            }}
          />
        )}
      </div>
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginTop: 8,
        }}
      >
        Card from {card.triggerThreshold} minutes
      </p>
    </div>
  );
}
