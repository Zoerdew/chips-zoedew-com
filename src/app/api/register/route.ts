import { NextResponse } from "next/server";
import {
  createBetParticipant,
  createChipEvent,
  findBetParticipantByEmail,
  findBetParticipantById,
  findBetParticipantByReferralCode,
  updateBetParticipant,
} from "@/lib/airtable";
import { env } from "@/lib/env";
import { isLandingPublic } from "@/lib/betTiming";

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
  // Gate: before the landing page is public, refuse signups outright.
  // The holding page has no form, so this only fires on direct POSTs.
  if (!isLandingPublic()) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          field: "form",
          message: "The doors aren't open yet. Come back on 8 June.",
        },
      },
      { status: 503 }
    );
  }

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

  // The Referral Code is an Airtable formula, computed from the record id.
  // It may not be present in the create response, so re-fetch the record.
  let referralCode = created.fields["Referral Code"] ?? "";
  let referralLink = created.fields["Referral Link"] ?? "";
  if (!referralCode) {
    const refreshed = await findBetParticipantById(created.id);
    referralCode = refreshed?.fields["Referral Code"] ?? "";
    referralLink = refreshed?.fields["Referral Link"] ?? "";
  }

  // Write the personalised share image into the Share Image attachment field.
  // Airtable fetches the URL and stores the PNG. Non-blocking: registration
  // must still succeed if this fails.
  if (referralCode) {
    const shareImageUrl = `${env.siteUrl}/api/share-image?name=${encodeURIComponent(
      firstName
    )}&ref=${encodeURIComponent(referralCode)}`;
    try {
      await updateBetParticipant(created.id, {
        "Share Image": [
          { url: shareImageUrl, filename: `100-minute-bet-${firstName}.png` },
        ],
      });
    } catch (err) {
      console.error("Failed to set Share Image attachment:", err);
    }
  }

  return NextResponse.json({
    ok: true,
    alreadyRegistered: false,
    participant: {
      id: created.id,
      firstName,
      referralCode,
      referralLink,
    },
  });
}
