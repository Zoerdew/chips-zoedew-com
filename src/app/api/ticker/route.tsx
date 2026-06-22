import { ImageResponse } from "next/og";
import { getBetTotals } from "@/lib/betTotals";

export const runtime = "nodejs";

// Live cohort stats rendered as a PNG, for embedding in emails as a normal
// <img>. Reads the same totals as /api/stats. 1200x400, on-brand.
//
// Caching note: email clients (Gmail/Apple) proxy and cache images, so each
// recipient mostly sees the numbers from when their client first fetched it.
// Good for a daily send, not a true ticking counter.

async function loadFont(weight: 500 | 800): Promise<ArrayBuffer> {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/bricolage-grotesque@latest/latin-${weight}-normal.ttf`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load font weight ${weight}`);
  return await res.arrayBuffer();
}

// Brand palette (mirrors globals.css)
const YELLOW = "#FFE925";
const INK = "#0a0608";
const PINK = "#F11787";
const FELT = "#0F5132";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 132,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: FELT,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          marginTop: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: INK,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export async function GET() {
  const [regular, extrabold] = await Promise.all([loadFont(500), loadFont(800)]);

  let minutes = 0;
  let players = 0;
  let sales = 0;
  try {
    const t = await getBetTotals();
    minutes = t.minutes;
    players = t.players;
    sales = t.sales;
  } catch {
    // Fall back to zeros if Airtable is briefly unreachable.
  }

  const fmt = (n: number) => n.toLocaleString("en-GB");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: YELLOW,
          border: `16px solid ${INK}`,
          fontFamily: "Bricolage",
          color: INK,
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: PINK,
            marginBottom: 28,
          }}
        >
          The bet so far
        </div>
        <div style={{ display: "flex", gap: 96 }}>
          <Stat value={fmt(minutes)} label="minutes logged" />
          <Stat value={fmt(players)} label="players in" />
          <Stat value={fmt(sales)} label="sales" />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 400,
      fonts: [
        { name: "Bricolage", data: regular, weight: 500, style: "normal" },
        { name: "Bricolage", data: extrabold, weight: 800, style: "normal" },
      ],
      // Short cache so a fresh fetch gets fresh-ish numbers.
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    }
  );
}
