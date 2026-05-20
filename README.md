# chips.zoedew.com

The 100 Minute Bet landing page. Next.js 14, TypeScript, Tailwind, deployed on Vercel.

## What lives here

- Landing page at `/` — sticker-styled marketing page, registration form.
- `POST /api/register` — server route. Creates a Bet Participant in Airtable, sets Referred By if a `?ref=` code was carried in, awards 3 chips to the referrer with an idempotency key.
- `GET /api/share-image?name=Zoe&ref=zoedew0a3f` — personalised 1080x1080 PNG with the participant's first name on a poker chip, a QR code that links to their referral URL, and the dates. Used inline on the success state and downloadable from there.

The portal (auth-gated tracker, chip counter, scratch cards, fruit machine, leaderboard) is a separate build that comes next.

## Setup

```bash
cd chips-zoedew-com
npm install
cp .env.local.example .env.local
# Fill in the Airtable token in .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

Set these in `.env.local` for local dev, and in Vercel's project settings for production.

| Name | Where to get it |
|---|---|
| `AIRTABLE_API_KEY` | Airtable personal access token. Scope: `data.records:read`, `data.records:write` on the `100 Minute Reps v2.0` base. |
| `AIRTABLE_BASE_ID` | `appGtVc9Qki1s4EQc` (locked) |
| `AIRTABLE_BET_PARTICIPANTS_TABLE_ID` | `tblZq1aMffafqSq6P` (locked) |
| `AIRTABLE_CHIPS_TABLE_ID` | `tbltaGdpHGYOkeTDB` (locked) |
| `AIRTABLE_SCRATCH_CARDS_TABLE_ID` | `tblrszv1OYydoJ95g` (locked) |
| `NEXT_PUBLIC_SITE_URL` | `https://chips.zoedew.com` in prod, `http://localhost:3000` in dev. |

## Airtable token

1. Go to https://airtable.com/create/tokens
2. Create a token. Name it `chips.zoedew.com register`.
3. Scopes: `data.records:read`, `data.records:write`. (`schema.bases:read` is optional but useful for debugging.)
4. Access: add the `100 Minute Reps v2.0` base only. Don't give it access to other bases.
5. Copy the token. Paste it into `.env.local` and into Vercel.

## Deploy to Vercel

1. Push this folder to a Git repo (GitHub recommended).
2. Vercel dashboard, New Project, import the repo.
3. Framework preset: Next.js (auto-detected).
4. Add all env vars from the table above.
5. Deploy.
6. After first deploy: Settings, Domains. Add `chips.zoedew.com`. Vercel will give you a CNAME or A record to set on the zoedew.com DNS. Set that record at your registrar.
7. Wait a few minutes for DNS to propagate. Vercel auto-provisions the TLS cert.

## Confirmation email

The site doesn't send any email. After a successful `/api/register`, the Bet Participant row appears in Airtable. Set up an Airtable Automation:

1. Trigger: when a new record is created in **Bet Participants**, AND `Entry Type` is **New Participant**.
2. Action: send email via your existing email tool (Resend, ConvertKit, Kit, whichever). Subject and body of your choice. Include the participant's personalised share image URL and referral link in the email so they can save it for posting later.

The personalised image URL is `https://chips.zoedew.com/api/share-image?name={First Name}&ref={Referral Code}`.
The referral link is the `Referral Link` formula field on the record.

## Common gotchas

- **Bricolage Grotesque font in the OG image.** Loaded at runtime from a CDN. If image generation 500s, check that fetch is reaching the font CDN. The route is on the Node runtime, not edge, so this works on Vercel by default.
- **Race condition on duplicate emails.** The duplicate-check is best-effort. Two submissions from the same email within milliseconds could both pass the check. Risk is low for a one-week activation; if a duplicate slips through, delete one row in Airtable.
- **Chip race condition on referral chips.** If the same `?ref=` link is shared and two people register through it simultaneously, both spawn separate `Referral` chip events for the referrer. That's the desired behaviour. The idempotency key is `referral-{referrerId}-{newParticipantId}` so each unique referee only ever earns the referrer one chip event, even on retries.

## File layout

```
src/
  app/
    layout.tsx                Root layout, font, metadata
    page.tsx                  The landing page itself
    globals.css               Brand CSS variables and component styles
    api/
      register/route.ts       POST handler that creates Bet Participants
      share-image/route.tsx   GET handler that renders the personalised PNG
  components/
    Marquee.tsx               Scrolling yellow band
    Sticker.tsx               Sticker layout primitive
    RegistrationForm.tsx      Client component with form, success state, share image, copy-link button
  lib/
    env.ts                    Required-env-var guards
    airtable.ts               Typed wrappers around the Airtable REST API
```
