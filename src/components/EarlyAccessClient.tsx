"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Marquee } from "@/components/Marquee";
import { Band } from "@/components/Band";
import { RegistrationForm } from "@/components/RegistrationForm";

const MARQUEE_ITEMS = [
  "EARLY ACCESS",
  "100 REPS CLUB",
  "PLACE YOUR BET",
  "22 - 29 JUNE 2026",
];

const STORAGE_KEY = "chips_early_unlocked";

export function EarlyAccessClient({ password }: { password: string }) {
  const [unlocked, setUnlocked] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Remember unlock so members don't have to retype.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") {
        setUnlocked(true);
      }
    } catch {
      // ignore
    }
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setError("Early access isn't configured yet.");
      return;
    }
    if (typed.trim().toLowerCase() === password.toLowerCase()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
      setUnlocked(true);
    } else {
      setError("Wrong password. Try again.");
    }
  }

  if (!unlocked) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--felt)",
          color: "var(--paper)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <form
          onSubmit={onSubmit}
          style={{
            width: "100%",
            maxWidth: 420,
            background: "var(--paper)",
            color: "var(--ink)",
            border: "4px solid var(--ink)",
            borderRadius: 18,
            padding: 24,
            boxShadow: "8px 8px 0 var(--ink)",
            textAlign: "center",
          }}
        >
          <Image
            src="/icons/poker-chip.png"
            alt=""
            width={72}
            height={72}
            style={{ margin: "0 auto 8px" }}
          />
          <h1
            style={{
              fontFamily: "var(--font-bricolage), sans-serif",
              fontWeight: 800,
              fontSize: 28,
              margin: "8px 0 4px",
            }}
          >
            100 Reps Club early access
          </h1>
          <p style={{ margin: "0 0 18px", opacity: 0.8 }}>
            Members only. Enter the password Zoë sent you.
          </p>
          <input
            type="text"
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              setError(null);
            }}
            placeholder="password"
            autoFocus
            autoComplete="off"
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "3px solid var(--ink)",
              borderRadius: 10,
              fontSize: 18,
              fontFamily: "var(--font-bricolage), sans-serif",
              fontWeight: 500,
              background: "var(--pink-soft)",
              color: "var(--ink)",
              outline: "none",
            }}
          />
          {error ? (
            <p style={{ color: "var(--red-deep)", marginTop: 10, fontSize: 14 }}>
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn"
            style={{ marginTop: 16, width: "100%" }}
          >
            Unlock →
          </button>
          <p
            style={{
              marginTop: 16,
              fontSize: 12,
              opacity: 0.6,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            chips.zoedew.com / early
          </p>
        </form>
      </main>
    );
  }

  // Unlocked: show a slimmer version of the hero with the form.
  return (
    <main>
      <Marquee items={MARQUEE_ITEMS} />

      <Band color="pink">
        <div className="two-col">
          <div>
            <span className="pill-badge">100 REPS CLUB EARLY ACCESS</span>
            <h1 className="split-head split-head--hero">
              <span className="line-a">You&apos;re in the door early.</span>
              <span className="line-b">Place your bet now.</span>
            </h1>
            <p className="band-sub">
              Same bet. Same rules. Same casino party Sunday 29 June. The
              public link opens 8 June.
            </p>
            <p className="band-sub" style={{ marginTop: -8 }}>
              22 - 29 June 2026. Free to enter.
            </p>
          </div>
          <div id="get-in">
            <RegistrationForm earlyAccessPassword={password} />
          </div>
        </div>
      </Band>
    </main>
  );
}
