"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export type LeaderRow = {
  id: string;
  name: string;
  chipBalance: number;
  minutes: number;
};

// Renders the ranked table and refreshes the server data when the tab
// regains focus, so the board stays current without a manual reload.
export function LeaderboardTable({
  rows,
  meId,
}: {
  rows: LeaderRow[];
  meId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    function onFocus() {
      router.refresh();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

  if (rows.length === 0) {
    return (
      <p className="text-body">
        No one&apos;s on the board yet. Log a rep and you&apos;re on it.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "44px 1fr 70px 70px",
          gap: 8,
          padding: "0 12px",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        <span>#</span>
        <span>Name</span>
        <span style={{ textAlign: "right" }}>Chips</span>
        <span style={{ textAlign: "right" }}>Mins</span>
      </div>

      {rows.map((row, i) => {
        const isMe = row.id === meId;
        const rank = i + 1;
        return (
          <div
            key={row.id}
            style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr 70px 70px",
              gap: 8,
              alignItems: "center",
              padding: "12px",
              border: "3px solid var(--ink)",
              borderRadius: 12,
              background: isMe ? "var(--pink)" : "var(--paper)",
              color: isMe ? "var(--paper)" : "var(--ink)",
              boxShadow: isMe ? "4px 4px 0 var(--ink)" : "none",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: 18,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {rank === 1 ? "1st" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : rank}
            </span>
            <span style={{ fontWeight: isMe ? 800 : 600 }}>
              {row.name}
              {isMe && " (you)"}
            </span>
            <span
              style={{
                textAlign: "right",
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {row.chipBalance}
            </span>
            <span
              style={{
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {row.minutes}
            </span>
          </div>
        );
      })}
    </div>
  );
}
