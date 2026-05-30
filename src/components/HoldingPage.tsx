"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

// Casino-sign holding page. Shows before NEXT_PUBLIC_LANDING_OPENS_AT.
// Centred around the THE 100 MINUTE BET neon photo, with:
//   - a soft pink-neon flicker pulse overlaying the sign (the "lights are
//     still being wired up" feel)
//   - drifting low fog at the bottom
//   - a dust haze across the whole image
//   - a tilted "PARDON OUR DUST" tarp partially covering the top corner
// No signup. Easter egg: type c-h-i-p-s to flip on a secret sticker.

type Props = {
  // ISO string for when the real landing page opens.
  opensAtISO: string;
};

function diff(target: Date, now: Date) {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((ms / (1000 * 60)) % 60);
  const secs = Math.floor((ms / 1000) % 60);
  return { days, hours, mins, secs, done: ms === 0 };
}

const SECRET = "chips";

export function HoldingPage({ opensAtISO }: Props) {
  const target = useMemo(() => new Date(opensAtISO), [opensAtISO]);

  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const bufferRef = useRef("");
  const [secret, setSecret] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key.length !== 1) return;
      bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(
        -SECRET.length
      );
      if (bufferRef.current === SECRET) {
        setSecret((s) => !s);
        bufferRef.current = "";
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const t = mounted ? diff(target, now) : null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--felt)",
        color: "var(--paper)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "32px 24px 48px",
        textAlign: "center",
      }}
    >
      {/* Felt texture overlay over the whole page */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "8px 8px",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Tiny top-of-page line */}
      <div
        style={{
          position: "relative",
          fontSize: 11,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--gold)",
          marginBottom: 18,
          zIndex: 3,
        }}
      >
        chips.zoedew.com
      </div>

      {/* THE SIGN: the photo + flicker + dust + fog + tarp, all layered. */}
      <div className="sign-stage">
        {/* The actual sign photo */}
        <Image
          src="/sign.jpg"
          alt="The 100 Minute Bet neon sign"
          width={1672}
          height={941}
          priority
          className="sign-photo"
        />

        {/* Flicker pulse: a subtle hot-pink wash that pulses on/off in
            irregular bursts. Sits on top of the sign image, blends in.
            This gives the "lights warming up" effect without obscuring
            the photo's own glow. */}
        <div className="flicker-layer" aria-hidden />

        {/* Dust haze: a faint speckle + warm wash across the whole photo. */}
        <div className="dust-layer" aria-hidden />

        {/* Drifting low fog at the bottom of the sign. */}
        <div className="fog-layer fog-layer--a" aria-hidden />
        <div className="fog-layer fog-layer--b" aria-hidden />

        {/* Tarp covers a small portion in the top-left corner */}
        <div className="tarp" aria-hidden>
          <div className="tarp-stamp">PARDON OUR DUST</div>
        </div>
        <div className="tape tape--corner" aria-hidden />
      </div>

      <div
        style={{
          position: "relative",
          marginTop: 24,
          fontSize: 13,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "var(--paper)",
          opacity: 0.85,
          zIndex: 3,
        }}
      >
        the sign isn&apos;t finished yet
      </div>

      {/* Countdown */}
      <div
        style={{
          position: "relative",
          marginTop: 28,
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          justifyContent: "center",
          zIndex: 3,
        }}
      >
        {[
          { label: "days", value: t?.days },
          { label: "hours", value: t?.hours },
          { label: "mins", value: t?.mins },
          { label: "secs", value: t?.secs },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              minWidth: 80,
              padding: "10px 14px",
              background: "rgba(0,0,0,0.45)",
              border: "2px solid var(--pink)",
              borderRadius: 12,
              boxShadow: "0 0 12px rgba(241, 23, 135, 0.45)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-bricolage), sans-serif",
                fontWeight: 800,
                fontSize: 34,
                color: "var(--paper)",
                lineHeight: 1,
              }}
            >
              {mounted ? String(c.value).padStart(2, "0") : "--"}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 10,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--pink)",
              }}
            >
              {c.label}
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          position: "relative",
          marginTop: 28,
          fontSize: 18,
          maxWidth: 540,
          color: "var(--paper)",
          opacity: 0.95,
          zIndex: 3,
        }}
      >
        The house opens on{" "}
        <strong
          style={{
            color: "var(--pink)",
            textShadow: "0 0 12px rgba(241,23,135,0.55)",
          }}
        >
          8 June
        </strong>
        .
      </p>

      <div
        style={{
          position: "relative",
          marginTop: 36,
          fontSize: 11,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--paper)",
          opacity: 0.5,
          zIndex: 3,
        }}
      >
        zoe dew &nbsp;&middot;&nbsp; falling forwards
      </div>

      {secret ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%) rotate(-2deg)",
            background: "var(--pink)",
            color: "var(--paper)",
            border: "3px solid var(--ink)",
            boxShadow: "6px 6px 0 var(--ink)",
            padding: "10px 16px",
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            borderRadius: 8,
            zIndex: 20,
          }}
        >
          you found the chip. tell no one. see you 8 june.
        </div>
      ) : null}

      <style jsx>{`
        .sign-stage {
          position: relative;
          width: min(1080px, 94vw);
          aspect-ratio: 1672 / 941;
          margin: 0 auto;
          z-index: 2;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
        }
        :global(.sign-photo) {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          display: block;
        }

        /* Hot-pink flicker pulse over the sign. Blend mode "screen" so it
           brightens the existing pink rather than overlaying flat. */
        .flicker-layer {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            rgba(241, 23, 135, 0.35) 0%,
            rgba(241, 23, 135, 0.08) 45%,
            rgba(241, 23, 135, 0) 75%
          );
          mix-blend-mode: screen;
          animation: flickerPulse 5.4s infinite;
          pointer-events: none;
        }
        @keyframes flickerPulse {
          0%, 18%, 22%, 25%, 53%, 57%, 100% {
            opacity: 1;
          }
          20%, 24% {
            opacity: 0.35;
          }
          55% {
            opacity: 0.55;
          }
          80% {
            opacity: 0.85;
          }
          82% {
            opacity: 0.4;
          }
        }

        /* Dust haze: warm grey film + tiny speckle dots */
        .dust-layer {
          position: absolute;
          inset: 0;
          background-color: rgba(180, 160, 130, 0.06);
          background-image:
            radial-gradient(rgba(255, 240, 220, 0.06) 1px, transparent 1px),
            radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px);
          background-size: 4px 4px, 7px 7px;
          background-position: 0 0, 2px 3px;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        /* Drifting fog at the base of the sign. Two layers offset for depth. */
        .fog-layer {
          position: absolute;
          left: -20%;
          right: -20%;
          bottom: -10%;
          height: 55%;
          pointer-events: none;
          background: radial-gradient(
            ellipse at 50% 100%,
            rgba(255, 244, 250, 0.45) 0%,
            rgba(255, 244, 250, 0.18) 35%,
            rgba(255, 244, 250, 0) 70%
          );
          mix-blend-mode: screen;
          filter: blur(8px);
        }
        .fog-layer--a {
          animation: fogDriftA 18s ease-in-out infinite alternate;
        }
        .fog-layer--b {
          height: 38%;
          opacity: 0.65;
          animation: fogDriftB 26s ease-in-out infinite alternate;
        }
        @keyframes fogDriftA {
          0% {
            transform: translateX(-3%) translateY(0%);
          }
          100% {
            transform: translateX(3%) translateY(-2%);
          }
        }
        @keyframes fogDriftB {
          0% {
            transform: translateX(4%) translateY(1%);
          }
          100% {
            transform: translateX(-4%) translateY(-1%);
          }
        }

        /* Tarp covers the top-left corner of the sign. Tilted. Ragged edge. */
        .tarp {
          position: absolute;
          top: -16px;
          left: -24px;
          width: 38%;
          height: 36%;
          transform: rotate(-4deg);
          background:
            linear-gradient(
              135deg,
              rgba(0, 0, 0, 0.78),
              rgba(0, 0, 0, 0.78)
            ),
            repeating-linear-gradient(
              -45deg,
              var(--pink) 0 16px,
              var(--ink) 16px 32px
            );
          background-blend-mode: multiply;
          border-top: 4px solid var(--ink);
          border-left: 4px solid var(--ink);
          clip-path: polygon(
            0% 0%,
            100% 0%,
            100% 78%,
            94% 88%,
            87% 78%,
            80% 92%,
            72% 78%,
            65% 90%,
            58% 78%,
            50% 92%,
            42% 78%,
            34% 90%,
            27% 78%,
            22% 94%,
            16% 80%,
            8% 100%,
            0% 86%
          );
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tarp-stamp {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: clamp(11px, 1.8vw, 22px);
          letter-spacing: 0.18em;
          color: var(--pink);
          text-transform: uppercase;
          transform: rotate(4deg) translateY(-8px);
          border: 3px dashed var(--pink);
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.55);
          text-align: center;
          line-height: 1.1;
        }
        .tape--corner {
          position: absolute;
          top: -8px;
          left: 18%;
          width: 70px;
          height: 18px;
          background: rgba(220, 220, 220, 0.75);
          transform: rotate(-12deg);
          opacity: 0.85;
          mix-blend-mode: screen;
        }
      `}</style>
    </main>
  );
}
