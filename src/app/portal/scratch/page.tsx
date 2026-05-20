import { requireSession } from "@/lib/session";
import { getBetParticipantStats, listScratchCards } from "@/lib/airtable";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalNav } from "@/components/portal/PortalNav";
import { ScratchCard, type CardData } from "@/components/portal/ScratchCard";

export const metadata = {
  title: "Scratch — The 100 Minute Bet",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ScratchPage() {
  const session = await requireSession();
  const stats = await getBetParticipantStats(session.participantId);
  const records = await listScratchCards(session.participantId);

  const cards: CardData[] = records
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

  const unrevealed = cards.filter((c) => !c.revealed);
  const revealed = cards.filter((c) => c.revealed);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 64px" }}>
      <PortalHeader firstName={session.firstName} chipBalance={stats.chipBalance} />
      <PortalNav />

      <div className="sticker sticker--tilt-left" style={{ marginTop: 28 }}>
        <span className="sticker__tab sticker__tab--pink">SCRATCH CARDS</span>
        <h1 className="text-h2">Scratch your cards.</h1>
        <p className="text-body" style={{ marginTop: 12 }}>
          {cards.length === 0
            ? "No cards yet. You earn one every 25 minutes you log."
            : `${cards.length} card${cards.length === 1 ? "" : "s"} so far. ${
                unrevealed.length
              } still to scratch.`}
        </p>
      </div>

      {unrevealed.length > 0 && (
        <div className="sticker sticker--tilt-right" style={{ marginTop: 28 }}>
          <span className="sticker__tab">TO SCRATCH</span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 28,
              justifyContent: "center",
              marginTop: 18,
            }}
          >
            {unrevealed.map((card) => (
              <ScratchCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}

      {revealed.length > 0 && (
        <div className="sticker sticker--tilt-tiny-left" style={{ marginTop: 28 }}>
          <span className="sticker__tab">ALREADY SCRATCHED</span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 28,
              justifyContent: "center",
              marginTop: 18,
            }}
          >
            {revealed.map((card) => (
              <ScratchCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
