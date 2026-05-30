"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Casino-sign holding page. Shows before NEXT_PUBLIC_LANDING_OPENS_AT.
// A big "WELCOME TO THE 100 MINUTE BET" neon sign, half-covered by a tilted
// construction tarp, with individual letters flickering at different rhythms
// like dying neon. No signup, no form.
// Easter egg: type the letters c-h-i-p-s anywhere on the page to flip on a
// secret message. Type it again to flip it off.

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

// Sign content split into two lines, top covered by tarp, bottom visible.
// Each letter gets its own flicker delay so the failures feel random.
const LINE_TOP = "WELCOME TO THE";
const LINE_BOTTOM = "100 MINUTE BET";

// Which character indices in the bottom line flicker. Others stay solid.
// Index counts spaces too.
const FLICKER_INDICES_BOTTOM = new Set([0, 4, 7, 11, 13]);
const FLICKER_INDICES_TOP = new Set([2, 6, 9, 12]);

export function HoldingPage({ opensAtISO }: Props) {
  const target = useMemo(() => new Date(opensAtISO), [opensAtISO]);

  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Easter egg: capture last typed keys.
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

  function renderLetter(ch: string, i: number, flickerSet: Set<number>) {
    if (ch === " ") return <span key={i}>&nbsp;&nbsp;</span>;
    const flickers = flickerSet.has(i);
    // Give each flickering letter a different delay so it looks chaotic.
    const delay = `${(i * 0.37) % 4.2}s`;
    return (
      <span
        key={i}
        className={flickers ? "letter flicker" : "letter"}
        style={flickers ? ({ animationDelay: delay } as React.CSSProperties) : undefined}
      >
        {ch}
      </span>
    );
  }

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
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      {/* Felt dot texture */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "8px 8px",
          pointerEvents: "none",
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
          marginBottom: 24,
          zIndex: 2,
        }}
      >
        chips.zoedew.com
      </div>

      {/* THE SIGN: a frame containing two neon lines, with a tarp diagonally
          covering the top half. */}
      <div className="sign-wrap" style={{ position: "relative", zIndex: 1 }}>
        <div className="sign">
          <div className="sign-line sign-line--top" aria-label="WELCOME TO THE">
            {LINE_TOP.split("").map((c, i) =>
              renderLetter(c, i, FLICKER_INDICES_TOP)
            )}
          </div>
          <div
            className="sign-line sign-line--bottom"
            aria-label="100 MINUTE BET"
          >
            {LINE_BOTTOM.split("").map((c, i) =>
              renderLetter(c, i, FLICKER_INDICES_BOTTOM)
            )}
          </div>
        </div>

        {/* Tarp covering the top half. Tilted slightly. Ragged bottom edge. */}
        <div className="tarp" aria-hidden>
          <div className="tarp-stamp">PARDON OUR DUST</div>
        </div>
        {/* Bits of gaffer tape holding the tarp up */}
        <div className="tape tape--left" aria-hidden />
        <div className="tape tape--right" aria-hidden />
      </div>

      <div
        style={{
          position: "relative",
          marginTop: 28,
          fontSize: 14,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "var(--paper)",
          opacity: 0.9,
          zIndex: 2,
        }}
      >
        the sign isn't finished yet
      </div>

      {/* Countdown */}
      <div
        style={{
          position: "relative",
          marginTop: 40,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
          zIndex: 2,
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
              minWidth: 84,
              padding: "12px 14px",
              background: "rgba(0,0,0,0.35)",
              border: "2px solid var(--gold)",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-bricolage), sans-serif",
                fontWeight: 800,
                fontSize: 36,
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
                color: "var(--gold)",
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
          marginTop: 32,
          fontSize: 18,
          maxWidth: 540,
          color: "var(--paper)",
          opacity: 0.92,
          zIndex: 2,
        }}
      >
        The house opens on{" "}
        <strong style={{ color: "var(--yellow)" }}>8 June</strong>.
      </p>

      <div
        style={{
          position: "relative",
          marginTop: 48,
          fontSize: 11,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--paper)",
          opacity: 0.55,
          zIndex: 2,
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
            background: "var(--yellow)",
            color: "var(--ink)",
            border: "3px solid var(--ink)",
            boxShadow: "6px 6px 0 var(--ink)",
            padding: "10px 16px",
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            borderRadius: 8,
            zIndex: 10,
          }}
        >
          you found the chip. tell no one. see you 8 june.
        </div>
      ) : null}

      <style jsx>{`
        .sign-wrap {
          width: min(900px, 92vw);
          padding: 28px 28px 36px;
          border: 3px solid var(--gold);
          border-radius: 16px;
          background: rgba(0, 0, 0, 0.32);
          box-shadow:
            inset 0 0 60px rgba(0, 0, 0, 0.5),
            0 12px 40px rgba(0, 0, 0, 0.5);
        }
        .sign {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          line-height: 0.92;
          letter-spacing: -0.02em;
          color: var(--paper);
        }
        .sign-line--top {
          font-size: clamp(36px, 7vw, 92px);
          margin-bottom: 8px;
        }
        .sign-line--bottom {
          font-size: clamp(60px, 13vw, 168px);
        }
        .letter {
          display: inline-block;
          color: var(--paper);
          text-shadow:
            0 0 4px var(--paper),
            0 0 12px var(--pink),
            0 0 28px var(--pink),
            0 0 60px rgba(241, 23, 135, 0.75);
        }
        .letter.flicker {
          animation: flickerLetter 4.6s infinite;
          will-change: opacity, text-shadow;
        }
        @keyframes flickerLetter {
          0%, 92%, 100% {
            opacity: 1;
            text-shadow:
              0 0 4px var(--paper),
              0 0 12px var(--pink),
              0 0 28px var(--pink),
              0 0 60px rgba(241, 23, 135, 0.75);
          }
          93%, 95% {
            opacity: 0.18;
            text-shadow: none;
          }
          94% {
            opacity: 1;
            text-shadow:
              0 0 6px var(--paper),
              0 0 18px var(--pink);
          }
          96%, 99% {
            opacity: 0.25;
            text-shadow: none;
          }
        }

        /* Tarp covers the top portion of the sign. Slightly tilted.
           Built from a striped warning-tape gradient + a darker base. */
        .tarp {
          position: absolute;
          top: -22px;
          left: -28px;
          right: -28px;
          height: 46%;
          transform: rotate(-2.6deg);
          background:
            linear-gradient(
              135deg,
              rgba(0, 0, 0, 0.78),
              rgba(0, 0, 0, 0.78)
            ),
            repeating-linear-gradient(
              -45deg,
              var(--yellow) 0 18px,
              var(--ink) 18px 36px
            );
          background-blend-mode: multiply;
          border-top: 4px solid var(--ink);
          /* Ragged bottom edge using a pointy clip-path */
          clip-path: polygon(
            0% 0%,
            100% 0%,
            100% 86%,
            96% 92%,
            92% 84%,
            88% 94%,
            83% 86%,
            78% 96%,
            73% 86%,
            68% 94%,
            62% 86%,
            56% 95%,
            51% 86%,
            46% 94%,
            41% 86%,
            36% 95%,
            30% 86%,
            24% 94%,
            18% 86%,
            12% 96%,
            7% 86%,
            3% 94%,
            0% 88%
          );
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tarp-stamp {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: clamp(18px, 3.4vw, 38px);
          letter-spacing: 0.18em;
          color: var(--yellow);
          text-transform: uppercase;
          transform: rotate(2.6deg) translateY(-6px);
          border: 3px dashed var(--yellow);
          padding: 8px 18px;
          background: rgba(0, 0, 0, 0.5);
        }
        .tape {
          position: absolute;
          top: -32px;
          width: 80px;
          height: 24px;
          background: rgba(220, 220, 220, 0.75);
          transform: rotate(-8deg);
          opacity: 0.85;
          mix-blend-mode: screen;
        }
        .tape--left {
          left: 12%;
        }
        .tape--right {
          right: 12%;
          transform: rotate(8deg);
        }
      `}</style>
    </main>
  );
}
