"use client";

import Image from "next/image";
import { useState } from "react";
import { deal, type DealResult } from "@/lib/dealMeARep";

// Deal Me A Rep — pink WHO deck + yellow ACTION deck, two cards face down.
// Click "Deal me a rep" → quick deal animation → both cards flip face up
// → combined sentence shows underneath. "Deal again" deals a fresh pair,
// dedupes against the last result so the next deal can't repeat exactly.
// No backend, no analytics, no chip mechanic. Pure inspiration.

const FLIP_MS = 700;
const SHUFFLE_MS = 650;

export function DealMeARep() {
  const [result, setResult] = useState<DealResult | null>(null);
  const [phase, setPhase] = useState<"idle" | "shuffling" | "showing">(
    "idle"
  );

  function onDeal() {
    if (phase === "shuffling") return;
    setPhase("shuffling");
    const next = deal(result);
    // Hold the back-of-card animation briefly, then reveal.
    window.setTimeout(() => {
      setResult(next);
      setPhase("showing");
    }, SHUFFLE_MS);
  }

  const revealed = phase === "showing" && result !== null;
  const shuffling = phase === "shuffling";

  return (
    <div className="dmr">
      <div className="dmr__head">
        <span className="dmr__pill">DEAL ME A REP</span>
        <h2 className="dmr__title">
          Can&apos;t choose what to do? Let the deck decide.
        </h2>
        <p className="dmr__sub">
          Two decks. One rep. Stop scrolling, start sending.
        </p>
      </div>

      <div className="dmr__cards">
        <div
          className={`dmr__card dmr__card--who${revealed ? " dmr__card--revealed" : ""}${shuffling ? " dmr__card--shuffling" : ""}`}
        >
          <div className="dmr__card-inner">
            <div className="dmr__card-face dmr__card-face--back">
              <Image
                src="/cards/back-who.png"
                alt="WHO deck"
                width={600}
                height={800}
                priority
              />
            </div>
            <div className="dmr__card-face dmr__card-face--front">
              {result ? (
                <Image
                  src={`/cards/who/${result.who.slug}.png`}
                  alt={result.who.label}
                  width={600}
                  height={800}
                  priority
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="dmr__plus" aria-hidden>
          +
        </div>

        <div
          className={`dmr__card dmr__card--action${revealed ? " dmr__card--revealed" : ""}${shuffling ? " dmr__card--shuffling" : ""}`}
        >
          <div className="dmr__card-inner">
            <div className="dmr__card-face dmr__card-face--back">
              <Image
                src="/cards/back-action.png"
                alt="ACTION deck"
                width={600}
                height={800}
                priority
              />
            </div>
            <div className="dmr__card-face dmr__card-face--front">
              {result ? (
                <Image
                  src={`/cards/action/${result.action.slug}.png`}
                  alt={result.action.label}
                  width={600}
                  height={800}
                  priority
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="dmr__reveal" aria-live="polite">
        {revealed && result ? (
          <p className="dmr__sentence">{result.sentence}</p>
        ) : (
          <p className="dmr__sentence dmr__sentence--muted">
            Hit the button. The deck picks. You do the rep.
          </p>
        )}
      </div>

      <div className="dmr__actions">
        <button
          type="button"
          className="dmr__btn dmr__btn--primary"
          onClick={onDeal}
          disabled={shuffling}
        >
          {shuffling
            ? "Dealing..."
            : revealed
            ? "Deal again"
            : "Deal me a rep"}
        </button>
      </div>

      <style jsx>{`
        .dmr {
          background: var(--paper);
          border: 4px solid var(--ink);
          border-radius: 18px;
          box-shadow: 8px 8px 0 var(--ink);
          padding: 22px 22px 26px;
        }
        .dmr__head {
          text-align: center;
          margin-bottom: 22px;
        }
        .dmr__pill {
          display: inline-block;
          background: var(--ink);
          color: var(--paper);
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.22em;
          padding: 5px 12px;
          border-radius: 999px;
        }
        .dmr__title {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: clamp(22px, 3.4vw, 30px);
          letter-spacing: -0.01em;
          color: var(--ink);
          margin: 10px 0 6px;
          line-height: 1.1;
        }
        .dmr__sub {
          margin: 0;
          font-size: 14px;
          color: var(--ink);
          opacity: 0.75;
        }

        .dmr__cards {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 8px 0 18px;
        }
        .dmr__plus {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: 30px;
          color: var(--ink);
        }
        .dmr__card {
          width: clamp(120px, 22vw, 200px);
          aspect-ratio: 3 / 4;
          perspective: 1200px;
          position: relative;
        }
        .dmr__card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform ${FLIP_MS}ms cubic-bezier(0.3, 0.8, 0.4, 1);
          transform: rotateY(0deg);
        }
        .dmr__card--revealed .dmr__card-inner {
          transform: rotateY(180deg);
        }
        .dmr__card-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 14px;
          overflow: hidden;
          border: 3px solid var(--ink);
          box-shadow: 4px 4px 0 var(--ink);
        }
        .dmr__card-face--front {
          transform: rotateY(180deg);
          background: var(--paper);
        }
        .dmr__card-face :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        /* Shuffle-shake on the deck before the flip */
        .dmr__card--shuffling .dmr__card-inner {
          animation: shuffle 0.55s ease-in-out;
        }
        @keyframes shuffle {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-4px, -2px) rotate(-2deg); }
          40% { transform: translate(4px, 1px) rotate(2deg); }
          60% { transform: translate(-3px, 2px) rotate(-1.5deg); }
          80% { transform: translate(2px, -1px) rotate(1deg); }
        }

        .dmr__reveal {
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 6px;
          margin-bottom: 14px;
        }
        .dmr__sentence {
          margin: 0;
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: clamp(18px, 2.6vw, 24px);
          line-height: 1.25;
          color: var(--ink);
          text-align: center;
          max-width: 560px;
        }
        .dmr__sentence--muted {
          font-weight: 500;
          opacity: 0.55;
          font-style: italic;
        }

        .dmr__actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .dmr__btn {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 12px 22px;
          border-radius: 999px;
          border: 3px solid var(--ink);
          cursor: pointer;
          box-shadow: 4px 4px 0 var(--ink);
          transition:
            transform 0.08s ease,
            box-shadow 0.08s ease;
        }
        .dmr__btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 5px 5px 0 var(--ink);
        }
        .dmr__btn:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 var(--ink);
        }
        .dmr__btn:disabled {
          cursor: wait;
          opacity: 0.7;
        }
        .dmr__btn--primary {
          background: var(--pink);
          color: var(--paper);
        }
      `}</style>
    </div>
  );
}
