import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getBetParticipantStats, sumBetReps } from "@/lib/airtable";
import { getBetPhase, betTimingISO } from "@/lib/betTiming";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalNav } from "@/components/portal/PortalNav";
import { Countdown } from "@/components/portal/Countdown";
import { RepLogForm } from "@/components/portal/RepLogForm";
import { DealMeARep } from "@/components/portal/DealMeARep";

export const metadata = {
  title: "Portal — The 100 Minute Bet",
  robots: { index: false, follow: false },
};

// Always fetch fresh — the chip counter and minutes must reflect the latest rep.
export const dynamic = "force-dynamic";

export default async function PortalHomePage() {
  const session = await requireSession();

  // First visit: send them to the how-it-works page. The cookie is set there.
  const seenWelcome = cookies().get("chips_seen_welcome")?.value === "1";
  if (!seenWelcome) {
    redirect("/portal/how-it-works");
  }
  const stats = await getBetParticipantStats(session.participantId);
  const chipBalance = stats.chipBalance;
  // Compute minutes directly from the reps table rather than the Airtable
  // rollup, which is not reliable for live display.
  const { minutes } = await sumBetReps(session.participantId);
  const phase = getBetPhase();

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 64px" }}>
      <PortalHeader firstName={session.firstName} chipBalance={chipBalance} />
      <PortalNav />

      {phase === "before" && (
        <div className="sticker sticker--tilt-left" style={{ marginTop: 28 }}>
          <span className="sticker__tab sticker__tab--pink">NOT YET</span>
          <h1 className="text-h2">The bet opens 22 June.</h1>
          <p className="text-body" style={{ marginTop: 14 }}>
            You&apos;re registered and you&apos;re in. Logging opens at
            midnight on Monday 22 June. Until then, here&apos;s the clock.
          </p>
          <div style={{ marginTop: 22 }}>
            <Countdown target={betTimingISO.opensAt} label="Bet opens in" />
          </div>
        </div>
      )}

      {phase === "before" && (
        <div className="sticker sticker--tilt-right" style={{ marginTop: 28 }}>
          <span className="sticker__tab">THE RULES</span>
          <h2 className="text-h3">What you&apos;re committing to.</h2>
          <p className="text-body" style={{ marginTop: 12 }}>
            Log 100 minutes of sales activity between 22 and 28 June. Use at
            least two of the non-Reach Rs. Send every rep, no drafts. Log the
            outcomes honestly, including the no&apos;s and the ghosted ones.
          </p>
          <p className="text-body">
            Every 25 minutes you log earns a scratch card. Chips stack for
            the doing. Hit 100 and you spin the fruit machine at the party on
            Monday 29 June at 7pm.
          </p>
          <p className="text-body">
            Logging closes 23:59 on Sunday 28 June. The party and the chip
            shop are Monday the 29th.
          </p>
        </div>
      )}

      {phase === "open" && (
        <>
          <div className="sticker sticker--tilt-left" style={{ marginTop: 28 }}>
            <span className="sticker__tab sticker__tab--pink">YOUR PROGRESS</span>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {minutes}
              </span>
              <span style={{ fontSize: 20, fontWeight: 800 }}>
                / 100 minutes logged
              </span>
            </div>
            <p className="text-body" style={{ marginTop: 12 }}>
              {minutes >= 100
                ? "You hit 100. The fruit machine unlocks at the party on 29 June."
                : `${100 - minutes} minutes to go. Every 25 earns a scratch card.`}
            </p>
            <div style={{ marginTop: 18 }}>
              <Countdown
                target={betTimingISO.loggingClosesAt}
                label="Logging closes in"
              />
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <DealMeARep />
          </div>

          <div className="sticker sticker--tilt-right" style={{ marginTop: 28 }}>
            <span className="sticker__tab">LOG A REP</span>
            <h2 className="text-h3">What did you just do?</h2>
            <p className="text-body" style={{ marginTop: 8, marginBottom: 4 }}>
              One rep at a time. Minutes, the kind of rep, what came of it.
            </p>
            <div style={{ marginTop: 14 }}>
              <RepLogForm />
            </div>
          </div>
        </>
      )}

      {phase === "logging-closed" && (
        <div className="sticker sticker--tilt-left" style={{ marginTop: 28 }}>
          <span className="sticker__tab">LOGGING CLOSED</span>
          <h1 className="text-h2">Logging is done. The party is next.</h1>
          <p className="text-body" style={{ marginTop: 14 }}>
            Reps closed at 23:59 on 28 June. The casino party is Monday 29
            June at 7pm UK. Head to the Casino tab when it opens.
          </p>
        </div>
      )}
    </main>
  );
}
