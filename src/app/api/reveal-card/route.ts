import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import {
  createChipEvent,
  findBetParticipantById,
  getScratchCardById,
  updateScratchCard,
} from "@/lib/airtable";

export const runtime = "nodejs";

type Body = { cardId?: string };

export async function POST(req: Request) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }

  const cardId = body.cardId?.trim();
  if (!cardId) {
    return NextResponse.json({ ok: false, error: "Missing card id." }, { status: 400 });
  }

  const card = await getScratchCardById(cardId);
  if (!card) {
    return NextResponse.json({ ok: false, error: "Card not found." }, { status: 404 });
  }

  // The card must belong to the logged-in participant.
  const owner = (card.fields["Bet Participant"] as string[] | undefined) ?? [];
  if (!owner.includes(session.participantId)) {
    return NextResponse.json({ ok: false, error: "Not your card." }, { status: 403 });
  }

  const outcome = card.fields.Outcome;
  const tier = card.fields["Outcome Tier"] ?? "";

  // If already revealed, just return the result (idempotent).
  const alreadyRevealed = card.fields.Revealed === true;

  if (!alreadyRevealed) {
    await updateScratchCard(cardId, {
      Revealed: true,
      "Revealed At": new Date().toISOString(),
    });

    // Award bonus chips for chip-prize cards. Idempotent on the card id.
    let chipAmount = 0;
    if (outcome === "1 bonus chip") chipAmount = 1;
    if (outcome === "2 bonus chips") chipAmount = 2;

    if (chipAmount > 0) {
      const participant = await findBetParticipantById(session.participantId);
      const displayName =
        participant?.fields["Bet Participant"] ??
        `${participant?.fields["First Name"] ?? ""} ${
          participant?.fields["Last Name"] ?? ""
        }`.trim();
      await createChipEvent({
        betParticipantId: session.participantId,
        participantDisplayName: displayName,
        amount: chipAmount,
        type: "Earned",
        reason: "Scratch card bonus",
        idempotencyKey: `scratch-bonus-${cardId}`,
        sourceScratchCardId: cardId,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    result: {
      outcome,
      tier,
      discountCode: card.fields["Discount Code"] ?? null,
      freeResource: card.fields["Free Resource"] ?? null,
    },
  });
}
