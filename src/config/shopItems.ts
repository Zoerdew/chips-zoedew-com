// Casino shop items. Edit this file to change items or chip prices.
//
// `shopPrizeKey` must match an option on the Chips table "Shop Prize"
// single-select, so the purchase records cleanly in Airtable.
//
// Fulfilment is manual: a purchase records the chip spend, then Zoë grants
// access by hand. No coupon codes.

export type ShopItem = {
  id: string;
  name: string;
  shopPrizeKey: string; // must match Airtable "Shop Prize" option
  chipCost: number;
  blurb: string;
  realValue: string; // shown for context, e.g. "£100 + VAT"
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "lead-tracker",
    name: "The Lead Tracker",
    shopPrizeKey: "Lead Tracker",
    chipCost: 20,
    blurb:
      "The Airtable lead tracker. Stop losing warm leads in your inbox.",
    realValue: "£97 + VAT",
  },
  {
    id: "dig-your-data",
    name: "Dig Your Data",
    shopPrizeKey: "Dig Your Data",
    chipCost: 25,
    blurb:
      "A done-for-you read of your buyer data. Who to follow up and what to sell them.",
    realValue: "£100 + VAT",
  },
  {
    id: "strategy-call",
    name: "30-minute strategy call",
    shopPrizeKey: "30 min strategy call",
    chipCost: 35,
    blurb:
      "Half an hour with Zoë, one to one. Bring your reps, leave with a plan.",
    realValue: "£97 + VAT",
  },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

import { isShopTimeReached } from "@/lib/betTiming";

// The shop opens only when BOTH are true:
//   1. SHOP_OPEN flag is "true" (Zoë's "products are ready" switch)
//   2. the SHOP_OPENS_AT timestamp has passed
// So the flag can be set true now and the shop still opens itself on the day.
export function isShopOpen(): boolean {
  const flagOn = process.env.NEXT_PUBLIC_SHOP_OPEN === "true";
  return flagOn && isShopTimeReached();
}

// Whether the flag is on, regardless of time. Used to show the right
// "opens at the party" vs "not yet" message.
export function isShopFlagOn(): boolean {
  return process.env.NEXT_PUBLIC_SHOP_OPEN === "true";
}
