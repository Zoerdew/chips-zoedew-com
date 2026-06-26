// Fruit machine prize table. Edit this file to change prizes or weights.
// Weights are relative; they don't have to sum to 100 but currently do.
//
// `key` is written to the Airtable Fruit Machine Result field, so if you
// rename a key, update the single-select options on that field too.

export type FruitMachinePrize = {
  key: string; // stored in Airtable
  weight: number; // relative likelihood
  symbol: string; // shown on the reels (emoji or short text)
  title: string; // headline shown on the result
  blurb: string; // one line under the title
  isWin: boolean; // false = "no cigar"
  maxWins?: number; // optional cap. Once this many have been won, the prize
                    // is removed from the roll. Omit for unlimited.
};

export const FRUIT_MACHINE_PRIZES: FruitMachinePrize[] = [
  {
    key: "No cigar",
    weight: 35,
    symbol: "✗",
    title: "No cigar.",
    blurb: "That's the risk. Spin again if you've got the chips.",
    isWin: false,
  },
  {
    key: "1 bonus chip",
    weight: 22,
    symbol: "🪙",
    title: "1 chip back.",
    blurb: "A chip returned to your pile. Small mercy.",
    isWin: true,
  },
  {
    key: "Free resource",
    weight: 18,
    symbol: "📄",
    title: "A free resource.",
    blurb: "Something from the catalogue, yours. Details to follow.",
    isWin: true,
  },
  {
    key: "Mystery prize posted",
    weight: 10,
    symbol: "📦",
    title: "A mystery prize, posted to you.",
    blurb: "A real thing, in the real post. Zoë will be in touch for your address.",
    isWin: true,
  },
  {
    key: "10% off 100 Reps Club",
    weight: 7,
    symbol: "🎟",
    title: "10% off 100 Reps Club.",
    blurb: "Money off your membership. Code to follow.",
    isWin: true,
    maxWins: 10,
  },
  // ---- Resources from the Falling Forwards catalogue ----
  {
    key: "Lead Tracker",
    weight: 8,
    symbol: "📋",
    title: "The Lead Tracker.",
    blurb: "The Airtable lead tracker. Stop losing warm leads in your inbox.",
    isWin: true,
    maxWins: 5,
  },
  {
    key: "Dig Your Data",
    weight: 8,
    symbol: "📊",
    title: "Dig Your Data.",
    blurb: "Done-for-you read of your buyer data. Who to follow up, what to sell them.",
    isWin: true,
    maxWins: 5,
  },
  {
    key: "90-min strategy session",
    weight: 5,
    symbol: "🎯",
    title: "A 90-minute strategy session with Zoë.",
    blurb: "Worth £397. Bring your reps, leave with a plan. Booking link to follow.",
    isWin: true,
    maxWins: 3,
  },
  {
    key: "25% off 100 Reps Club",
    weight: 5,
    symbol: "💎",
    title: "25% off 100 Reps Club.",
    blurb: "A proper discount on your membership. Code to follow.",
    isWin: true,
    maxWins: 5,
  },
  {
    key: "Free quarter of 100 Reps Club",
    weight: 3,
    symbol: "👑",
    title: "JACKPOT. A free quarter of 100 Reps Club.",
    blurb: "Three months of the membership, free. The big one.",
    isWin: true,
    maxWins: 1,
  },
  // ---- Donated prizes from the cohort ----
  // Each at jackpot rarity (weight 3, cap 1). Each donor's name and prize
  // matches a record on the Prize Donations table. Zoë fulfils manually
  // after the night, using the donor contact info on that table.
  {
    key: "Donated: WiBN networking visit",
    weight: 3,
    symbol: "🎟",
    title: "A free visit to WiBN online networking.",
    blurb: "Donated by Vicky Labinger. Women in Industry Networking. Details to follow.",
    isWin: true,
    maxWins: 1,
  },
  {
    key: "Donated: Unstuck Intensive",
    weight: 3,
    symbol: "🔑",
    title: "Katie Shaarany's Unstuck Intensive.",
    blurb: "A 1:1 intensive with Katie. Worth £350. Details to follow.",
    isWin: true,
    maxWins: 1,
  },
  {
    key: "Donated: Launch strategy call",
    weight: 3,
    symbol: "📞",
    title: "Launch or evergreen funnel strategy call.",
    blurb: "Donated by Nicola Moors. One strategy call with Nicola. Details to follow.",
    isWin: true,
    maxWins: 1,
  },
  {
    key: "Donated: Pippa & Lucy surprise",
    weight: 3,
    symbol: "🎁",
    title: "A surprise from Pippa & Lucy Parfait.",
    blurb: "A surprise drop from Pippa & Lucy. Revealed on the night.",
    isWin: true,
    maxWins: 1,
  },
  {
    key: "Donated: Agony Ange AMA",
    weight: 3,
    symbol: "💬",
    title: "Agony Ange — Ask Me Anything.",
    blurb: "A marketing AMA session with Ange. Details to follow.",
    isWin: true,
    maxWins: 1,
  },
];

// All reel symbols, used to populate the spinning columns visually.
export const REEL_SYMBOLS = FRUIT_MACHINE_PRIZES.map((p) => p.symbol);

export function getPrizeByKey(key: string): FruitMachinePrize | undefined {
  return FRUIT_MACHINE_PRIZES.find((p) => p.key === key);
}

// Prizes that have a maxWins cap.
export const CAPPED_PRIZES = FRUIT_MACHINE_PRIZES.filter(
  (p) => typeof p.maxWins === "number"
);

// Weighted random roll. Pass a set of prize keys to exclude (e.g. capped
// prizes that have run out). Excluded prizes get zero weight, so the spin
// still lands on something from what's left.
export function rollFruitMachine(
  excludeKeys: Set<string> = new Set()
): FruitMachinePrize {
  const pool = FRUIT_MACHINE_PRIZES.filter((p) => !excludeKeys.has(p.key));
  // pool always has the uncapped prizes, so it can never be empty.
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of pool) {
    if (r < p.weight) return p;
    r -= p.weight;
  }
  return pool[0];
}
