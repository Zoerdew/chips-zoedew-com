// Bet timing. NEXT_PUBLIC_ vars are inlined at build time, so this module
// works in both server components and client components.

const LANDING_OPENS_AT =
  process.env.NEXT_PUBLIC_LANDING_OPENS_AT ?? "2026-06-08T00:00:00+01:00";
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
// The casino closes at midnight on the night of the party. After this
// time, both the fruit machine and the shop refuse new spins / purchases.
// Override on Vercel by setting NEXT_PUBLIC_CASINO_CLOSES_AT if needed.
const CASINO_CLOSES_AT =
  process.env.NEXT_PUBLIC_CASINO_CLOSES_AT ?? "2026-06-30T00:00:00+01:00";

export const betTiming = {
  landingOpensAt: new Date(LANDING_OPENS_AT),
  opensAt: new Date(BET_OPENS_AT),
  loggingClosesAt: new Date(LOGGING_CLOSES_AT),
  partyOpensAt: new Date(PARTY_OPENS_AT),
  fruitMachineUnlocksAt: new Date(FRUIT_MACHINE_UNLOCKS_AT),
  shopOpensAt: new Date(SHOP_OPENS_AT),
  casinoClosesAt: new Date(CASINO_CLOSES_AT),
};

// Whether the public landing page (and registration) is live.
// Before this, chips.zoedew.com shows the holding page and the register
// API returns a 503. Override on Vercel by setting NEXT_PUBLIC_LANDING_OPENS_AT.
export function isLandingPublic(now: Date = new Date()): boolean {
  return now >= betTiming.landingOpensAt;
}

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
  return (
    now >= betTiming.fruitMachineUnlocksAt && now < betTiming.casinoClosesAt
  );
}

// The party room (Meet link + cart) opens a little before the machine.
export function isPartyOpen(now: Date = new Date()): boolean {
  return now >= betTiming.partyOpensAt;
}

// Whether the shop's TIME gate has passed. The shop also needs the
// SHOP_OPEN flag (see shopItems.ts) — both must be satisfied.
// Returns false after the casino closes at midnight.
export function isShopTimeReached(now: Date = new Date()): boolean {
  return now >= betTiming.shopOpensAt && now < betTiming.casinoClosesAt;
}

// Whether the casino (shop + fruit machine) has closed for the night.
// Used by UI to show the right "closed, see you next time" message.
export function isCasinoClosed(now: Date = new Date()): boolean {
  return now >= betTiming.casinoClosesAt;
}

// ISO strings for passing to client components without serialising Date objects.
export const betTimingISO = {
  landingOpensAt: betTiming.landingOpensAt.toISOString(),
  opensAt: betTiming.opensAt.toISOString(),
  loggingClosesAt: betTiming.loggingClosesAt.toISOString(),
  partyOpensAt: betTiming.partyOpensAt.toISOString(),
  fruitMachineUnlocksAt: betTiming.fruitMachineUnlocksAt.toISOString(),
  shopOpensAt: betTiming.shopOpensAt.toISOString(),
  casinoClosesAt: betTiming.casinoClosesAt.toISOString(),
};
