import { ImageResponse } from "next/og";
import { isLandingPublic } from "@/lib/betTiming";

export const runtime = "nodejs";

// The link-share preview image. 1200x630 (Slack/Twitter/iMessage standard).
// One image, no query params. Different copy before vs. after 8 June.
// Built with @vercel/og so we don't have to maintain a static PNG.

async function loadFont(weight: 500 | 800): Promise<ArrayBuffer> {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/bricolage-grotesque@latest/latin-${weight}-normal.ttf`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load font weight ${weight}`);
  return await res.arrayBuffer();
}

export async function GET() {
  const [regular, extrabold] = await Promise.all([
    loadFont(500),
    loadFont(800),
  ]);

  const teaser = !isLandingPublic();

  // Brand palette (mirrors globals.css)
  const FELT = "#0F5132";
  const PAPER = "#fff4fa";
  const PINK = "#F11787";
  const YELLOW = "#FDE047";
  const GOLD = "#C9A23B";
  const INK = "#0a0608";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: FELT,
          color: PAPER,
          fontFamily: "Bricolage",
          position: "relative",
          padding: "60px",
        }}
      >
        {/* Tiny top label */}
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: GOLD,
            fontWeight: 500,
          }}
        >
          chips.zoedew.com
        </div>

        {/* Neon-style headline. @vercel/og doesn't run CSS animations, but a
            triple text-shadow gives the glow look. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 28,
          }}
        >
          {teaser ? (
            <>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: PAPER,
                  textShadow: `0 0 18px ${PINK}, 0 0 42px ${PINK}`,
                  lineHeight: 1,
                }}
              >
                WELCOME TO THE
              </div>
              <div
                style={{
                  fontSize: 152,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: PAPER,
                  textShadow: `0 0 24px ${PINK}, 0 0 60px ${PINK}, 0 0 90px ${PINK}`,
                  lineHeight: 1,
                  marginTop: 8,
                }}
              >
                100 MINUTE BET
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: PAPER,
                  textShadow: `0 0 18px ${PINK}, 0 0 42px ${PINK}`,
                  lineHeight: 1,
                }}
              >
                THE
              </div>
              <div
                style={{
                  fontSize: 168,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: PAPER,
                  textShadow: `0 0 24px ${PINK}, 0 0 60px ${PINK}, 0 0 90px ${PINK}`,
                  lineHeight: 1,
                  marginTop: 8,
                }}
              >
                100 MINUTE BET
              </div>
            </>
          )}
        </div>

        {/* Subtitle line */}
        <div
          style={{
            marginTop: 36,
            fontSize: 30,
            color: PAPER,
            fontWeight: 500,
            textAlign: "center",
            maxWidth: 980,
            display: "flex",
          }}
        >
          {teaser
            ? "The house opens 8 June."
            : "Place your bet. Log your reps. Cash your chips."}
        </div>

        {/* Yellow sticker for the date / cta */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: YELLOW,
            color: INK,
            border: `4px solid ${INK}`,
            borderRadius: 10,
            padding: "14px 26px",
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            boxShadow: `8px 8px 0 ${INK}`,
            transform: "rotate(-1.5deg)",
          }}
        >
          {teaser ? "8 JUNE 2026" : "22 - 29 JUNE 2026"}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Bricolage", data: regular, weight: 500, style: "normal" },
        { name: "Bricolage", data: extrabold, weight: 800, style: "normal" },
      ],
    }
  );
}
