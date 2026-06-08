import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getBetParticipantStats } from "@/lib/airtable";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalNav } from "@/components/portal/PortalNav";
import { SeenWelcome } from "@/components/portal/SeenWelcome";

export const metadata = {
  title: "How it works — The 100 Minute Bet",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function HowItWorksPage() {
  const session = await requireSession();
  const stats = await getBetParticipantStats(session.participantId);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 64px" }}>
      {/* Marks the welcome as seen so it doesn't auto-open again. */}
      <SeenWelcome />

      <PortalHeader firstName={session.firstName} chipBalance={stats.chipBalance} />
      <PortalNav />

      <div className="sticker sticker--tilt-left" style={{ marginTop: 28 }}>
        <span className="sticker__tab sticker__tab--pink">START HERE</span>
        <h1 className="text-h2">How the bet works.</h1>
        <p className="text-body" style={{ marginTop: 12 }}>
          You&apos;ve taken the bet: 100 minutes of sales activity between 22
          and 28 June. Here&apos;s how the portal works and what you&apos;re
          collecting.
        </p>
      </div>

      <div className="sticker sticker--tilt-right" style={{ marginTop: 28 }}>
        <span className="sticker__tab">1 · LOG YOUR REPS</span>
        <h2 className="text-h3">Every rep, logged here.</h2>
        <p className="text-body" style={{ marginTop: 10 }}>
          A rep is one piece of sales activity: a pitch, a follow-up, an ask,
          a re-engage, a referral request. Log each one on the Reps tab as
          you do it. Minutes, what kind of rep, what came of it.
        </p>
      </div>

      <div className="sticker sticker--tilt-tiny-left" style={{ marginTop: 28 }}>
        <span className="sticker__tab sticker__tab--pink">2 · CHIPS</span>
        <h2 className="text-h3">One rep, one chip.</h2>
        <p className="text-body" style={{ marginTop: 10 }}>
          Every rep you log earns you a chip. Refer someone who registers and
          you get three. Chips are your currency for the party on the 29th:
          spend them on fruit machine spins or in the casino shop. You bank
          them all week, you spend them on the night.
        </p>
      </div>

      <div className="sticker sticker--tilt-tiny-right" style={{ marginTop: 28 }}>
        <span className="sticker__tab">3 · SCRATCH CARDS</span>
        <h2 className="text-h3">Every 25 minutes, a card.</h2>
        <p className="text-body" style={{ marginTop: 10 }}>
          Cross 25, 50, 75 and 100 minutes and you earn a scratch card each
          time. Scratch them on the Scratch tab. Instant win: bonus chips, a
          discount, a free resource. Or nothing, because it&apos;s a scratch
          card. Scratch them as you go.
        </p>
      </div>

      <div className="sticker sticker--tilt-left" style={{ marginTop: 28 }}>
        <span className="sticker__tab sticker__tab--pink">4 · HIT 100</span>
        <h2 className="text-h3">100 minutes unlocks the fruit machine.</h2>
        <p className="text-body" style={{ marginTop: 10 }}>
          Log a full 100 minutes and you&apos;ve done the bet. That earns you
          one free spin on the fruit machine at the party. Extra spins cost
          10 chips each. A spin can win big or it can lose, that&apos;s the
          gamble.
        </p>
      </div>

      <div className="sticker sticker--tilt-right" style={{ marginTop: 28 }}>
        <span className="sticker__tab">5 · THE PARTY</span>
        <h2 className="text-h3">Monday 29 June, 7pm UK.</h2>
        <p className="text-body" style={{ marginTop: 10 }}>
          A casino party on Zoom. The leaderboard goes up, the fruit machine
          runs, the casino shop opens, and the 100 Reps Club cart opens at
          the close of the night. The Casino tab is where it all happens.
        </p>
      </div>

      <div
        className="sticker sticker--tilt-tiny-left"
        style={{ marginTop: 28, background: "var(--yellow)" }}
      >
        <span className="sticker__tab sticker__tab--pink">THAT&apos;S IT</span>
        <h2 className="text-h3">Log reps. Bank chips. Spend on the 29th.</h2>
        <p className="text-body" style={{ marginTop: 10 }}>
          You can come back to this page any time from the link in the
          header. Now go and log your first rep.
        </p>
        <Link href="/portal" className="btn" style={{ marginTop: 16 }}>
          Go to my reps →
        </Link>
      </div>
    </main>
  );
}
