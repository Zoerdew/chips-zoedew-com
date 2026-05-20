import { requireSession } from "@/lib/session";
import { getChipBalance } from "@/lib/airtable";
import { PortalHeader } from "./PortalHeader";
import { PortalNav } from "./PortalNav";

// Shared placeholder used by tab pages still to be built.
export async function PortalPlaceholder({
  tab,
  note,
}: {
  tab: string;
  note: string;
}) {
  const session = await requireSession();
  const chipBalance = await getChipBalance(session.participantId);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 64px" }}>
      <PortalHeader firstName={session.firstName} chipBalance={chipBalance} />
      <PortalNav />
      <div className="sticker sticker--tilt-left" style={{ marginTop: 28 }}>
        <span className="sticker__tab">{tab.toUpperCase()}</span>
        <h1 className="text-h2">{tab}</h1>
        <p className="text-body" style={{ marginTop: 14 }}>
          {note}
        </p>
      </div>
    </main>
  );
}
