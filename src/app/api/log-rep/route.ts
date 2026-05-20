import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { createRep, findBetParticipantById } from "@/lib/airtable";
import { processRep } from "@/lib/chipEngine";
import { isLoggingOpen } from "@/lib/betTiming";

export const runtime = "nodejs";

const VALID_RS = ["Reach", "Reengage", "Return", "Retain", "Refer"];
const VALID_OUTCOMES = ["No result", "Positive conversation", "Sale"] as const;

type Body = {
  minutes?: number;
  revenueR?: string;
  outcome?: string;
  note?: string;
};

export async function POST(req: Request) {
  // --- Auth ---
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });
  }

  // --- Logging window ---
  if (!isLoggingOpen()) {
    return NextResponse.json(
      { ok: false, error: "Logging is closed." },
      { status: 403 }
    );
  }

  // --- Parse + validate ---
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }

  const minutes = Number(body.minutes);
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 600) {
    return NextResponse.json(
      { ok: false, error: "Enter the minutes you spent (1 to 600)." },
      { status: 400 }
    );
  }
  const roundedMinutes = Math.round(minutes);

  const revenueR = body.revenueR?.trim() ?? "";
  if (!VALID_RS.includes(revenueR)) {
    return NextResponse.json(
      { ok: false, error: "Pick which kind of rep this was." },
      { status: 400 }
    );
  }

  const outcome = (body.outcome?.trim() ?? "No result") as (typeof VALID_OUTCOMES)[number];
  if (!VALID_OUTCOMES.includes(outcome)) {
    return NextResponse.json(
      { ok: false, error: "Pick an outcome." },
      { status: 400 }
    );
  }

  const note = (body.note ?? "").trim().slice(0, 500);

  // --- Read the participant to get the dual-member link + current stats ---
  const participant = await findBetParticipantById(session.participantId);
  if (!participant) {
    return NextResponse.json(
      { ok: false, error: "Participant record not found." },
      { status: 404 }
    );
  }
  const displayName =
    participant.fields["Bet Participant"] ??
    `${participant.fields["First Name"] ?? ""} ${participant.fields["Last Name"] ?? ""}`.trim();
  const existingLink = (participant.fields as Record<string, unknown>)[
    "Existing Participant Link"
  ] as string[] | undefined;
  const participantLinkId = existingLink && existingLink[0];

  // --- Write the rep ---
  // Outcome and Revenue R are recorded on the rep as data; they no longer
  // affect chips. One rep = one chip, handled by the engine.
  const rep = await createRep({
    betParticipantId: session.participantId,
    minutes: roundedMinutes,
    revenueR,
    outcome,
    note,
    participantLinkId,
  });

  // --- Run the chip engine ---
  const summary = await processRep({
    betParticipantId: session.participantId,
    participantDisplayName: displayName,
    repId: rep.id,
  });

  return NextResponse.json({
    ok: true,
    rep: {
      id: rep.id,
      minutes: roundedMinutes,
      revenueR,
      outcome,
    },
    summary,
  });
}
