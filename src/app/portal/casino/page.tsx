import Link from "next/link";
import { requireSession } from "@/lib/session";
import {
  findBetParticipantById,
  getBetParticipantStats,
  listScratchCards,
  sumBetReps,
} from "@/lib/airtable";
import {
  isFruitMachineUnlocked,
  isPartyOpen,
  betTimingISO,
} from "@/lib/betTiming";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalNav } from "@/components/portal/PortalNav";
import { Countdown } from "@/components/portal/Countdown";
import { FruitMachine } from "@/components/portal/FruitMachine";
import { CasinoShop } from "@/components/portal/CasinoShop";
import { isShopOpen } from "@/config/shopItems";

export const metadata = {
  title: "Casino — The 100 Minute Bet",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CasinoPage() {
  const session = await requireSession();
  const stats = await getBetParticipantStats(session.participantId);
  const { minutes } = await sumBetReps(session.participantId);
  const participant = await findBetParticipantById(session.participantId);

  const unlocked = isFruitMachineUnlocked();
  const partyOpen = isPartyOpen();
  const eligible = minutes >= 100;
  // "Fruit Machine Spun" is repurposed as "free spin used".
  const freeSpinAvailable =
    (participant?.fields as Record<string, unknown> | undefined)?.[
      "Fruit Machine Spun"
    ] !== true;

  // Unrevealed scratch cards: nudge the user to scratch before they spend,
  // since a card can be worth chips.
  const cards = await listScratchCards(session.participantId);
  const unrevealedCount = cards.filter((c) => c.fields.Revealed !== true).length;

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 64px" }}>
      <PortalHeader firstName={session.firstName} chipBalance={stats.chipBalance} />
      <PortalNav />

      <div className="sticker sticker--tilt-left" style={{ marginTop: 28 }}>
        <span className="sticker__tab sticker__tab--pink">THE CASINO</span>
        <h1 className="text-h2">The fruit machine.</h1>
        <p className="text-body" style={{ marginTop: 12 }}>
          Hit 100 logged minutes and your first spin is free. After that,
          every spin costs 10 chips. A spin can win you a prize bigger than
          anything in the shop, or it can lose. That&apos;s the gamble.
        </p>
        {!unlocked && (
          <div style={{ marginTop: 20 }}>
            <Countdown
              target={betTimingISO.fruitMachineUnlocksAt}
              label="Fruit machine unlocks in"
            />
          </div>
        )}
      </div>

      {unrevealedCount > 0 && (
        <div
          className="sticker sticker--tilt-tiny-right"
          style={{ marginTop: 28, background: "var(--yellow)" }}
        >
          <span className="sticker__tab sticker__tab--pink">SCRATCH FIRST</span>
          <h2 className="text-h3">
            You&apos;ve got {unrevealedCount} unscratched{" "}
            {unrevealedCount === 1 ? "card" : "cards"}.
          </h2>
          <p className="text-body" style={{ marginTop: 10 }}>
            Scratch them before you spend. Some cards are worth chips, and
            you don&apos;t want to gamble or shop without knowing your real
            balance.
          </p>
          <Link
            href="/portal/scratch"
            className="btn"
            style={{ marginTop: 16 }}
          >
            Go scratch them →
          </Link>
        </div>
      )}

      <div className="sticker sticker--tilt-right" style={{ marginTop: 28 }}>
        <span className="sticker__tab">SPIN TO WIN</span>
        <div style={{ marginTop: 16 }}>
          <FruitMachine
            initialChipBalance={stats.chipBalance}
            eligible={eligible}
            unlocked={unlocked}
            freeSpinAvailable={freeSpinAvailable}
          />
        </div>
      </div>

      {partyOpen && (
        <div
          className="sticker sticker--tilt-left"
          style={{ marginTop: 28, background: "var(--felt)" }}
        >
          <span className="sticker__tab sticker__tab--pink">THE PARTY IS LIVE</span>
          <h2 className="text-h3" style={{ color: "var(--paper)" }}>
            Join the room. Then the cart.
          </h2>
          <p className="text-body" style={{ marginTop: 10, color: "var(--paper)" }}>
            The casino party is happening now. Jump into the Google Meet, and
            when the cart opens you can join the 100 Reps Club.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 16,
            }}
          >
            {process.env.NEXT_PUBLIC_PARTY_MEET_URL ? (
              <a
                className="btn btn--yellow"
                href={process.env.NEXT_PUBLIC_PARTY_MEET_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join the party →
              </a>
            ) : (
              <span style={{ color: "var(--paper)", fontWeight: 800 }}>
                Meet link coming shortly.
              </span>
            )}
            <a
              className="btn"
              href={
                process.env.NEXT_PUBLIC_CART_URL ??
                "https://zoedew.com/100-reps-club"
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Join 100 Reps Club →
            </a>
          </div>
        </div>
      )}

      <div className="sticker sticker--tilt-tiny-left" style={{ marginTop: 28 }}>
        <span className="sticker__tab sticker__tab--pink">THE SHOP</span>
        <h2 className="text-h3">The casino shop.</h2>
        <p className="text-body" style={{ marginTop: 8, marginBottom: 4 }}>
          The safe play. Spend chips on a guaranteed thing instead of
          gambling them on the wheel.
        </p>
        <div style={{ marginTop: 16 }}>
          <CasinoShop
            initialChipBalance={stats.chipBalance}
            open={isShopOpen()}
            unlocked={unlocked}
          />
        </div>
      </div>
    </main>
  );
}
