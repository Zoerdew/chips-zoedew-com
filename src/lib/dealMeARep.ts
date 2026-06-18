// Deal Me A Rep — the deck data and combination logic.
// Two 13-card decks. The user clicks "Deal me a rep" and gets one
// WHO + one ACTION, which combine into a single one-sentence prompt.
//
// Most combos use a generic template. The awkward ones (Ghosted Lead +
// Invite For Coffee, etc.) get a hand-written override so the deck
// stays usable. Overrides live in the OVERRIDES map below; everything
// else falls through to the template.

export type Who = {
  slug: string;
  label: string;
};

export type Action = {
  slug: string;
  label: string;
};

export const WHO_DECK: Who[] = [
  { slug: "past-client", label: "Past Client" },
  { slug: "current-client", label: "Current Client" },
  { slug: "warm-lead", label: "Warm Lead" },
  { slug: "cold-lead", label: "Cold Lead" },
  { slug: "ghosted-lead", label: "Ghosted Lead" },
  { slug: "email-subscriber", label: "Email Subscriber" },
  { slug: "instagram-follower", label: "Instagram Follower" },
  { slug: "linkedin-contact", label: "LinkedIn Contact" },
  { slug: "referral-partner", label: "Referral Partner" },
  { slug: "former-colleague", label: "Former Colleague" },
  { slug: "networking-contact", label: "Networking Contact" },
  { slug: "recent-engager", label: "Recent Engager" },
  { slug: "dream-client", label: "Dream Client" },
];

export const ACTION_DECK: Action[] = [
  { slug: "follow-up", label: "Follow Up" },
  { slug: "send-a-dm", label: "Send A DM" },
  { slug: "send-an-email", label: "Send An Email" },
  { slug: "ask-a-question", label: "Ask A Question" },
  { slug: "share-a-resource", label: "Share A Resource" },
  { slug: "invite-for-coffee", label: "Invite For Coffee" },
  { slug: "send-a-voicenote", label: "Send A Voice Note" },
  { slug: "make-an-offer", label: "Make An Offer" },
  { slug: "reconnect", label: "Reconnect" },
  { slug: "check-in", label: "Check In" },
  { slug: "pitch-a-collaboration", label: "Pitch A Collaboration" },
  { slug: "open-a-door", label: "Open A Door" },
  { slug: "start-a-conversation", label: "Start A Conversation" },
];

// How each WHO sits inside a sentence. e.g. "a past client", "your dream client".
const WHO_NOUN: Record<string, string> = {
  "past-client": "a past client",
  "current-client": "a current client",
  "warm-lead": "a warm lead",
  "cold-lead": "a cold lead",
  "ghosted-lead": "a lead who ghosted you",
  "email-subscriber": "an email subscriber",
  "instagram-follower": "an Instagram follower",
  "linkedin-contact": "a LinkedIn contact",
  "referral-partner": "a referral partner",
  "former-colleague": "a former colleague",
  "networking-contact": "someone you met networking",
  "recent-engager": "someone who recently engaged with your work",
  "dream-client": "a dream client",
};

// Default template per ACTION. {who} is the substitution slot.
const ACTION_TEMPLATE: Record<string, string> = {
  "follow-up": "Follow up with {who} today.",
  "send-a-dm": "Send a DM to {who} today.",
  "send-an-email": "Send {who} an email today.",
  "ask-a-question": "Ask {who} a question today.",
  "share-a-resource": "Share a resource with {who} today.",
  "invite-for-coffee": "Invite {who} for a virtual coffee today.",
  "send-a-voicenote": "Send {who} a voice note today.",
  "make-an-offer": "Make an offer to {who} today.",
  reconnect: "Reconnect with {who} today.",
  "check-in": "Check in with {who} today.",
  "pitch-a-collaboration": "Pitch a collaboration to {who} today.",
  "open-a-door": "Open a door for {who} today.",
  "start-a-conversation": "Start a conversation with {who} today.",
};

