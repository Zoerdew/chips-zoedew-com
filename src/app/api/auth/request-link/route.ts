import { NextResponse } from "next/server";
import { findBetParticipantByEmail } from "@/lib/airtable";
import { createMagicToken } from "@/lib/auth";
import { sendMagicLinkEmail } from "@/lib/email";

export const runtime = "nodejs";

type Body = { email?: string };

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Enter the email you registered with." },
      { status: 400 }
    );
  }

  const participant = await findBetParticipantByEmail(email);

  // No self-signup. If the email isn't in Bet Participants, don't send a link.
  // Return a generic message either way so the endpoint can't be used to
  // probe which emails are registered.
  if (participant) {
    const firstName = participant.fields["First Name"] ?? "there";
    const token = await createMagicToken({
      participantId: participant.id,
      email,
      firstName,
    });
    // Build the link relative to the request's own origin so it works on
    // localhost and production without depending on NEXT_PUBLIC_SITE_URL.
    const origin = new URL(req.url).origin;
    const magicUrl = `${origin}/portal/verify?token=${encodeURIComponent(token)}`;
    try {
      await sendMagicLinkEmail({ to: email, firstName, magicUrl });
    } catch (err) {
      // Log server-side, still return generic success to the client.
      console.error("Magic link email failed:", err);
    }
  }

  return NextResponse.json({
    ok: true,
    message:
      "If that email is registered for the bet, a link is on its way. Check your inbox.",
  });
}
