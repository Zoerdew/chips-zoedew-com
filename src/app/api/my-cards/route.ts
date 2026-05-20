import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { listScratchCards } from "@/lib/airtable";

export const runtime = "nodejs";

// Returns the logged-in participant's scratch cards. Used by the rep form to
// pop the dismissible modal right after a threshold is crossed.
export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });
  }

  const records = await listScratchCards(session.participantId);
  const cards = records
    .map((rec) => ({
      id: rec.id,
      triggerThreshold: (rec.fields["Trigger Threshold"] as number) ?? 0,
      revealed: rec.fields.Revealed === true,
      outcome: (rec.fields.Outcome as string) ?? "",
      tier: (rec.fields["Outcome Tier"] as string) ?? "",
      discountCode: (rec.fields["Discount Code"] as string) ?? null,
      freeResource: (rec.fields["Free Resource"] as string) ?? null,
    }))
    .sort((a, b) => a.triggerThreshold - b.triggerThreshold);

  return NextResponse.json({ ok: true, cards });
}
