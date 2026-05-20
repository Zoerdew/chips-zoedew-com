import type { ScratchOutcome } from "./airtable";

// Weighted prize roll for a scratch card. Per the brief:
//   40%  No win
//   30%  1 bonus chip
//   7.5% 10% off Dig Your Data
//   7.5% 10% off Lead Tracker
//   10%  Free resource
//   5%   2 bonus chips
const WEIGHTS: Array<{ outcome: ScratchOutcome; weight: number }> = [
  { outcome: "No win", weight: 40 },
  { outcome: "1 bonus chip", weight: 30 },
  { outcome: "10% off Dig Your Data", weight: 7.5 },
  { outcome: "10% off Lead Tracker", weight: 7.5 },
  { outcome: "Free resource", weight: 10 },
  { outcome: "2 bonus chips", weight: 5 },
];

const TIER: Record<ScratchOutcome, string> = {
  "No win": "No win",
  "1 bonus chip": "Bonus chip",
  "10% off Dig Your Data": "Discount",
  "10% off Lead Tracker": "Discount",
  "Free resource": "Free resource",
  "2 bonus chips": "Mini jackpot",
};

const FREE_RESOURCES = [
  "Cardinal Rules PDF",
  "Pitch Skeleton",
  "Lead Tracker Template (Lite)",
  "Sales Calendar Template",
];

export type RolledPrize = {
  outcome: ScratchOutcome;
  tier: string;
  chipsAwarded: number; // 0, 1 or 2
  discountCode?: string;
  freeResource?: string;
};

function makeDiscountCode(): string {
  // Short, readable, unique-enough for an activation.
  const n = Math.floor(1000 + Math.random() * 9000);
  return `BET10-${n}`;
}

export function rollScratchPrize(): RolledPrize {
  const total = WEIGHTS.reduce((sum, w) => sum + w.weight, 0);
  let r = Math.random() * total;
  let outcome: ScratchOutcome = "No win";
  for (const w of WEIGHTS) {
    if (r < w.weight) {
      outcome = w.outcome;
      break;
    }
    r -= w.weight;
  }

  const tier = TIER[outcome];
  const prize: RolledPrize = { outcome, tier, chipsAwarded: 0 };

  if (outcome === "1 bonus chip") prize.chipsAwarded = 1;
  if (outcome === "2 bonus chips") prize.chipsAwarded = 2;
  if (outcome === "10% off Dig Your Data" || outcome === "10% off Lead Tracker") {
    prize.discountCode = makeDiscountCode();
  }
  if (outcome === "Free resource") {
    prize.freeResource =
      FREE_RESOURCES[Math.floor(Math.random() * FREE_RESOURCES.length)];
  }

  return prize;
}
