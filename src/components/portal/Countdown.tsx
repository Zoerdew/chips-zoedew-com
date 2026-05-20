"use client";

import { useEffect, useState } from "react";

type CountdownProps = {
  target: string; // ISO string
  label: string;
};

function diff(targetMs: number) {
  const now = Date.now();
  const ms = Math.max(0, targetMs - now);
  const totalSeconds = Math.floor(ms / 1000);
  return {
    done: ms === 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function Countdown({ target, label }: CountdownProps) {
  const targetMs = new Date(target).getTime();
  // Start unmounted-safe: render nothing time-specific until the component
  // has mounted in the browser. This avoids a server/client hydration
  // mismatch (the server's "now" differs from the client's "now").
  const [mounted, setMounted] = useState(false);
  const [t, setT] = useState(() => diff(targetMs));

  useEffect(() => {
    setMounted(true);
    setT(diff(targetMs));
    const id = setInterval(() => setT(diff(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const cells: Array<[number, string]> = [
    [t.days, "DAYS"],
    [t.hours, "HRS"],
    [t.minutes, "MIN"],
    [t.seconds, "SEC"],
  ];

  return (
    <div>
      <p
        style={{
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {label}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {cells.map(([value, unit]) => (
          <div
            key={unit}
            style={{
              background: "var(--ink)",
              color: "var(--yellow)",
              border: "4px solid var(--ink)",
              borderRadius: 12,
              padding: "14px 16px",
              minWidth: 78,
              textAlign: "center",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {mounted ? String(value).padStart(2, "0") : "--"}
            </span>
            <span
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.12em",
                marginTop: 6,
                color: "var(--paper)",
              }}
            >
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