// Hand-written overrides for combos that read clunky or wrong with the
// default template. Keyed by `${whoSlug}__${actionSlug}`.
const OVERRIDES: Record<string, string> = {
  // Cold leads don't get coffee invites cold.
  "cold-lead__invite-for-coffee":
    "Warm up a cold lead with a quick value-first message today, then float a coffee.",
  "cold-lead__make-an-offer":
    "Find the warmest reason a cold lead might say yes, then make the offer today.",
  "cold-lead__reconnect":
    "Open a door with a cold lead today. There is no reconnection yet, only a first connection.",
  "cold-lead__check-in":
    "Check in with a cold lead with a real reason, not a 'just checking in' line.",

  // Ghosted leads need acknowledgement, not pretending.
  "ghosted-lead__follow-up":
    "Send a no-pressure follow up to a lead who ghosted you. Give them an easy yes or an easy no.",
  "ghosted-lead__send-a-dm":
    "Send a DM to a lead who ghosted you. Reply or ignore. No guilt.",
  "ghosted-lead__send-an-email":
    "Email a lead who ghosted you with one clear question and a reply-or-ignore close.",
  "ghosted-lead__invite-for-coffee":
    "Invite a ghosted lead for a 15 minute call with a clear agenda. Reply or ignore.",
  "ghosted-lead__make-an-offer":
    "Reopen the door with a ghosted lead by making the offer again, no recap, no guilt.",
  "ghosted-lead__pitch-a-collaboration":
    "Skip the pitch. Send a ghosted lead one direct line and let them choose to come back.",
  "ghosted-lead__start-a-conversation":
    "Start a fresh conversation with a ghosted lead like nothing happened.",
  "ghosted-lead__reconnect":
    "Reconnect with a ghosted lead. One sentence. No catch-up. Reply or ignore.",
  "ghosted-lead__check-in":
    "Check in with a ghosted lead with a real reason, not a 'just checking in' line.",

  // Email subscribers can't get a coffee invite via email very naturally.
  "email-subscriber__invite-for-coffee":
    "Reply to an email subscriber and invite them on a 15 minute call today.",
  "email-subscriber__send-a-dm":
    "Find an email subscriber on social and send them a DM today.",
  "email-subscriber__send-a-voicenote":
    "Reply to an email subscriber and send them a voice note today.",

  // Current clients don't need a "first contact" verb.
  "current-client__open-a-door":
    "Open a door for a current client today. An intro, a referral, a recommendation.",
  "current-client__start-a-conversation":
    "Start a fresh conversation with a current client about what's next.",
  "current-client__pitch-a-collaboration":
    "Pitch a current client on doing more together. A bigger scope, a renewal, a referral swap.",
  "current-client__reconnect":
    "Reconnect with a current client you have not heard from in a while.",
  "current-client__make-an-offer":
    "Make a next-step offer to a current client today.",

  // Past clients are warm but also done. Lean into the warmth.
  "past-client__reconnect":
    "Reconnect with a past client today. One line. No favour ask.",
  "past-client__open-a-door":
    "Open a door for a past client today. A recommendation, an intro, a tag.",
  "past-client__make-an-offer":
    "Make a return-to-work offer to a past client today.",

  // Referral partners want a give-first move.
  "referral-partner__make-an-offer":
    "Offer a referral partner something they can pass on to their list today.",
  "referral-partner__follow-up":
    "Follow up with a referral partner on something they sent you, or something you owe them.",
  "referral-partner__invite-for-coffee":
    "Invite a referral partner for a virtual coffee with a swap on the agenda.",

  // Networking contacts: keep it informal.
  "networking-contact__make-an-offer":
    "Offer a networking contact a free resource or an intro today, no pitch attached.",
  "networking-contact__pitch-a-collaboration":
    "Pitch a small collaboration to a networking contact you clicked with.",

  // Recent engagers — strike while warm.
  "recent-engager__follow-up":
    "Follow up with someone who recently engaged. Take the warmth somewhere.",
  "recent-engager__make-an-offer":
    "Move a recent engager from like to lead. Make a soft offer today.",
  "recent-engager__open-a-door":
    "Open a door for someone who recently engaged with your work today.",

  // Dream clients — measured, not desperate.
  "dream-client__make-an-offer":
    "Make a dream client an offer today, even if it feels too soon.",
  "dream-client__send-a-voicenote":
    "Send a dream client a voice note about something specific they posted.",
  "dream-client__pitch-a-collaboration":
    "Pitch a dream client on something small you could collaborate on, not the main thing.",

  // Former colleagues / LinkedIn / Instagram-specific phrasing fixes.
  "former-colleague__make-an-offer":
    "Reconnect with a former colleague and make a soft offer to work together.",
  "former-colleague__send-a-dm":
    "Send a former colleague a DM today. No reason needed.",
  "linkedin-contact__send-a-voicenote":
    "Send a LinkedIn contact a voice note via DM today.",
  "instagram-follower__send-an-email":
    "DM an Instagram follower and ask if you can send a longer email about something they showed interest in.",
};

export type DealResult = {
  who: Who;
  action: Action;
  sentence: string;
};

export function buildSentence(who: Who, action: Action): string {
  const key = `${who.slug}__${action.slug}`;
  if (OVERRIDES[key]) return OVERRIDES[key];
  const template = ACTION_TEMPLATE[action.slug];
  const noun = WHO_NOUN[who.slug];
  return template.replace("{who}", noun);
}

// Pick one WHO + one ACTION, optionally avoiding a previously dealt pair
// (dedupe: the next deal won't repeat the last pair exactly).
export function deal(previous?: DealResult | null): DealResult {
  for (let i = 0; i < 20; i++) {
    const who = WHO_DECK[Math.floor(Math.random() * WHO_DECK.length)];
    const action =
      ACTION_DECK[Math.floor(Math.random() * ACTION_DECK.length)];
    if (
      previous &&
      previous.who.slug === who.slug &&
      previous.action.slug === action.slug
    ) {
      continue;
    }
    return {
      who,
      action,
      sentence: buildSentence(who, action),
    };
  }
  // Extremely unlikely fallback after 20 tries
  const who = WHO_DECK[0];
  const action = ACTION_DECK[0];
  return { who, action, sentence: buildSentence(who, action) };
}
