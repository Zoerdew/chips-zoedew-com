import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { env } from "@/lib/env";

export const runtime = "nodejs";

// Personalised share image. 1080x1080 (Instagram square).
// Query params: ?name=Zoe&ref=zoedew0a3f
// Returns a PNG.

async function loadFont(weight: 500 | 800): Promise<ArrayBuffer> {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/bricolage-grotesque@latest/latin-${weight}-normal.ttf`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load font weight ${weight}`);
  return await res.arrayBuffer();
}

async function buildQrDataUrl(targetUrl: string): Promise<string> {
  return await QRCode.toDataURL(targetUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 360,
    color: { dark: "#0a0608", light: "#fff4fa" },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawName = url.searchParams.get("name")?.trim() || "you";
  const ref = url.searchParams.get("ref")?.trim().toLowerCase();

  // First names only on the chip, truncated so it stays legible.
  const firstName = rawName.split(/\s+/)[0].slice(0, 12).toUpperCase();

  const referralUrl = ref
    ? `${env.siteUrl}/?ref=${encodeURIComponent(ref)}`
    : env.siteUrl;

  const [qrDataUrl, regular, extrabold] = await Promise.all([
    buildQrDataUrl(referralUrl),
    loadFont(500),
    loadFont(800),
  ]);

  // Sized for the chip + headline + date + bottom row to fit comfortably
  // inside a 1080x1080 frame with no rotation, no clipping, generous margins.
  const chipSize = 440;
  const chipInner = 280;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1080px",
          display: "flex",
          background: "#FFE2F4",
          fontFamily: "Bricolage Grotesque",
          padding: "70px",
        }}
      >
        {/* Outer sticker (no tilt so nothing clips) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#fff4fa",
            border: "8px solid #0a0608",
            borderRadius: "32px",
            boxShadow: "14px 14px 0 #0a0608",
            padding: "70px 60px 60px",
            position: "relative",
          }}
        >
          {/* Sticker tab */}
          <div
            style={{
              position: "absolute",
              top: "-30px",
              left: "60px",
              background: "#F11787",
              color: "#fff4fa",
              border: "6px solid #0a0608",
              padding: "10px 22px",
              fontWeight: 800,
              fontSize: "26px",
              letterSpacing: "0.18em",
              display: "flex",
            }}
          >
            THE 100 MINUTE BET
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "68px",
              fontWeight: 800,
              color: "#0a0608",
              lineHeight: 0.98,
              letterSpacing: "-0.02em",
              textAlign: "center",
              display: "flex",
            }}
          >
            I&apos;ve taken the bet.
          </div>

          {/* Chip */}
          <div
            style={{
              marginTop: "36px",
              width: `${chipSize}px`,
              height: `${chipSize}px`,
              borderRadius: "9999px",
              background: "#F11787",
              border: "12px solid #0a0608",
              boxShadow: "10px 10px 0 #0a0608",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* 8 rim notches (positioned via rotated absolute children) */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const notchW = 36;
              const notchH = 50;
              const half = chipSize / 2;
              return (
                <div
                  key={deg}
                  style={{
                    position: "absolute",
                    width: `${notchW}px`,
                    height: `${notchH}px`,
                    background: "#0a0608",
                    top: "-10px",
                    left: `${half - notchW / 2}px`,
                    transformOrigin: `${notchW / 2}px ${half + 10}px`,
                    transform: `rotate(${deg}deg)`,
                    display: "flex",
                  }}
                />
              );
            })}
            {/* Inner yellow circle */}
            <div
              style={{
                width: `${chipInner}px`,
                height: `${chipInner}px`,
                borderRadius: "9999px",
                background: "#FDE047",
                border: "10px solid #0a0608",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0a0608",
                fontWeight: 800,
                fontSize: firstName.length > 8 ? "52px" : "72px",
                letterSpacing: "-0.01em",
                textAlign: "center",
              }}
            >
              {firstName}
            </div>
          </div>

          {/* Date */}
          <div
            style={{
              marginTop: "32px",
              fontSize: "44px",
              fontWeight: 800,
              color: "#F11787",
              letterSpacing: "-0.01em",
              display: "flex",
            }}
          >
            22 - 29 JUNE 2026
          </div>

          {/* Bottom row */}
          <div
            style={{
              marginTop: "auto",
              width: "100%",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontWeight: 800,
                color: "#0a0608",
              }}
            >
              <div style={{ fontSize: "24px", letterSpacing: "0.14em", display: "flex" }}>
                PLACE YOUR BET
              </div>
              <div style={{ fontSize: "30px", marginTop: "4px", display: "flex" }}>
                chips.zoedew.com
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR"
                width={180}
                height={180}
                style={{ border: "5px solid #0a0608", background: "#fff4fa" }}
              />
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#0a0608",
                  letterSpacing: "0.12em",
                  display: "flex",
                }}
              >
                SCAN TO TAKE THE BET
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [
        { name: "Bricolage Grotesque", data: regular, weight: 500, style: "normal" },
        { name: "Bricolage Grotesque", data: extrabold, weight: 800, style: "normal" },
      ],
    }
  );
}
