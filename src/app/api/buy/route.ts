import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import {
  createChipEvent,
  findBetParticipantById,
  getBetParticipantStats,
} from "@/lib/airtable";
import { isFruitMachineUnlocked } from "@/lib/betTiming";
import { getShopItem, isShopOpen } from "@/config/shopItems";

export const runtime = "nodejs";

type Body = { itemId?: string };

export async function POST(req: Request) {
  // --- Auth ---
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });
  }

  // --- Shop must be open ---
  if (!isShopOpen()) {
    return NextResponse.json(
      { ok: false, error: "The shop isn't open yet." },
      { status: 403 }
    );
  }

  // --- Shop opens on the same night as the casino (29 June) ---
  if (!isFruitMachineUnlocked()) {
    return NextResponse.json(
      { ok: false, error: "The shop opens at the party on 29 June." },
      { status: 403 }
    );
  }

  // --- Parse + resolve item ---
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }
  const item = body.itemId ? getShopItem(body.itemId) : undefined;
  if (!item) {
    return NextResponse.json({ ok: false, error: "Unknown item." }, { status: 400 });
  }

  // --- Affordability ---
  const stats = await getBetParticipantStats(session.participantId);
  if (stats.chipBalance < item.chipCost) {
    return NextResponse.json(
      {
        ok: false,
        error: `${item.name} costs ${item.chipCost} chips. You have ${stats.chipBalance}.`,
      },
      { status: 403 }
    );
  }

  // --- Display name for the chip row ---
  const participant = await findBetParticipantById(session.participantId);
  const displayName =
    participant?.fields["Bet Participant"] ??
    `${participant?.fields["First Name"] ?? ""} ${
      participant?.fields["Last Name"] ?? ""
    }`.trim();

  // --- Charge the chips. Spend event with the Shop Prize recorded so the
  //     purchase shows up in Airtable for manual fulfilment. ---
  const purchaseId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await createChipEvent({
    betParticipantId: session.participantId,
    participantDisplayName: displayName,
    amount: item.chipCost,
    type: "Spent",
    reason: "Spent in shop",
    idempotencyKey: `shop-${session.participantId}-${purchaseId}`,
    notes: `Shop purchase: ${item.name}`,
    shopPrize: item.shopPrizeKey,
  });

  // --- New balance ---
  const after = await getBetParticipantStats(session.participantId);

  return NextResponse.json({
    ok: true,
    item: { id: item.id, name: item.name },
    chipBalance: after.chipBalance,
  });
}
