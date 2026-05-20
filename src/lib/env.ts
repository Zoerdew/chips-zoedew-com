function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  airtableApiKey: required("AIRTABLE_API_KEY"),
  airtableBaseId: required("AIRTABLE_BASE_ID"),
  airtableBetParticipantsTableId: required("AIRTABLE_BET_PARTICIPANTS_TABLE_ID"),
  airtableChipsTableId: required("AIRTABLE_CHIPS_TABLE_ID"),
  airtableScratchCardsTableId: required("AIRTABLE_SCRATCH_CARDS_TABLE_ID"),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://chips.zoedew.com",
};
