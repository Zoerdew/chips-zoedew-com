"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { REEL_SYMBOLS } from "@/config/fruitMachinePrizes";

type Prize = {
  key: string;
  symbol: string;
  title: string;
  blurb: string;
  isWin: boolean;
};

type SpinResponse =
  | { ok: true; prize: Prize; chipBalance: number; wasFreeSpin: boolean }
  | { ok: false; error: string };

const REEL_COUNT = 3;
const SPIN_MS = 1500;

// One reel column. Cycles symbols while spinning, lands on `final`.
function Reel({
  spinning,
  final,
  delay,
}: {
  spinning: boolean;
  final: string;
  delay: number;
}) {
  const [display, setDisplay] = useState(REEL_SYMBOLS[0]);

  useEffect(() => {
    if (!spinning) return;
    // Cycle random symbols fast while spinning.
    const interval = setInterval(() => {
      setDisplay(REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]);
    }, 80);
    // Stop this reel after the base spin time plus its stagger delay.
    const stop = setTimeout(() => {
      clearInterval(interval);
      setDisplay(final);
    }, SPIN_MS + delay);
    return () => {
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, [spinning, final, delay]);

  return (
    <div
      style={{
        width: 86,
        height: 110,
        background: "var(--paper)",
        border: "4px solid var(--ink)",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 52,
        lineHeight: 1,
      }}
    >
      {display}
    </div>
  );
}

const SPIN_COST = 10;

export function FruitMachine({
  initialChipBalance,
  eligible,
  unlocked,
  freeSpinAvailable,
}: {
  initialChipBalance: number;
  eligible: boolean; // hit 100 minutes
  unlocked: boolean; // 7pm 29 June passed
  freeSpinAvailable: boolean; // free spin not yet used
}) {
  const router = useRouter();
  const [chipBalance, setChipBalance] = useState(initialChipBalance);
  const [freeSpin, setFreeSpin] = useState(freeSpinAvailable);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  // The symbol the reels should land on. Set as soon as the spin response
  // arrives, so the reels know their target before they stop. The result
  // CARD appears later, once the reels have visibly landed.
  const [targetSymbol, setTargetSymbol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Can spin if: it's the free spin, or there are enough chips for a paid one.
  const canAfford = freeSpin || chipBalance >= SPIN_COST;
  const canSpin = unlocked && eligible && canAfford && !spinning;

  async function spin() {
    if (!canSpin) return;
    setError(null);
    setResult(null);
    setTargetSymbol(null);
    setSpinning(true);

    let data: SpinResponse;
    try {
      const res = await fetch("/api/spin", { method: "POST" });
      data = (await res.json()) as SpinResponse;
    } catch {
      setSpinning(false);
      setError("Something broke. Try again.");
      return;
    }

    if (!data.ok) {
      setSpinning(false);
      setError(data.error);
      return;
    }

    const prize = data.prize;
    const newBalance = data.chipBalance;
    const wasFree = data.wasFreeSpin;

    // Tell the reels what to land on NOW, before they stop.
    setTargetSymbol(prize.symbol);

    // Reveal the result card once the reels have visibly landed.
    setTimeout(() => {
      setSpinning(false);
      setResult(prize);
      setChipBalance(newBalance);
      if (wasFree) setFreeSpin(false);
      router.refresh();
    }, SPIN_MS + 600);
  }

  // The reels land on the spin's target. Before any spin, show the first
  // symbol as a neutral resting state.
  const finalSymbol = targetSymbol ?? result?.symbol ?? REEL_SYMBOLS[0];

  return (
    <div>
      {/* The machine */}
      <div
        style={{
          background: "var(--felt)",
          border: "4px solid var(--ink)",
          borderRadius: 18,
          padding: "28px 22px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginBottom: 22,
          }}
        >
          {Array.from({ length: REEL_COUNT }).map((_, i) => (
            <Reel
              key={i}
              spinning={spinning}
              final={finalSymbol}
              delay={i * 250}
            />
          ))}
        </div>

        <button
          type="button"
          className="btn"
          onClick={spin}
          disabled={!canSpin}
        >
          {spinning
            ? "Spinning..."
            : freeSpin
              ? "Take your free spin →"
              : `Spin — ${SPIN_COST} chips →`}
        </button>

        <p
          style={{
            color: "var(--paper)",
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginTop: 14,
          }}
        >
          {chipBalance} chips banked
        </p>
      </div>

      {/* Status / result */}
      {!unlocked && (
        <p className="text-body" style={{ marginTop: 16 }}>
          The fruit machine unlocks at 7pm on 29 June, live at the party.
        </p>
      )}
      {unlocked && !eligible && (
        <p className="text-body" style={{ marginTop: 16 }}>
          You need 100 logged minutes to spin. The machine is for people who
          went the distance.
        </p>
      )}
      {error && (
        <div
          role="alert"
          style={{
            marginTop: 16,
            background: "var(--yellow)",
            border: "3px solid var(--ink)",
            borderRadius: 12,
            padding: "10px 14px",
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      )}
      {result && (
        <div
          style={{
            marginTop: 16,
            background: result.isWin ? "var(--yellow)" : "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 14,
            padding: "18px 20px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 44, display: "block" }}>{result.symbol}</span>
          <h3 className="text-h3" style={{ marginTop: 8 }}>
            {result.title}
          </h3>
          <p className="text-body" style={{ marginTop: 6 }}>
            {result.blurb}
          </p>
          {!spinning && chipBalance >= SPIN_COST && (
            <p
              className="text-small"
              style={{ marginTop: 10, fontWeight: 800 }}
            >
              You&apos;ve got chips for another spin if you want it.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
