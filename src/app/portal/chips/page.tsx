import { requireSession } from "@/lib/session";
import { getBetParticipantStats, listChipEvents } from "@/lib/airtable";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalNav } from "@/components/portal/PortalNav";

export const metadata = {
  title: "Chips — The 100 Minute Bet",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  }) + ", " + d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ChipsPage() {
  const session = await requireSession();
  const stats = await getBetParticipantStats(session.participantId);
  const entries = await listChipEvents(session.participantId);

  const earned = entries
    .filter((e) => e.type !== "Spent")
    .reduce((s, e) => s + e.amount, 0);
  const spent = entries
    .filter((e) => e.type === "Spent")
    .reduce((s, e) => s + e.amount, 0);

  // Extra spins are 10 chips each (the first spin is free at 100 minutes).
  const spinsAffordable = Math.floor(stats.chipBalance / 10);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 64px" }}>
      <PortalHeader firstName={session.firstName} chipBalance={stats.chipBalance} />
      <PortalNav />

      <div className="sticker sticker--tilt-left" style={{ marginTop: 28 }}>
        <span className="sticker__tab sticker__tab--pink">YOUR CHIPS</span>
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
            {stats.chipBalance}
          </span>
          <span style={{ fontSize: 20, fontWeight: 800 }}>chips banked</span>
        </div>
        <p className="text-body" style={{ marginTop: 12 }}>
          One chip per rep logged. {earned} earned, {spent} spent. Hit 100
          minutes and your first fruit machine spin is free.
          {spinsAffordable > 0
            ? ` Your chips buy ${spinsAffordable} extra ${
                spinsAffordable === 1 ? "spin" : "spins"
              } on top, or you can spend them in the shop on the 29th.`
            : " Extra spins are 10 chips each. Keep logging."}
        </p>
      </div>

      <div className="sticker sticker--tilt-right" style={{ marginTop: 28 }}>
        <span className="sticker__tab">THE LEDGER</span>
        <h2 className="text-h3" style={{ marginBottom: 4 }}>
          Every chip, where it came from.
        </h2>
        {entries.length === 0 ? (
          <p className="text-body" style={{ marginTop: 12 }}>
            No chips yet. Log a rep and your first one lands here.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 16,
            }}
          >
            {entries.map((e) => {
              const isSpent = e.type === "Spent";
              return (
                <div
                  key={e.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 14px",
                    border: "3px solid var(--ink)",
                    borderRadius: 12,
                    background: "var(--paper)",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>
                      {e.reason || e.type}
                    </span>
                    {e.notes && (
                      <span
                        style={{
                          display: "block",
                          fontSize: 13,
                          opacity: 0.7,
                        }}
                      >
                        {e.notes}
                      </span>
                    )}
                    <span
                      style={{
                        display: "block",
                        fontSize: 12,
                        opacity: 0.6,
                        marginTop: 2,
                      }}
                    >
                      {formatDate(e.createdAt)}
                    </span>
                  </div>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 20,
                      fontVariantNumeric: "tabular-nums",
                      color: isSpent ? "var(--red-deep)" : "var(--ink)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isSpent ? "-" : "+"}
                    {e.amount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
