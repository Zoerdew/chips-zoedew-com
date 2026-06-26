"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SHOP_ITEMS } from "@/config/shopItems";

// The Casino Shop, restyled as a "cashier counter" — items lined up behind
// a felt-green counter with brass trim and hot-pink chip-shaped price tags.
// Same buy mechanic as before, just a new face.

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
        The shop isn&apos;t open yet. It opens at the party on 29 June, with a
        handful of things you can buy outright with your chips.
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
    <div className="cashier">
      {bought && (
        <div className="cashier__receipt" role="status">
          <strong>Cashier ticket: {bought}.</strong>
          <span>Heading to your inbox now. Nothing else for you to do.</span>
        </div>
      )}
      {error && (
        <div className="cashier__error" role="alert">
          {error}
        </div>
      )}

      {/* The counter itself */}
      <div className="cashier__counter">
        <div className="cashier__counter-top">
          <span className="cashier__counter-label">CASHIER</span>
          <span className="cashier__balance">
            <Image
              src="/icons/poker-chip.png"
              alt=""
              width={26}
              height={26}
            />
            <strong>{chipBalance}</strong> chips banked
          </span>
        </div>

        <div className="cashier__shelf">
          {SHOP_ITEMS.map((item) => {
            const canAfford = chipBalance >= item.chipCost && unlocked;
            return (
              <div key={item.id} className="cashier__item">
                <div className="cashier__item-head">
                  <h3 className="cashier__item-name">{item.name}</h3>
                  {/* Pink chip-shaped price tag */}
                  <div className="cashier__price">
                    <span className="cashier__price-num">{item.chipCost}</span>
                    <span className="cashier__price-unit">chips</span>
                  </div>
                </div>
                <p className="cashier__item-blurb">{item.blurb}</p>
                <p className="cashier__item-value">Worth {item.realValue}.</p>
                <button
                  type="button"
                  className="cashier__btn"
                  disabled={!canAfford || buying !== null}
                  onClick={() => buy(item.id)}
                >
                  {buying === item.id
                    ? "Buying..."
                    : canAfford
                      ? `Cash in for ${item.chipCost} chips →`
                      : `Need ${item.chipCost} chips`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="cashier__footer">
          The safe play. Pick a thing. Cash it in. Get it now.
        </div>
      </div>

      <style jsx>{`
        .cashier {
          margin-top: 12px;
        }
        .cashier__receipt {
          background: var(--yellow);
          border: 3px solid var(--ink);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cashier__receipt strong {
          font-weight: 800;
        }
        .cashier__error {
          background: var(--yellow);
          border: 3px solid var(--ink);
          border-radius: 12px;
          padding: 10px 14px;
          margin-bottom: 14px;
          font-weight: 800;
        }

        /* The counter is a felt-green panel with brass trim */
        .cashier__counter {
          background: var(--felt);
          color: var(--paper);
          border: 4px solid var(--ink);
          border-radius: 18px;
          box-shadow: 8px 8px 0 var(--ink);
          padding: 22px;
          position: relative;
          background-image: radial-gradient(
            rgba(255, 255, 255, 0.04) 1px,
            transparent 1px
          );
          background-size: 8px 8px;
        }
        /* Brass trim — thin gold strip running across the top */
        .cashier__counter::before {
          content: "";
          position: absolute;
          left: 14px;
          right: 14px;
          top: 8px;
          height: 6px;
          background: linear-gradient(
            to bottom,
            #f0d27c 0%,
            var(--gold) 50%,
            #8a6a1f 100%
          );
          border-radius: 4px;
        }

        .cashier__counter-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-top: 10px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .cashier__counter-label {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.3em;
          color: var(--gold);
        }
        .cashier__balance {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--paper);
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid var(--gold);
          border-radius: 999px;
          padding: 6px 14px;
        }
        .cashier__balance strong {
          font-family: var(--font-bricolage), sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: var(--paper);
        }

        /* Items lined up like behind-the-bar */
        .cashier__shelf {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 640px) {
          .cashier__shelf {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .cashier__item {
          background: var(--paper);
          color: var(--ink);
          border: 3px solid var(--ink);
          border-radius: 14px;
          padding: 16px 16px 14px;
          display: flex;
          flex-direction: column;
        }
        .cashier__item-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 8px;
        }
        .cashier__item-name {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: 18px;
          line-height: 1.15;
          margin: 0;
          flex: 1;
        }
        /* Pink chip-shaped price tag */
        .cashier__price {
          width: 64px;
          height: 64px;
          background: var(--pink);
          color: var(--paper);
          border: 3px solid var(--ink);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 3px 3px 0 var(--ink);
          transform: rotate(-4deg);
          /* dashed inner ring like a real chip */
          box-shadow:
            inset 0 0 0 4px var(--paper),
            inset 0 0 0 6px var(--pink),
            3px 3px 0 var(--ink);
        }
        .cashier__price-num {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: 22px;
          line-height: 1;
          color: var(--paper);
        }
        .cashier__price-unit {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--paper);
          opacity: 0.85;
        }
        .cashier__item-blurb {
          font-size: 14px;
          line-height: 1.45;
          margin: 0 0 6px;
          color: var(--ink);
        }
        .cashier__item-value {
          font-size: 12px;
          opacity: 0.65;
          margin: 0 0 14px;
          color: var(--ink);
        }
        .cashier__btn {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--ink);
          color: var(--paper);
          border: 3px solid var(--ink);
          border-radius: 999px;
          padding: 10px 14px;
          cursor: pointer;
          box-shadow: 4px 4px 0 var(--pink);
          transition:
            transform 0.08s ease,
            box-shadow 0.08s ease;
          margin-top: auto;
        }
        .cashier__btn:hover:not(:disabled) {
          transform: translate(-1px, -1px);
          box-shadow: 5px 5px 0 var(--pink);
        }
        .cashier__btn:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 var(--pink);
        }
        .cashier__btn:disabled {
          cursor: not-allowed;
          opacity: 0.55;
          background: var(--ink);
        }

        .cashier__footer {
          margin-top: 18px;
          text-align: center;
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
