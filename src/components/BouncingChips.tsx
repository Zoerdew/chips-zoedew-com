"use client";

import Image from "next/image";

// Three poker chips drop from above and settle into a small stack.
// CSS keyframes only. Runs once on first paint.

export function BouncingChips() {
  return (
    <div className="bouncing-chips" aria-hidden>
      <div className="chip chip--1">
        <Image src="/icons/poker-chip.png" alt="" width={90} height={90} priority />
      </div>
      <div className="chip chip--2">
        <Image src="/icons/poker-chip.png" alt="" width={90} height={90} priority />
      </div>
      <div className="chip chip--3">
        <Image src="/icons/poker-chip.png" alt="" width={90} height={90} priority />
      </div>

      <style jsx>{`
        .bouncing-chips {
          position: relative;
          width: 220px;
          height: 140px;
          margin: 0 auto;
        }
        .chip {
          position: absolute;
          bottom: 0;
          opacity: 0;
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }
        .chip :global(img) {
          display: block;
          width: 90px;
          height: 90px;
          /* slight drop shadow that we keep simple */
          filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25));
        }
        .chip--1 {
          left: 18px;
          animation: drop 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards;
        }
        .chip--2 {
          left: 64px;
          bottom: 14px;
          animation: drop 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s forwards;
        }
        .chip--3 {
          left: 110px;
          bottom: 28px;
          animation: drop 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.55s forwards;
        }

        @keyframes drop {
          0% {
            transform: translateY(-260px) rotate(-22deg);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          60% {
            transform: translateY(0) rotate(2deg);
            opacity: 1;
          }
          75% {
            transform: translateY(-22px) rotate(-1deg) scaleY(0.96);
          }
          88% {
            transform: translateY(0) rotate(0deg) scaleY(1);
          }
          94% {
            transform: translateY(-7px) scaleY(0.99);
          }
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .chip {
            opacity: 1;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
