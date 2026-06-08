"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// Mini fruit machine for the landing page. Three reels, six possible
// outcomes, each one reveals a one-line explainer for that piece of
// the bet. Re-spinnable.
// No money/chip mechanic — purely a fun way to surface what's inside.

type Reveal = {
  key: string;
  icon: string; // path under /icons/
  label: string;
  blurb: string;
};

const REVEALS: Reveal[] = [
  {
    key: "chip",
    icon: "/icons/poker-chip.png",
    label: "Chips",
    blurb:
      "Every rep you log is worth a chip. The more reps, the bigger the pile.",
  },
  {
    key: "scratch",
    icon: "/icons/scratch-card.png",
    label: "Scratch cards",
    blurb:
      "Every 25 minutes of activity, you earn a scratch card. Scratch it for a surprise.",
  },
  {
    key: "fruit",
    icon: "/icons/fruit-machine.png",
    label: "Fruit machine",
    blurb:
      "Spend chips at the casino party on the 29th. Real prizes. Real lever pull.",
  },
  {
    key: "trophy",
    icon: "/icons/trophy.png",
    label: "Leaderboard",
    blurb:
      "See who is winning, who is catching up, and where you stand all week.",
  },
  {
    key: "stopclock",
    icon: "/icons/stopclock.png",
    label: "100 minutes",
    blurb:
      "The bet: 100 minutes of sales activity in one week. That is the whole game.",
  },
  {
    key: "stack",
    icon: "/icons/poker-stack.png",
    label: "Casino party",
    blurb:
      "Monday 29 June, 7pm. Cash your chips. Pop the cart. The 100 Reps Club opens.",
  },
];

function pickRandom(): Reveal {
  return REVEALS[Math.floor(Math.random() * REVEALS.length)];
}

export function MiniFruitMachine() {
  const [reels, setReels] = useState<Reveal[]>([
    REVEALS[0],
    REVEALS[2],
    REVEALS[4],
  ]);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState<Reveal | null>(null);
  const lockRef = useRef(false);

  function spin() {
    if (lockRef.current) return;
    lockRef.current = true;
    setSpinning(true);
    setRevealed(null);

    // The "result" is what reel #2 (middle) lands on — that's what gets
    // revealed. The other two reels are just for show.
    const finalLeft = pickRandom();
    const finalMid = pickRandom();
    const finalRight = pickRandom();

    // Rapid-fire reel changes during the spin
    let ticks = 0;
    const interval = setInterval(() => {
      setReels([pickRandom(), pickRandom(), pickRandom()]);
      ticks += 1;
      if (ticks > 14) {
        clearInterval(interval);
        setReels([finalLeft, finalMid, finalRight]);
        setSpinning(false);
        setRevealed(finalMid);
        lockRef.current = false;
      }
    }, 90);
  }

  return (
    <div className="mini-fm">
      <div className="mini-fm__cabinet">
        {/* Sign at the top of the cabinet */}
        <div className="mini-fm__sign">
          {revealed ? revealed.label.toUpperCase() : "PULL THE LEVER"}
        </div>

        {/* The three reels */}
        <div className="mini-fm__reels">
          {reels.map((r, i) => (
            <div key={i} className={`mini-fm__reel${spinning ? " mini-fm__reel--spin" : ""}`}>
              <Image
                src={r.icon}
                alt={r.label}
                width={96}
                height={96}
                priority={false}
              />
            </div>
          ))}
        </div>

        {/* Spin button styled like a chunky casino button */}
        <button
          type="button"
          className="mini-fm__btn"
          onClick={spin}
          disabled={spinning}
        >
          {spinning ? "Spinning..." : revealed ? "Spin again" : "Spin"}
        </button>
      </div>

      {/* Reveal panel */}
      <div className="mini-fm__reveal" aria-live="polite">
        {revealed ? (
          <>
            <div className="mini-fm__reveal-label">{revealed.label}</div>
            <p className="mini-fm__reveal-blurb">{revealed.blurb}</p>
          </>
        ) : (
          <p className="mini-fm__reveal-blurb mini-fm__reveal-blurb--muted">
            Spin to peek behind one of the doors.
          </p>
        )}
      </div>

      <style jsx>{`
        .mini-fm {
          display: grid;
          grid-template-columns: minmax(280px, 380px) 1fr;
          gap: 28px;
          align-items: center;
          max-width: 900px;
          margin: 0 auto;
        }
        @media (max-width: 720px) {
          .mini-fm {
            grid-template-columns: 1fr;
            gap: 18px;
          }
        }

        .mini-fm__cabinet {
          background: var(--felt);
          border: 4px solid var(--ink);
          border-radius: 18px;
          padding: 18px 18px 22px;
          box-shadow: 8px 8px 0 var(--ink), 0 0 30px rgba(241, 23, 135, 0.35);
          color: var(--paper);
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: stretch;
        }

        .mini-fm__sign {
          background: var(--ink);
          color: var(--pink);
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-align: center;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 14px;
          text-shadow: 0 0 8px rgba(241, 23, 135, 0.6);
          min-height: 22px;
        }

        .mini-fm__reels {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .mini-fm__reel {
          background: var(--paper);
          border: 3px solid var(--ink);
          border-radius: 10px;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 8px;
        }
        .mini-fm__reel :global(img) {
          width: 100%;
          height: auto;
          object-fit: contain;
        }
        .mini-fm__reel--spin :global(img) {
          animation: reelBlur 90ms linear infinite;
          filter: blur(0.5px);
        }
        @keyframes reelBlur {
          0%, 100% { transform: translateY(-6%); }
          50% { transform: translateY(6%); }
        }

        .mini-fm__btn {
          background: var(--pink);
          color: var(--paper);
          border: 3px solid var(--ink);
          border-radius: 999px;
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 12px 18px;
          cursor: pointer;
          box-shadow: 4px 4px 0 var(--ink);
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
        .mini-fm__btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 5px 5px 0 var(--ink);
        }
        .mini-fm__btn:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 var(--ink);
        }
        .mini-fm__btn:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .mini-fm__reveal {
          padding: 8px 0;
        }
        .mini-fm__reveal-label {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: clamp(24px, 3vw, 36px);
          color: var(--ink);
          letter-spacing: -0.01em;
          margin-bottom: 8px;
        }
        .mini-fm__reveal-blurb {
          font-size: 18px;
          line-height: 1.5;
          color: var(--ink);
          margin: 0;
        }
        .mini-fm__reveal-blurb--muted {
          color: var(--ink);
          opacity: 0.6;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
