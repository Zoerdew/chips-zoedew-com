"use client";

import { useEffect, useRef, useState } from "react";

type Totals = {
  minutes: number;
  money: number;
  players: number;
  hit100: number;
};

const POLL_MS = 30_000;

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

// Live cumulative tracker for the landing page. Fully self-contained: it
// fetches /api/stats itself so it can mount from the server page without
// making any parent component async.
export function LiveTracker() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loaded, setLoaded] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;

    async function load() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        const data = await res.json();
        if (alive.current && data?.ok) {
          setTotals({
            minutes: data.minutes ?? 0,
            money: data.money ?? 0,
            players: data.players ?? 0,
            hit100: data.hit100 ?? 0,
          });
        }
      } catch {
        // Leave the last known numbers in place on a transient error.
      } finally {
        if (alive.current) setLoaded(true);
      }
    }

    load();
    const id = setInterval(load, POLL_MS);
    function onFocus() {
      load();
    }
    window.addEventListener("focus", onFocus);

    return () => {
      alive.current = false;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const minutes = totals ? totals.minutes.toLocaleString("en-GB") : "—";
  const money = totals ? gbp.format(totals.money) : "—";

  return (
    <div style={{ textAlign: "center" }}>
      <span className="pill-badge pill-badge--yellow">LIVE SCOREBOARD</span>
      <h2 className="split-head" style={{ marginTop: 12 }}>
        <span className="line-a">The bet, live.</span>
        <span className="line-b">Minutes and money, logged so far.</span>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          margin: "28px auto 8px",
          maxWidth: 640,
        }}
      >
        <div className="stat-card" style={{ color: "var(--felt)" }}>
          <span
            className="stat-card__num"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {minutes}
          </span>
          <span className="stat-card__label">Minutes logged</span>
        </div>
        <div className="stat-card">
          <span
            className="stat-card__num"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {money}
          </span>
          <span className="stat-card__label">Money made by players</span>
        </div>
      </div>

      <p
        className="band-sub"
        style={{ marginTop: 14, opacity: loaded ? 0.9 : 0.5 }}
      >
        {totals
          ? `${totals.players.toLocaleString("en-GB")} ${
              totals.players === 1 ? "player" : "players"
            } logging${
              totals.hit100 > 0
                ? ` · ${totals.hit100} ${
                    totals.hit100 === 1 ? "has" : "have"
                  } hit 100 minutes`
                : ""
            }`
          : "Pulling the latest numbers."}
      </p>
    </div>
  );
}
