import { NextResponse } from "next/server";
import {
  createBetParticipant,
  createChipEvent,
  findBetParticipantByEmail,
  findBetParticipantByReferralCode,
} from "@/lib/airtable";

export const runtime = "nodejs";

type RegisterBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  ref?: string;
};

function bad(field: string, message: string) {
  return NextResponse.json(
    { ok: false, error: { field, message } },
    { status: 400 }
  );
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return bad("body", "Send JSON.");
  }

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const email = body.email?.trim().toLowerCase();
  const ref = body.ref?.trim().toLowerCase();

  if (!firstName) return bad("firstName", "First name is required.");
  if (!lastName) return bad("lastName", "Last name is required.");
  if (!email || !isEmail(email)) {
    return bad("email", "Use a real email so I can send you the magic link.");
  }

  // Duplicate check.
  const existing = await findBetParticipantByEmail(email);
  if (existing) {
    return NextResponse.json({
      ok: true,
      alreadyRegistered: true,
      participant: {
        id: existing.id,
        firstName: existing.fields["First Name"] ?? firstName,
        referralCode: existing.fields["Referral Code"] ?? "",
        referralLink: existing.fields["Referral Link"] ?? "",
      },
    });
  }

  // Look up referrer if a code was passed.
  let referrerId: string | undefined;
  let referrerDisplayName: string | undefined;
  if (ref) {
    const referrer = await findBetParticipantByReferralCode(ref);
    if (referrer) {
      referrerId = referrer.id;
      referrerDisplayName =
        referrer.fields["Bet Participant"] ??
        `${referrer.fields["First Name"] ?? ""} ${referrer.fields["Last Name"] ?? ""}`.trim();
    }
  }

  // Create the new Bet Participant.
  const created = await createBetParticipant({
    firstName,
    lastName,
    email,
    entryType: "New Participant",
    referredBy: referrerId,
  });

  // Award 3 chips to the referrer, idempotently on (referrerId, newId).
  if (referrerId && referrerDisplayName) {
    await createChipEvent({
      betParticipantId: referrerId,
      participantDisplayName: referrerDisplayName,
      amount: 3,
      type: "Earned",
      reason: "Referral",
      idempotencyKey: `referral-${referrerId}-${created.id}`,
      notes: `Referred ${firstName} ${lastName} (${email})`,
    });
  }

  return NextResponse.json({
    ok: true,
    alreadyRegistered: false,
    participant: {
      id: created.id,
      firstName,
      referralCode: created.fields["Referral Code"] ?? "",
      referralLink: created.fields["Referral Link"] ?? "",
    },
  });
}
