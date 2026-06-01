import Image from "next/image";
import { Marquee } from "@/components/Marquee";
import { Sticker } from "@/components/Sticker";
import { Band } from "@/components/Band";
import { RegistrationForm } from "@/components/RegistrationForm";
import { BouncingChips } from "@/components/BouncingChips";
import { MiniFruitMachine } from "@/components/MiniFruitMachine";
import { ScratchReveal } from "@/components/ScratchReveal";

const MARQUEE_ITEMS = [
  "PLACE YOUR BET",
  "LOG YOUR REPS",
  "CASH YOUR CHIPS",
  "22 - 29 JUNE 2026",
  "THE 100 MINUTE BET",
];

const ZOE_PHOTO_URL =
  "https://zoedew.com/wp-content/uploads/2025/09/Zoe-Photos-Sept-25-9-scaled-e1758371328461.jpg";

type LandingPageProps = {
  // When set, the registration form sends this as X-Early-Access so the
  // API will accept signups before the public launch date. Used by /early.
  earlyAccessPassword?: string;
};

export function LandingPage({ earlyAccessPassword }: LandingPageProps = {}) {
  return (
    <main>
      <Marquee items={MARQUEE_ITEMS} />

      {/* ---------- HERO ---------- */}
      <Band color="pink">
        <div className="two-col">
          <div>
            <span className="pill-badge">THE 100 MINUTE BET</span>
            <h1 className="split-head split-head--hero">
              <span className="line-a">A week-long bet.</span>
              <span className="line-b">100 minutes of sales activity.</span>
            </h1>
            <p className="band-sub">
              Place your bet. Log your reps. Cash your chips.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "12px 0 18px" }}>
              <ScratchReveal width={280} height={64} foilText="WHEN?">
                <span style={{
                  fontFamily: "var(--font-bricolage), sans-serif",
                  fontWeight: 800,
                  fontSize: 22,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}>
                  22 - 29 June 2026
                </span>
              </ScratchReveal>
              <span style={{ fontSize: 14, opacity: 0.85 }}>
                Free to enter. Casino party live on Zoom Sun 29 June.
              </span>
            </div>
            <p className="band-sub" style={{ marginTop: 0 }}>
              For online business owners who already know what to do and
              haven&apos;t done it.
            </p>
            <a href="#get-in" className="btn">Take the bet →</a>
          </div>
          <div style={{ position: "relative" }}>
            <BouncingChips />
            <Image
              src="/icons/poker-stack.png"
              alt=""
              width={520}
              height={520}
              className="float-icon float-icon--lg"
              priority
            />
          </div>
        </div>
      </Band>

      {/* ---------- MINI FRUIT MACHINE ---------- */}
      <Band color="paper" narrow>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span className="pill-badge">PEEK INSIDE</span>
          <h2 className="text-h2" style={{ marginTop: 12 }}>
            Pull the lever. See what you&apos;re betting on.
          </h2>
        </div>
        <MiniFruitMachine />
      </Band>

      {/* ---------- THE LOOP ---------- */}
      <Band color="pink" narrow>
        <Sticker tab="THE LOOP" tabColor="yellow" tilt="right">
          <h2 className="text-h2">
            You already know what to send. The send button is what&apos;s stopping you.
          </h2>
          <p className="text-body">
            Monday you wrote a follow-up to a £4k prospect. Tuesday you reread it.
            Wednesday you decided the opening line was off. Thursday you rewrote
            the opening line. Friday you closed the laptop with the email still
            in drafts. Saturday it slid down your inbox. Sunday it stopped existing.
          </p>
          <p className="text-body">
            Every online business owner I work with has a version of this loop.
            The pitch in drafts since April. The follow-up you&apos;ll send when
            you&apos;ve got a clearer head. The price you&apos;re going to put
            in the next email, definitely.
          </p>
          <p className="text-body">
            The 100 Minute Bet is what happens when you put the send button on
            the calendar for a week.
          </p>
        </Sticker>
      </Band>

      {/* ---------- WHAT THIS IS (NEW context section) ---------- */}
      <Band color="yellow">
        <div className="two-col two-col--reverse">
          <div>
            <span className="pill-badge pill-badge--pink">WHAT THIS IS</span>
            <h2 className="split-head">
              <span className="line-a">A week-long bet.</span>
              <span className="line-b">Built off the back of a 90-day programme.</span>
            </h2>
            <p className="band-sub">
              <strong>The 100 Reps Club</strong> is my 90-day programme for
              online business owners. You log 100 minutes a week of sales
              activity. You track every rep. You stop guessing whether
              you&apos;re doing the work and start having the data on it.
            </p>
            <p className="band-sub">
              The 100 Minute Bet is the bet-sized version. One week, not
              90 days. 100 minutes, not 100 a week. Same tracker. Free to
              enter. Open to anyone, not just members.
            </p>
            <p className="band-sub">
              The cohort that just ran the full 90 days produced the wins
              further down this page. The bet gives you a taste of the same
              thing with skin in the game.
            </p>
          </div>
          <div>
            <Image
              src="/icons/poker-chip.png"
              alt=""
              width={420}
              height={420}
              className="float-icon"
            />
          </div>
        </div>
      </Band>

      {/* ---------- THE 5Rs (NEW framework section) ---------- */}
      <Band color="pink">
        <span className="pill-badge pill-badge--yellow">THE 5 Rs</span>
        <h2 className="split-head">
          <span className="line-a">Five kinds of sales activity.</span>
          <span className="line-b">Four of them count for the bet.</span>
        </h2>
        <p className="band-sub">
          Every rep you log fits into one of these five. The tracker tags
          each one so you can see what&apos;s working. Reach is excluded
          from the chip bonus because it&apos;s what most people default to
          and the bet is about the other four.
        </p>

        <div className="card-grid">
          <div className="card-grid__item">
            <span className="card-grid__num">R1</span>
            <h3 className="card-grid__title">Reach</h3>
            <p className="card-grid__body">
              Cold outreach. New people who don&apos;t know you yet.
              Counts for minutes, not for the R-chip bonus.
            </p>
          </div>
          <div className="card-grid__item">
            <span className="card-grid__num">R2</span>
            <h3 className="card-grid__title">Reengage</h3>
            <p className="card-grid__body">
              Reaching back out to leads who went cold. The DM thread
              from March. The quote you sent in February.
            </p>
          </div>
          <div className="card-grid__item">
            <span className="card-grid__num">R3</span>
            <h3 className="card-grid__title">Return</h3>
            <p className="card-grid__body">
              Past clients who paid you once and haven&apos;t bought again.
              Specific, named, with a specific next thing.
            </p>
          </div>
          <div className="card-grid__item">
            <span className="card-grid__num">R4</span>
            <h3 className="card-grid__title">Retain</h3>
            <p className="card-grid__body">
              Current clients you could be doing more for. Upsells,
              renewals, the next phase of work.
            </p>
          </div>
          <div className="card-grid__item">
            <span className="card-grid__num">R5</span>
            <h3 className="card-grid__title">Refer</h3>
            <p className="card-grid__body">
              Asking people who already love you to send you someone.
              The hardest one to start. Often the highest return.
            </p>
          </div>
          <div className="card-grid__item" style={{ background: "var(--yellow)" }}>
            <span className="card-grid__num" style={{ color: "var(--ink)" }}>+</span>
            <h3 className="card-grid__title">Chip bonus</h3>
            <p className="card-grid__body">
              Use a non-Reach R during the week and you bank an extra chip
              per type. Max four extra chips, one for each of R2-R5.
            </p>
          </div>
        </div>
      </Band>

      {/* ---------- THE UNIT ---------- */}
      <Band color="pink" narrow>
        <Sticker tab="THE UNIT" tabColor="pink" tilt="tinyLeft">
          <h2 className="text-h2">
            A result is a positive conversation. Not a sale on the day.
          </h2>
          <p className="text-body">
            Worth saying out loud. For the bet, a result is a reply from a
            past client saying yes let&apos;s talk. A referral source coming
            back with a name. A warm lead opening the door for a quote. A
            discovery call booked.
          </p>
          <p className="text-body">
            Sales come from conversations. Conversations come from sends.
            The bet is about getting the conversations into your inbox.
            The sales follow them in their own time.
          </p>
        </Sticker>
      </Band>

      {/* ---------- MECHANICS ---------- */}
      <Band color="pink">
        <span className="pill-badge pill-badge--yellow">THE MECHANICS</span>
        <h2 className="split-head">
          <span className="line-a">Six things to know.</span>
          <span className="line-b">Then place your bet.</span>
        </h2>

        <div className="card-grid">
          <div className="card-grid__item">
            <span className="card-grid__num">01</span>
            <h3 className="card-grid__title">Log 100 minutes between 22 and 29 June.</h3>
            <p className="card-grid__body">
              Pitches, follow-ups, asks, re-engagements, referral requests.
              Anything where the send button is the point.
            </p>
          </div>
          <div className="card-grid__item">
            <span className="card-grid__num">02</span>
            <h3 className="card-grid__title">Log every rep in the tracker.</h3>
            <p className="card-grid__body">
              The tracker is a simple web page. Magic link in your email
              on 22 June, you click in, you log reps. Nothing to install.
            </p>
          </div>
          <div className="card-grid__item">
            <span className="card-grid__num">03</span>
            <h3 className="card-grid__title">Scratch a card every 25 minutes.</h3>
            <p className="card-grid__body">
              Bonus chips. Discount codes off my Dig Your Data report or
              Airtable Lead Tracker. A free resource. Sometimes nothing.
              It&apos;s a scratch card.
            </p>
          </div>
          <div className="card-grid__item">
            <span className="card-grid__num">04</span>
            <h3 className="card-grid__title">Stack chips for every action.</h3>
            <p className="card-grid__body">
              Logging time. Hitting 100. Sales that close mid-week.
              Referrals you send in. Showing up to the party.
            </p>
          </div>
          <div className="card-grid__item">
            <span className="card-grid__num">05</span>
            <h3 className="card-grid__title">Hit 100 and you spin the fruit machine.</h3>
            <p className="card-grid__body">
              Live on Zoom on Sunday 29 June at 7pm. The reels are loaded
              with donated prizes. The jackpot tile is three months of
              100 Reps Club, free.
            </p>
          </div>
          <div className="card-grid__item">
            <span className="card-grid__num">06</span>
            <h3 className="card-grid__title">Chip shop opens on Sunday night.</h3>
            <p className="card-grid__body">
              Spend chips on things you&apos;d use anyway: Dig Your Data,
              the Lead Tracker, money off 100 Reps Club, a 30-minute call
              with me. Shop closes at midnight. Unspent chips expire.
            </p>
          </div>
        </div>
      </Band>

      {/* ---------- GUARANTEE ---------- */}
      <Band color="yellow">
        <div className="two-col">
          <div>
            <span className="pill-badge pill-badge--pink">THE BACKSTOP</span>
            <h2 className="split-head">
              <span className="line-a">Do the 100 minutes properly.</span>
              <span className="line-b">No positive conversation? We jump on a call.</span>
            </h2>
            <p className="band-sub">
              You qualify for the call if you log a full 100 minutes between
              22 and 28 June, use at least two of the non-Reach Rs
              (Reengage, Return, Retain, Refer), send every rep instead of
              leaving anything in drafts, log the outcomes honestly
              including the no&apos;s and the ghosted ones, and submit a
              short evidence form before midnight on 28 June.
            </p>
            <p className="band-sub">
              If you did all of that and still got no positive conversation,
              I&apos;ll get on a 30-minute call with you, read what you
              actually sent, and tell you where the loop is. Then
              we&apos;ll change one thing in your next batch of reps.
            </p>
            <p className="band-sub">
              The point is to finish the 100 minutes and get the
              conversation. The call is the backstop. Most people who do
              the 100 minutes get the conversation. That&apos;s why this
              works as a bet.
            </p>
          </div>
          <div>
            <Image
              src="/icons/scratch-card.png"
              alt=""
              width={420}
              height={420}
              className="float-icon float-icon--tilt-right"
            />
          </div>
        </div>
      </Band>

      {/* ---------- COHORT WINS ---------- */}
      <Band color="pink">
        <span className="pill-badge pill-badge--paper">PROOF FROM THE COHORT</span>
        <h2 className="split-head">
          <span className="line-a">Wins logged by the 100 Reps Club beta.</span>
          <span className="line-b">First three weeks. May 2026.</span>
        </h2>
        <p className="band-sub">
          The 100 Reps Club beta is the 90-day cohort I mentioned earlier.
          54 members, paid £45 to join. These are the wins they logged in
          the wins channel between 5 and 19 May. The same tracker, the
          same Rs, the same logic the bet runs on.
        </p>

        <div className="stat-row">
          <div className="stat-card">
            <span className="stat-card__num">54</span>
            <span className="stat-card__label">Signups (goal was 25)</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__num">37.5%</span>
            <span className="stat-card__label">Made their £45 entry back in week 1</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__num">10%</span>
            <span className="stat-card__label">Tracked 25% of monthly revenue from reps</span>
          </div>
        </div>

        <div className="wins-grid">
          <div className="win-tile">
            <span className="win-tile__name">Emma</span>
            <p className="win-tile__body">
              <span className="win-tile__stat">£1188</span>
              One sale plus a full pipeline of soft no&apos;s and follow-up
              openings. Switched her CTAs to reply-or-ignore.
            </p>
          </div>
          <div className="win-tile">
            <span className="win-tile__name">Claire-Louise</span>
            <p className="win-tile__body">
              <span className="win-tile__stat">2 sales</span>
              One Reengage rep. One direct sale, one stranger sale on a
              course that had been quiet for months.
            </p>
          </div>
          <div className="win-tile">
            <span className="win-tile__name">Fiona</span>
            <p className="win-tile__body">
              <span className="win-tile__stat">Same day</span>
              Sold a Pitch Club beta spot off a Reach email the same
              morning. Signed and paid.
            </p>
          </div>
          <div className="win-tile">
            <span className="win-tile__name">Colie</span>
            <p className="win-tile__body">
              <span className="win-tile__stat">Retain rep</span>
              A February client who had verbally committed paid for the
              signature offer.
            </p>
          </div>
          <div className="win-tile">
            <span className="win-tile__name">Eve</span>
            <p className="win-tile__body">
              <span className="win-tile__stat">2 sales</span>
              First sale of a new course. Second from a personal outreach
              email written during the live co-working call.
            </p>
          </div>
          <div className="win-tile">
            <span className="win-tile__name">Vicky</span>
            <p className="win-tile__body">
              <span className="win-tile__stat">Day 1 rep</span>
              Logged a rep on day one of the cohort. Two weeks later the
              client confirmed they wanted to go ahead.
            </p>
          </div>
          <div className="win-tile">
            <span className="win-tile__name">Pippa</span>
            <p className="win-tile__body">
              <span className="win-tile__stat">First sale</span>
              First sale of a new low-cost training on launch day.
            </p>
          </div>
        </div>

        <p className="band-sub" style={{ marginTop: 36 }}>
          Every one of those came from sending the thing instead of
          redrafting it. The bet is the bet-sized version of the same
          principle.
        </p>
      </Band>

      {/* ---------- WHO'S IN ---------- */}
      <Band color="pink" narrow>
        <Sticker tab="WHO'S IN" tabColor="yellow" tilt="tinyRight">
          <h2 className="text-h2">
            You&apos;re a fit if <span className="accent">three</span> of these are true.
          </h2>
          <p className="text-body">
            You run an online business. Coaching, consulting, copywriting,
            design, photography, VA, OBM, agency, fractional anything.
          </p>
          <p className="text-body">
            You have at least one warm lead, past client, or referral
            source you haven&apos;t followed up with in the last 60 days.
          </p>
          <p className="text-body">
            You already know what a good follow-up looks like. The teaching
            isn&apos;t what&apos;s missing. The week where you actually do
            them is.
          </p>
          <p className="text-body">
            You&apos;ve spent more on courses, masterminds, programmes, or
            coaches in the last 12 months than you&apos;ve spent following
            up with your existing list.
          </p>
          <p className="text-body">
            You can find 100 minutes between 22 and 29 June. That&apos;s
            14 minutes a day.
          </p>
        </Sticker>
      </Band>

      {/* ---------- FOUNDER ---------- */}
      <Band color="yellow">
        <div className="two-col two-col--reverse">
          <div>
            <span className="pill-badge pill-badge--pink">WHO BUILT THIS</span>
            <h2 className="split-head">
              <span className="line-a">I built this because</span>
              <span className="line-b">I got bored of watching it happen.</span>
            </h2>
            <p className="band-sub">
              I&apos;m Zoë. Falling Forwards Ltd, Northern, founded 2023.
              Before that, three years working behind the scenes on online
              business launches, plus a stint as head wedding coordinator
              at a venue with £3.25M of annual revenue. That job taught me
              that a calendar full of bookings comes from one specific
              thing: somebody following up.
            </p>
            <p className="band-sub">
              The bet exists because I kept watching qualified online
              business owners buy more courses while sitting on lists of
              warm leads they weren&apos;t following up with. Same loop.
              Same drafts folder. If you&apos;re on the guarantee call,
              you&apos;re talking to me. One person. Reading what you sent.
            </p>
          </div>
          <div className="photo-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ZOE_PHOTO_URL}
              alt="Zoë Dew, founder of Falling Forwards Ltd"
              className="photo-frame__img"
            />
            <span className="photo-frame__sticker photo-frame__sticker--top-right">
              NORTHERN
            </span>
            <span className="photo-frame__sticker photo-frame__sticker--mid-left">
              FOUNDED 2023
            </span>
            <span className="photo-frame__sticker photo-frame__sticker--bottom-right">
              ONE PERSON ON THE CALL
            </span>
          </div>
        </div>
      </Band>

      {/* ---------- REGISTRATION ---------- */}
      <Band color="pink" narrow id="get-in">
        <Sticker tab="GET IN" tabColor="pink" tilt="left">
          <h2 className="text-h2">Place your bet.</h2>
          <p className="text-body">
            Free to enter. The bet starts Sunday 22 June. The party is
            Sunday 29 June at 7pm UK on Zoom.
          </p>
          <p className="text-body" style={{ marginBottom: 8 }}>
            Already a 100 Reps Club member? You&apos;re already in. Separate
            email to you on the 22nd.
          </p>
          <div style={{ marginTop: 16 }}>
            <RegistrationForm earlyAccessPassword={earlyAccessPassword} />
          </div>
        </Sticker>
      </Band>

      {/* ---------- OBJECTIONS ---------- */}
      <Band color="pink">
        <span className="pill-badge pill-badge--yellow">BUT WHAT IF</span>
        <h2 className="split-head">
          <span className="line-a">The things</span>
          <span className="line-b">you&apos;re already telling yourself.</span>
        </h2>

        <div className="obj-grid">
          <div className="obj-tile">
            <span className="obj-tile__quote">&quot;I don&apos;t have 100 minutes.&quot;</span>
            <p className="obj-tile__body">
              You have 14 minutes a day for a week. If you don&apos;t, what
              you&apos;ve got is a hobby that owes you money. Book the time
              anyway.
            </p>
          </div>
          <div className="obj-tile">
            <span className="obj-tile__quote">&quot;Slow month, don&apos;t want to push.&quot;</span>
            <p className="obj-tile__body">
              Slow months are when reps compound. A quiet calendar is made
              of decisions not to follow up. The week works in your favour
              when you&apos;re slow.
            </p>
          </div>
          <div className="obj-tile">
            <span className="obj-tile__quote">&quot;Not the type for gimmicks.&quot;</span>
            <p className="obj-tile__body">
              The chips are the joke. The reps are the point. Ignore the
              casino aesthetic and just log your minutes if you&apos;d
              rather. The bet still counts.
            </p>
          </div>
          <div className="obj-tile">
            <span className="obj-tile__quote">&quot;What if I do 100 minutes and nothing happens?&quot;</span>
            <p className="obj-tile__body">
              You qualify for the guarantee call. 30 minutes with me, I
              read what you sent, we work out why and change one thing in
              your next batch.
            </p>
          </div>
          <div className="obj-tile">
            <span className="obj-tile__quote">&quot;I&apos;m already in the 100 Reps Club.&quot;</span>
            <p className="obj-tile__body">
              You&apos;re already in the bet. Chips, fruit machine, party,
              all for you. The cart open on the 29th is so you can renew or
              upgrade.
            </p>
          </div>
        </div>
      </Band>

      {/* ---------- PARTY ---------- */}
      <Band color="felt">
        <div className="two-col">
          <div>
            <span className="pill-badge pill-badge--yellow">SUNDAY 29 JUNE · 7PM UK</span>
            <h2 className="split-head">
              <span className="line-a">The casino party.</span>
              <span className="line-b">90 minutes on Zoom.</span>
            </h2>
            <p className="band-sub">
              The leaderboard goes up. The cohort odds get revealed. Two
              or three people share their best rep of the week. Everyone
              who hit 100 minutes spins the fruit machine, live, one at a
              time. The chip shop opens. The 100 Reps Club cart opens at
              the close of the night.
            </p>
            <p className="band-sub">
              You don&apos;t have to buy a thing. The party is the party
              either way.
            </p>
            <a href="#get-in" className="btn btn--yellow">Take the bet →</a>
          </div>
          <div>
            <Image
              src="/icons/fruit-machine.png"
              alt=""
              width={480}
              height={480}
              className="float-icon float-icon--lg"
            />
          </div>
        </div>
      </Band>

      <Marquee items={MARQUEE_ITEMS} />

      <footer
        style={{
          padding: "40px 16px 56px",
          textAlign: "center",
          background: "var(--pink-soft)",
        }}
      >
        <p className="text-small">Falling Forwards Ltd. Built by Zoë Dew.</p>
      </footer>
    </main>
  );
}
