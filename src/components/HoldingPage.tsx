"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Casino-sign holding page. Shows before NEXT_PUBLIC_LANDING_OPENS_AT.
// No signup. Neon flicker. Live countdown to 8 June.
// Easter egg: type the letters c-h-i-p-s anywhere on the page to flip on a
// secret message. Type it again to flip it off. Purely client-side, just for
// fun, no backend, no auth.

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

  // Avoid hydration mismatch: render placeholder until mounted.
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Easter egg: capture the last few typed keys.
  const bufferRef = useRef("");
  const [secret, setSecret] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore typing inside inputs (none here, but be safe).
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
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      {/* Felt texture overlay */}
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

      {/* Top tiny line */}
      <div
        style={{
          position: "relative",
          fontSize: 11,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--gold)",
          marginBottom: 24,
        }}
      >
        chips.zoedew.com
      </div>

      {/* The neon CHIPS sign */}
      <h1
        className="neon-sign"
        style={{
          position: "relative",
          fontFamily: "var(--font-bricolage), sans-serif",
          fontWeight: 800,
          fontSize: "clamp(96px, 22vw, 280px)",
          lineHeight: 0.9,
          letterSpacing: "-0.04em",
          margin: 0,
        }}
      >
        CHIPS
      </h1>

      <div
        style={{
          position: "relative",
          marginTop: 8,
          fontSize: 14,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "var(--paper)",
          opacity: 0.9,
        }}
      >
        coming soon
      </div>

      {/* Countdown */}
      <div
        style={{
          position: "relative",
          marginTop: 48,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
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
          marginTop: 40,
          fontSize: 18,
          maxWidth: 540,
          color: "var(--paper)",
          opacity: 0.92,
        }}
      >
        Something is being built behind these doors. <br />
        The house opens on{" "}
        <strong style={{ color: "var(--yellow)" }}>8 June</strong>.
      </p>

      {/* Tiny sign-off */}
      <div
        style={{
          position: "relative",
          marginTop: 56,
          fontSize: 11,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--paper)",
          opacity: 0.55,
        }}
      >
        zoe dew &nbsp;&middot;&nbsp; falling forwards
      </div>

      {/* The Easter egg. Only visible after the secret is typed. */}
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
        .neon-sign {
          color: var(--paper);
          text-shadow:
            0 0 4px var(--paper),
            0 0 12px var(--pink),
            0 0 28px var(--pink),
            0 0 60px var(--pink),
            0 0 90px rgba(241, 23, 135, 0.65);
          animation: flicker 5s infinite;
        }

        @keyframes flicker {
          0%, 18%, 22%, 25%, 53%, 57%, 100% {
            opacity: 1;
            text-shadow:
              0 0 4px var(--paper),
              0 0 12px var(--pink),
              0 0 28px var(--pink),
              0 0 60px var(--pink),
              0 0 90px rgba(241, 23, 135, 0.65);
          }
          20%, 24%, 55% {
            opacity: 0.45;
            text-shadow: none;
          }
        }
      `}</style>
    </main>
  );
}
