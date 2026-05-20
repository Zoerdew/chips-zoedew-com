// Bet timing. NEXT_PUBLIC_ vars are inlined at build time, so this module
// works in both server components and client components.

const BET_OPENS_AT =
  process.env.NEXT_PUBLIC_BET_OPENS_AT ?? "2026-06-22T00:00:00+01:00";
const LOGGING_CLOSES_AT =
  process.env.NEXT_PUBLIC_LOGGING_CLOSES_AT ?? "2026-06-28T23:59:59+01:00";
const PARTY_OPENS_AT =
  process.env.NEXT_PUBLIC_PARTY_OPENS_AT ?? "2026-06-29T18:45:00+01:00";
const FRUIT_MACHINE_UNLOCKS_AT =
  process.env.NEXT_PUBLIC_FRUIT_MACHINE_UNLOCKS_AT ??
  "2026-06-29T19:00:00+01:00";
const SHOP_OPENS_AT =
  process.env.NEXT_PUBLIC_SHOP_OPENS_AT ?? "2026-06-29T19:00:00+01:00";

export const betTiming = {
  opensAt: new Date(BET_OPENS_AT),
  loggingClosesAt: new Date(LOGGING_CLOSES_AT),
  partyOpensAt: new Date(PARTY_OPENS_AT),
  fruitMachineUnlocksAt: new Date(FRUIT_MACHINE_UNLOCKS_AT),
  shopOpensAt: new Date(SHOP_OPENS_AT),
};

export type BetPhase = "before" | "open" | "logging-closed";

export function getBetPhase(now: Date = new Date()): BetPhase {
  if (now < betTiming.opensAt) return "before";
  if (now <= betTiming.loggingClosesAt) return "open";
  return "logging-closed";
}

export function isLoggingOpen(now: Date = new Date()): boolean {
  return getBetPhase(now) === "open";
}

export function isFruitMachineUnlocked(now: Date = new Date()): boolean {
  return now >= betTiming.fruitMachineUnlocksAt;
}

// The party room (Meet link + cart) opens a little before the machine.
export function isPartyOpen(now: Date = new Date()): boolean {
  return now >= betTiming.partyOpensAt;
}

// Whether the shop's TIME gate has passed. The shop also needs the
// SHOP_OPEN flag (see shopItems.ts) — both must be satisfied.
export function isShopTimeReached(now: Date = new Date()): boolean {
  return now >= betTiming.shopOpensAt;
}

// ISO strings for passing to client components without serialising Date objects.
export const betTimingISO = {
  opensAt: betTiming.opensAt.toISOString(),
  loggingClosesAt: betTiming.loggingClosesAt.toISOString(),
  partyOpensAt: betTiming.partyOpensAt.toISOString(),
  fruitMachineUnlocksAt: betTiming.fruitMachineUnlocksAt.toISOString(),
  shopOpensAt: betTiming.shopOpensAt.toISOString(),
};
