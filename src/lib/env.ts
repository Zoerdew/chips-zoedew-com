function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  // Airtable
  airtableApiKey: required("AIRTABLE_API_KEY"),
  airtableBaseId: required("AIRTABLE_BASE_ID"),
  airtableBetParticipantsTableId: required("AIRTABLE_BET_PARTICIPANTS_TABLE_ID"),
  airtableChipsTableId: required("AIRTABLE_CHIPS_TABLE_ID"),
  airtableScratchCardsTableId: required("AIRTABLE_SCRATCH_CARDS_TABLE_ID"),
  airtableRepsTableId: required("AIRTABLE_REPS_TABLE_ID"),

  // Resend
  resendApiKey: required("RESEND_API_KEY"),
  resendFromEmail: optional("RESEND_FROM_EMAIL", "bet@zoedew.com"),
  resendFromName: optional("RESEND_FROM_NAME", "The 100 Minute Bet"),
  resendReplyTo: optional("RESEND_REPLY_TO", "zoe@zoedew.com"),

  // Auth
  sessionSecret: required("SESSION_SECRET"),

  // Site
  siteUrl: optional("NEXT_PUBLIC_SITE_URL", "https://chips.zoedew.com"),
};
