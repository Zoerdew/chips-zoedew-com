"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SHOP_ITEMS } from "@/config/shopItems";

type BuyResponse =
  | { ok: true; item: { id: string; name: string }; chipBalance: number }
  | { ok: false; error: string };

export function CasinoShop({
  initialChipBalance,
  open,
  unlocked,
}: {
  initialChipBalance: number;
  open: boolean; // SHOP_OPEN env flag
  unlocked: boolean; // 29 June party time reached
}) {
  const router = useRouter();
  const [chipBalance, setChipBalance] = useState(initialChipBalance);
  const [buying, setBuying] = useState<string | null>(null);
  const [bought, setBought] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <p className="text-body">
        The shop isn&apos;t open yet. It opens at the party on 29 June, with
        a handful of things you can buy outright with your chips.
      </p>
    );
  }

  async function buy(itemId: string) {
    if (buying) return;
    setBuying(itemId);
    setError(null);
    setBought(null);
    try {
      const res = await fetch("/api/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const data = (await res.json()) as BuyResponse;
      if (!data.ok) {
        setError(data.error);
        return;
      }
      setChipBalance(data.chipBalance);
      setBought(data.item.name);
      router.refresh();
    } catch {
      setError("Something broke. Try again.");
    } finally {
      setBuying(null);
    }
  }

  return (
    <div>
      {bought && (
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
            Bought: {bought}.
          </strong>
          Zoë will be in touch to set you up. Nothing else for you to do.
        </div>
      )}

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

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SHOP_ITEMS.map((item) => {
          const canAfford = chipBalance >= item.chipCost && unlocked;
          return (
            <div
              key={item.id}
              style={{
                border: "3px solid var(--ink)",
                borderRadius: 14,
                background: "var(--paper)",
                padding: "18px 18px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>{item.name}</h3>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.chipCost} chips
                </span>
              </div>
              <p
                className="text-body"
                style={{ marginTop: 8, marginBottom: 4 }}
              >
                {item.blurb}
              </p>
              <p
                className="text-small"
                style={{ opacity: 0.65, marginBottom: 14 }}
              >
                Worth {item.realValue}.
              </p>
              <button
                type="button"
                className="btn"
                disabled={!canAfford || buying !== null}
                onClick={() => buy(item.id)}
              >
                {buying === item.id
                  ? "Buying..."
                  : canAfford
                    ? `Buy for ${item.chipCost} chips →`
                    : `Need ${item.chipCost} chips`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-small" style={{ marginTop: 16, opacity: 0.75 }}>
        {chipBalance} chips banked. Spending here is the safe play: a
        guaranteed thing, no gamble.
      </p>
    </div>
  );
}
