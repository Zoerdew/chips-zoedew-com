import {
  createChipEvent,
  createScratchCard,
  findBetParticipantById,
  listScratchCards,
  sumBetReps,
  updateBetParticipant,
} from "./airtable";
import { rollScratchPrize } from "./scratchPrize";

// The chip engine. Called after a rep is written.
//
// The model, kept deliberately simple:
//   - One rep logged = one chip. No caps, no bonuses, no outcome chips.
//   - Every 25 minutes of total logged time = one scratch card.
//   - Chips are spent (fruit machine spins / casino shop) only from 29 June.
//
// Every write carries an idempotency key, so a retried request is safe.

const MINUTE_THRESHOLDS = [25, 50, 75, 100];

// Create a scratch card for this threshold only if the participant doesn't
// already have one. Returns true if a card was created.
async function ensureScratchCardForThreshold(
  betParticipantId: string,
  participantDisplayName: string,
  threshold: number
): Promise<boolean> {
  const existing = await listScratchCards(betParticipantId);
  const already = existing.some(
    (c) => c.fields["Trigger Threshold"] === threshold
  );
  if (already) return false;

  const prize = rollScratchPrize();
  await createScratchCard({
    betParticipantId,
    participantDisplayName,
    triggerThreshold: threshold,
    outcome: prize.outcome,
    outcomeTier: prize.tier,
    discountCode: prize.discountCode,
    freeResource: prize.freeResource,
  });
  return true;
}

export type ChipAwardSummary = {
  totalMinutes: number;
  chipAwarded: boolean; // a chip is earned per rep
  scratchCardsCreated: number;
  hit100: boolean;
};

export async function processRep(input: {
  betParticipantId: string;
  participantDisplayName: string;
  repId: string;
}): Promise<ChipAwardSummary> {
  const { betParticipantId, participantDisplayName, repId } = input;

  // One chip for this rep. Idempotency key is the rep id, so re-processing
  // the same rep never double-awards.
  await createChipEvent({
    betParticipantId,
    participantDisplayName,
    amount: 1,
    type: "Earned",
    reason: "Rep logged",
    idempotencyKey: `rep-${repId}`,
    sourceRepId: repId,
  });

  // Recompute true total minutes from the reps table (the rollup may lag).
  const { minutes: totalMinutes } = await sumBetReps(betParticipantId);

  // A scratch card for every 25-minute threshold now reached. Idempotent:
  // a threshold that already has a card is skipped.
  let scratchCardsCreated = 0;
  for (const threshold of MINUTE_THRESHOLDS) {
    if (totalMinutes < threshold) continue;
    const created = await ensureScratchCardForThreshold(
      betParticipantId,
      participantDisplayName,
      threshold
    );
    if (created) scratchCardsCreated += 1;
  }

  // Status progression on the Bet Participant record.
  // Hit 100 At must be the timestamp of the FIRST crossing, so we only set it
  // if it isn't already populated.
  const updates: Record<string, unknown> = {};
  let hit100 = false;
  if (totalMinutes >= 100) {
    updates["Status"] = "Hit 100";
    const rec = await findBetParticipantById(betParticipantId);
    const alreadyHit = rec?.fields &&
      typeof (rec.fields as Record<string, unknown>)["Hit 100 At"] === "string";
    if (!alreadyHit) {
      hit100 = true;
      updates["Hit 100 At"] = new Date().toISOString();
    }
  } else if (totalMinutes > 0) {
    updates["Status"] = "Active";
  }
  if (Object.keys(updates).length > 0) {
    await updateBetParticipant(betParticipantId, updates);
  }

  return {
    totalMinutes,
    chipAwarded: true,
    scratchCardsCreated,
    hit100,
  };
}
