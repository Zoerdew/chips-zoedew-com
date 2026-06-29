import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import {
  countFruitMachineWins,
  createChipEvent,
  findBetParticipantById,
  getBetParticipantStats,
  updateBetParticipant,
} from "@/lib/airtable";
import { isFruitMachineUnlocked } from "@/lib/betTiming";
import { CAPPED_PRIZES, rollFruitMachine } from "@/config/fruitMachinePrizes";

export const runtime = "nodejs";

const SPIN_COST = 10;

export async function POST() {
  // --- Auth ---
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });
  }

  // --- Time gate ---
  if (!isFruitMachineUnlocked()) {
    return NextResponse.json(
      { ok: false, error: "The fruit machine unlocks at 7pm on 29 June." },
      { status: 403 }
    );
  }

  // Eligibility note: no 100-minute requirement. Anyone with 10 chips can
  // spin. The free-spin-for-100-minute-hitters logic still applies below.

  // --- Read participant: name + whether the free spin is still available ---
  const participant = await findBetParticipantById(session.participantId);
  const displayName =
    participant?.fields["Bet Participant"] ??
    `${participant?.fields["First Name"] ?? ""} ${
      participant?.fields["Last Name"] ?? ""
    }`.trim();
  // "Fruit Machine Spun" is repurposed as "free spin used".
  const freeSpinUsed =
    (participant?.fields as Record<string, unknown> | undefined)?.[
      "Fruit Machine Spun"
    ] === true;

  // --- Decide: is this the free spin, or a paid one? ---
  const isFreeSpin = !freeSpinUsed;

  if (!isFreeSpin) {
    // Paid spin: need 10 chips.
    const stats = await getBetParticipantStats(session.participantId);
    if (stats.chipBalance < SPIN_COST) {
      return NextResponse.json(
        {
          ok: false,
          error: `Your free spin is used. Extra spins cost ${SPIN_COST} chips. You have ${stats.chipBalance}.`,
        },
        { status: 403 }
      );
    }
  }

  // --- Work out which capped prizes are exhausted ---
  const cappedKeys = CAPPED_PRIZES.map((p) => p.key);
  const winCounts = await countFruitMachineWins(cappedKeys);
  const exhausted = new Set<string>();
  for (const p of CAPPED_PRIZES) {
    if (typeof p.maxWins === "number" && winCounts[p.key] >= p.maxWins) {
      exhausted.add(p.key);
    }
  }

  // --- Roll the prize, excluding any sold-out capped prizes ---
  const prize = rollFruitMachine(exhausted);
  const spinId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // --- Record the spin. A paid spin is a 10-chip Spend; a free spin is a
  //     zero-amount Adjustment. Either way the Notes carry the prize so the
  //     capped-prize counter can see it. ---
  if (!isFreeSpin) {
    await createChipEvent({
      betParticipantId: session.participantId,
      participantDisplayName: displayName,
      amount: SPIN_COST,
      type: "Spent",
      reason: "Spent in shop",
      idempotencyKey: `spin-cost-${session.participantId}-${spinId}`,
      notes: `Fruit machine spin: ${prize.key}`,
    });
  } else {
    await createChipEvent({
      betParticipantId: session.participantId,
      participantDisplayName: displayName,
      amount: 0,
      type: "Adjustment",
      reason: "Manual adjustment",
      idempotencyKey: `spin-free-${session.participantId}-${spinId}`,
      notes: `Fruit machine spin: ${prize.key} (free spin)`,
    });
  }

  // --- Mark the free spin used (first spin only) ---
  if (isFreeSpin) {
    await updateBetParticipant(session.participantId, {
      "Fruit Machine Spun": true,
    });
  }

  // --- If the prize is chips back, credit them ---
  if (prize.key === "1 bonus chip") {
    await createChipEvent({
      betParticipantId: session.participantId,
      participantDisplayName: displayName,
      amount: 1,
      type: "Earned",
      reason: "Scratch card bonus",
      idempotencyKey: `spin-win-${session.participantId}-${spinId}`,
      notes: "Fruit machine: 1 chip back",
    });
  }

  // --- Record the latest result on the Bet Participant record ---
  await updateBetParticipant(session.participantId, {
    "Fruit Machine Result": prize.key,
    "Fruit Machine Spun At": new Date().toISOString(),
  });

  // --- New balance + free-spin state for the client ---
  const after = await getBetParticipantStats(session.participantId);

  return NextResponse.json({
    ok: true,
    wasFreeSpin: isFreeSpin,
    prize: {
      key: prize.key,
      symbol: prize.symbol,
      title: prize.title,
      blurb: prize.blurb,
      isWin: prize.isWin,
    },
    chipBalance: after.chipBalance,
  });
}
