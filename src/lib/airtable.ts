import { env } from "./env";

// Minimal typed wrapper around the Airtable REST API.
// Server-only. Never import from a "use client" file.

const API_BASE = "https://api.airtable.com/v0";

type AirtableRecord<T> = {
  id: string;
  createdTime: string;
  fields: T;
};

type AirtableListResponse<T> = {
  records: AirtableRecord<T>[];
  offset?: string;
};

async function airtableFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.airtableApiKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status} on ${path}: ${text}`);
  }
  return (await res.json()) as T;
}

// ---------------- Bet Participants ----------------

export type BetParticipantFields = {
  "Bet Participant"?: string;
  "First Name"?: string;
  "Last Name"?: string;
  Email?: string;
  Status?: string;
  "Entry Type"?: "Beta Cohort Member" | "New Participant";
  "Referral Code"?: string; // formula, read-only
  "Referral Link"?: string; // formula, read-only
  "Bet Participant ID"?: string; // formula, read-only
  "Referred By"?: string[]; // linked record IDs
};

export async function findBetParticipantByEmail(
  email: string
): Promise<AirtableRecord<BetParticipantFields> | null> {
  // Airtable filterByFormula needs the email escaped. Lowercase both sides
  // so people who registered with different case still match.
  const safeEmail = email.trim().toLowerCase().replace(/'/g, "\\'");
  const formula = `LOWER({Email}) = '${safeEmail}'`;
  const params = new URLSearchParams({
    filterByFormula: formula,
    maxRecords: "1",
    pageSize: "1",
  });
  const data = await airtableFetch<AirtableListResponse<BetParticipantFields>>(
    `/${env.airtableBaseId}/${env.airtableBetParticipantsTableId}?${params.toString()}`
  );
  return data.records[0] ?? null;
}

export async function findBetParticipantByReferralCode(
  code: string
): Promise<AirtableRecord<BetParticipantFields> | null> {
  const safeCode = code.trim().toLowerCase().replace(/'/g, "\\'");
  const formula = `LOWER({Referral Code}) = '${safeCode}'`;
  const params = new URLSearchParams({
    filterByFormula: formula,
    maxRecords: "1",
    pageSize: "1",
  });
  const data = await airtableFetch<AirtableListResponse<BetParticipantFields>>(
    `/${env.airtableBaseId}/${env.airtableBetParticipantsTableId}?${params.toString()}`
  );
  return data.records[0] ?? null;
}

export async function findBetParticipantById(
  id: string
): Promise<AirtableRecord<BetParticipantFields> | null> {
  try {
    return await airtableFetch<AirtableRecord<BetParticipantFields>>(
      `/${env.airtableBaseId}/${env.airtableBetParticipantsTableId}/${id}`
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes(" 404 ")) return null;
    throw err;
  }
}

export async function createBetParticipant(input: {
  firstName: string;
  lastName: string;
  email: string;
  entryType: "New Participant" | "Beta Cohort Member";
  referredBy?: string;
}): Promise<AirtableRecord<BetParticipantFields>> {
  const fields: BetParticipantFields = {
    "Bet Participant": `${input.firstName} ${input.lastName}`,
    "First Name": input.firstName,
    "Last Name": input.lastName,
    Email: input.email,
    Status: "Registered",
    "Entry Type": input.entryType,
  };
  if (input.referredBy) {
    fields["Referred By"] = [input.referredBy];
  }
  const data = await airtableFetch<AirtableRecord<BetParticipantFields>>(
    `/${env.airtableBaseId}/${env.airtableBetParticipantsTableId}`,
    {
      method: "POST",
      body: JSON.stringify({ fields, typecast: true }),
    }
  );
  return data;
}

// ---------------- Chips ----------------

export type ChipEventFields = {
  "Chip Event"?: string;
  "Bet Participant"?: string[];
  Amount?: number;
  Type?: "Earned" | "Spent" | "Adjustment";
  Reason?: string;
  Notes?: string;
  "Idempotency Key"?: string;
};

export async function findChipEventByIdempotencyKey(
  key: string
): Promise<AirtableRecord<ChipEventFields> | null> {
  const safeKey = key.replace(/'/g, "\\'");
  const formula = `{Idempotency Key} = '${safeKey}'`;
  const params = new URLSearchParams({
    filterByFormula: formula,
    maxRecords: "1",
    pageSize: "1",
  });
  const data = await airtableFetch<AirtableListResponse<ChipEventFields>>(
    `/${env.airtableBaseId}/${env.airtableChipsTableId}?${params.toString()}`
  );
  return data.records[0] ?? null;
}

export async function createChipEvent(input: {
  betParticipantId: string;
  participantDisplayName: string;
  amount: number;
  type: "Earned" | "Spent" | "Adjustment";
  reason: string;
  notes?: string;
  idempotencyKey: string;
}): Promise<AirtableRecord<ChipEventFields>> {
  // Idempotent: if a row with this key already exists, return it.
  const existing = await findChipEventByIdempotencyKey(input.idempotencyKey);
  if (existing) return existing;

  const fields: ChipEventFields = {
    "Chip Event": `${input.participantDisplayName} - ${input.reason}`,
    "Bet Participant": [input.betParticipantId],
    Amount: input.amount,
    Type: input.type,
    Reason: input.reason,
    "Idempotency Key": input.idempotencyKey,
  };
  if (input.notes) fields.Notes = input.notes;

  const data = await airtableFetch<AirtableRecord<ChipEventFields>>(
    `/${env.airtableBaseId}/${env.airtableChipsTableId}`,
    {
      method: "POST",
      body: JSON.stringify({ fields, typecast: true }),
    }
  );
  return data;
}
