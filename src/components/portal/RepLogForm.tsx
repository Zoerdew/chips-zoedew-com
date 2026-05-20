"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScratchModal } from "./ScratchModal";
import type { CardData } from "./ScratchCard";

const R_TYPES = [
  { value: "Reach", label: "Reach — cold, new people" },
  { value: "Reengage", label: "Reengage — leads gone cold" },
  { value: "Return", label: "Return — past clients" },
  { value: "Retain", label: "Retain — current clients" },
  { value: "Refer", label: "Refer — asking for referrals" },
];

const OUTCOMES = [
  { value: "No result", label: "No result yet" },
  { value: "Positive conversation", label: "Positive conversation" },
  { value: "Sale", label: "A sale" },
];

type Summary = {
  totalMinutes: number;
  chipAwarded: boolean;
  scratchCardsCreated: number;
  hit100: boolean;
};

export function RepLogForm() {
  const router = useRouter();
  const [minutes, setMinutes] = useState("");
  const [revenueR, setRevenueR] = useState("");
  const [outcome, setOutcome] = useState("No result");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<Summary | null>(null);
  const [modalCards, setModalCards] = useState<CardData[]>([]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setLastSummary(null);
    try {
      const res = await fetch("/api/log-rep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minutes: Number(minutes),
          revenueR,
          outcome,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something broke. Try again.");
        return;
      }
      const summary = data.summary as Summary;
      setLastSummary(summary);

      // Crossed 100 minutes? Celebrate.
      if (summary.hit100) {
        try {
          const confetti = (await import("canvas-confetti")).default;
          const burst = (originX: number) =>
            confetti({
              particleCount: 90,
              spread: 70,
              startVelocity: 45,
              origin: { x: originX, y: 0.7 },
              colors: ["#F11787", "#FDE047", "#0a0608", "#fff4fa"],
            });
          burst(0.25);
          burst(0.75);
          setTimeout(() => burst(0.5), 250);
        } catch {
          // confetti is a nicety; never block on it
        }
      }

      // Reset the form
      setMinutes("");
      setRevenueR("");
      setOutcome("No result");
      setNote("");

      // If this rep created new scratch cards, pop the dismissible modal
      // with whatever's still unrevealed.
      if (summary.scratchCardsCreated > 0) {
        try {
          const cardsRes = await fetch("/api/my-cards");
          const cardsData = await cardsRes.json();
          if (cardsData.ok) {
            const unrevealed = (cardsData.cards as CardData[]).filter(
              (c) => !c.revealed
            );
            if (unrevealed.length > 0) setModalCards(unrevealed);
          }
        } catch {
          // modal is a nicety; the cards are on the Scratch tab regardless
        }
      }

      // Refresh server components so the chip counter updates
      router.refresh();
    } catch {
      setError("Something broke on our end. Try again in a minute.");
    } finally {
      setSubmitting(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    fontWeight: 800,
    fontSize: 14,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  };

  return (
    <div>
      {modalCards.length > 0 && (
        <ScratchModal
          cards={modalCards}
          onClose={() => {
            setModalCards([]);
            router.refresh();
          }}
        />
      )}

      {lastSummary && (
        <div
          style={{
            background: "var(--yellow)",
            border: "3px solid var(--ink)",
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 18,
            fontWeight: 500,
          }}
        >
          <strong style={{ display: "block", marginBottom: 4 }}>
            Logged. +1 chip. {lastSummary.totalMinutes} minutes banked.
          </strong>
          <span>
            {lastSummary.scratchCardsCreated > 0 &&
              `${lastSummary.scratchCardsCreated} new scratch ${
                lastSummary.scratchCardsCreated === 1 ? "card" : "cards"
              } on the Scratch tab. `}
            {lastSummary.hit100
              ? "You hit 100 minutes. The fruit machine is yours on the 29th."
              : "Keep going."}
          </span>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={labelStyle}>Minutes spent</span>
          <input
            className="input"
            type="number"
            min={1}
            max={600}
            required
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            style={{ marginTop: 6 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={labelStyle}>What kind of rep</span>
          <select
            className="input"
            required
            value={revenueR}
            onChange={(e) => setRevenueR(e.target.value)}
            style={{ marginTop: 6 }}
          >
            <option value="">Pick one...</option>
            {R_TYPES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={labelStyle}>What came of it</span>
          <select
            className="input"
            required
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            style={{ marginTop: 6 }}
          >
            {OUTCOMES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={labelStyle}>One line on what you did</span>
          <input
            className="input"
            type="text"
            maxLength={500}
            placeholder="Followed up with a past client about the next phase"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ marginTop: 6 }}
          />
        </label>

        {error && (
          <div
            role="alert"
            style={{
              background: "var(--yellow)",
              border: "3px solid var(--ink)",
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 14,
              fontWeight: 800,
            }}
          >
            {error}
          </div>
        )}

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Logging..." : "Log this rep →"}
        </button>
      </form>
    </div>
  );
}
