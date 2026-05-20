import { requireSession } from "@/lib/session";
import { getBetParticipantStats, getLeaderboard } from "@/lib/airtable";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalNav } from "@/components/portal/PortalNav";
import { LeaderboardTable } from "@/components/portal/LeaderboardTable";

export const metadata = {
  title: "Leaderboard — The 100 Minute Bet",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await requireSession();
  const stats = await getBetParticipantStats(session.participantId);
  const rows = await getLeaderboard();

  const myRank = rows.findIndex((r) => r.id === session.participantId) + 1;
  const hit100Count = rows.filter((r) => r.minutes >= 100).length;

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 64px" }}>
      <PortalHeader firstName={session.firstName} chipBalance={stats.chipBalance} />
      <PortalNav />

      <div className="sticker sticker--tilt-left" style={{ marginTop: 28 }}>
        <span className="sticker__tab sticker__tab--pink">LEADERBOARD</span>
        <h1 className="text-h2">Where you&apos;re sitting.</h1>
        <p className="text-body" style={{ marginTop: 12 }}>
          {myRank > 0
            ? `You're ${myRank}${
                myRank === 1 ? "st" : myRank === 2 ? "nd" : myRank === 3 ? "rd" : "th"
              } of ${rows.length}. Ranked by chips, minutes break the tie.`
            : "Log a rep to get on the board. Ranked by chips, minutes break the tie."}
        </p>
        {hit100Count > 0 && (
          <p
            className="text-body"
            style={{ marginTop: 8, fontWeight: 800 }}
          >
            {hit100Count}{" "}
            {hit100Count === 1 ? "person has" : "people have"} hit 100 minutes
            so far.
          </p>
        )}
      </div>

      <div className="sticker sticker--tilt-right" style={{ marginTop: 28 }}>
        <span className="sticker__tab">THE BOARD</span>
        <div style={{ marginTop: 16 }}>
          <LeaderboardTable rows={rows} meId={session.participantId} />
        </div>
      </div>
    </main>
  );
}
