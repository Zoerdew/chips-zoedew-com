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

// ---------------- Reps (100 Minute Reps Tracker) ----------------

export type RepFields = {
  "Minutes Spent"?: number;
  "Revenue R"?: string;
  Outcome?: string[];
  Notes?: string;
  "Bet Participant"?: string[];
  "Bet Cohort"?: boolean;
  Participant?: string[]; // link to Participants table (dual-members)
  "Money Made"?: number;
};

export async function createRep(input: {
  betParticipantId: string;
  minutes: number;
  revenueR: string;
  outcome: string;
  note: string;
  participantLinkId?: string;
}): Promise<AirtableRecord<RepFields>> {
  const fields: Record<string, unknown> = {
    "Minutes Spent": input.minutes,
    "Revenue R": input.revenueR,
    Outcome: [input.outcome],
    Notes: input.note,
    "Bet Participant": [input.betParticipantId],
    "Bet Cohort": true,
  };
  if (input.participantLinkId) {
    fields["Participant"] = [input.participantLinkId];
  }
  const data = await airtableFetch<AirtableRecord<RepFields>>(
    `/${env.airtableBaseId}/${env.airtableRepsTableId}`,
    {
      method: "POST",
      body: JSON.stringify({ fields, typecast: true }),
    }
  );
  return data;
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
  "Source Rep"?: string[];
  "Source Scratch Card"?: string[];
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

// True if a chip event with this idempotency key already exists.
export async function chipExists(key: string): Promise<boolean> {
  return (await findChipEventByIdempotencyKey(key)) !== null;
}

// Sum bet minutes directly from the reps table. Used by the chip engine
// straight after a write, when the Airtable rollup hasn't recomputed yet.
// Returns minutes and the set of non-Reach Rs used across all bet reps.
export async function sumBetReps(
  betParticipantId: string
): Promise<{ minutes: number; rsUsed: Set<string> }> {
  let offset: string | undefined;
  let minutes = 0;
  const rsUsed = new Set<string>();
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (offset) params.set("offset", offset);
    const data = await airtableFetch<AirtableListResponse<RepFields>>(
      `/${env.airtableBaseId}/${env.airtableRepsTableId}?${params.toString()}`
    );
    for (const rec of data.records) {
      const linked = (rec.fields["Bet Participant"] as string[] | undefined) ?? [];
      if (!linked.includes(betParticipantId)) continue;
      minutes += rec.fields["Minutes Spent"] ?? 0;
      const r = rec.fields["Revenue R"];
      if (r && r !== "Reach") rsUsed.add(r);
    }
    offset = data.offset;
  } while (offset);
  return { minutes, rsUsed };
}

// Read a participant's live stats straight off the Bet Participant record.
// Chip Balance, Total Bet Minutes etc. are rollup/formula fields maintained
// by Airtable, so a single record fetch gives accurate numbers.
export type BetParticipantStats = {
  chipBalance: number;
  totalBetMinutes: number;
  rsUsed: string[];
  hit100At: string | null;
  status: string | null;
};

export async function getBetParticipantStats(
  betParticipantId: string
): Promise<BetParticipantStats> {
  const rec = await findBetParticipantById(betParticipantId);
  if (!rec) {
    return {
      chipBalance: 0,
      totalBetMinutes: 0,
      rsUsed: [],
      hit100At: null,
      status: null,
    };
  }
  const f = rec.fields as Record<string, unknown>;
  return {
    chipBalance: typeof f["Chip Balance"] === "number" ? (f["Chip Balance"] as number) : 0,
    totalBetMinutes:
      typeof f["Total Bet Minutes"] === "number" ? (f["Total Bet Minutes"] as number) : 0,
    rsUsed: Array.isArray(f["Rs Used"]) ? (f["Rs Used"] as string[]) : [],
    hit100At: typeof f["Hit 100 At"] === "string" ? (f["Hit 100 At"] as string) : null,
    status: typeof f["Status"] === "string" ? (f["Status"] as string) : null,
  };
}

// Convenience: just the chip balance, used by the portal header.
export async function getChipBalance(betParticipantId: string): Promise<number> {
  const stats = await getBetParticipantStats(betParticipantId);
  return stats.chipBalance;
}

export async function createChipEvent(input: {
  betParticipantId: string;
  participantDisplayName: string;
  amount: number;
  type: "Earned" | "Spent" | "Adjustment";
  reason: string;
  notes?: string;
  idempotencyKey: string;
  sourceRepId?: string;
  sourceScratchCardId?: string;
  shopPrize?: string;
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
  if (input.sourceRepId) fields["Source Rep"] = [input.sourceRepId];
  if (input.sourceScratchCardId)
    fields["Source Scratch Card"] = [input.sourceScratchCardId];
  if (input.shopPrize)
    (fields as Record<string, unknown>)["Shop Prize"] = input.shopPrize;

  const data = await airtableFetch<AirtableRecord<ChipEventFields>>(
    `/${env.airtableBaseId}/${env.airtableChipsTableId}`,
    {
      method: "POST",
      body: JSON.stringify({ fields, typecast: true }),
    }
  );
  return data;
}

// Count how many times each given prize key appears in chip-event notes.
// Every fruit machine spin writes a chip row whose Notes contains
// "Fruit machine spin: {prizeKey}", so this is the source of truth for
// how many of a capped prize have been won across everyone.
export async function countFruitMachineWins(
  prizeKeys: string[]
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const k of prizeKeys) counts[k] = 0;

  let offset: string | undefined;
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (offset) params.set("offset", offset);
    const data = await airtableFetch<AirtableListResponse<ChipEventFields>>(
      `/${env.airtableBaseId}/${env.airtableChipsTableId}?${params.toString()}`
    );
    for (const rec of data.records) {
      const notes = (rec.fields.Notes as string | undefined) ?? "";
      if (!notes.startsWith("Fruit machine spin:")) continue;
      for (const k of prizeKeys) {
        if (notes.includes(k)) counts[k] += 1;
      }
    }
    offset = data.offset;
  } while (offset);

  return counts;
}

// List a participant's chip events, newest first. For the chip ledger.
export type ChipLedgerEntry = {
  id: string;
  amount: number;
  type: "Earned" | "Spent" | "Adjustment";
  reason: string;
  notes: string | null;
  createdAt: string | null;
};

export async function listChipEvents(
  betParticipantId: string
): Promise<ChipLedgerEntry[]> {
  let offset: string | undefined;
  const out: ChipLedgerEntry[] = [];
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (offset) params.set("offset", offset);
    const data = await airtableFetch<AirtableListResponse<ChipEventFields>>(
      `/${env.airtableBaseId}/${env.airtableChipsTableId}?${params.toString()}`
    );
    for (const rec of data.records) {
      const linked = (rec.fields["Bet Participant"] as string[] | undefined) ?? [];
      if (!linked.includes(betParticipantId)) continue;
      const f = rec.fields as Record<string, unknown>;
      out.push({
        id: rec.id,
        amount: typeof f.Amount === "number" ? (f.Amount as number) : 0,
        type: (f.Type as ChipLedgerEntry["type"]) ?? "Earned",
        reason: (f.Reason as string) ?? "",
        notes: (f.Notes as string) ?? null,
        createdAt:
          (f.Created as string) ?? (rec.createdTime as string) ?? null,
      });
    }
    offset = data.offset;
  } while (offset);

  // Newest first.
  out.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
  return out;
}

// ---------------- Scratch Cards ----------------

export type ScratchOutcome =
  | "No win"
  | "1 bonus chip"
  | "10% off Dig Your Data"
  | "10% off Lead Tracker"
  | "Free resource"
  | "2 bonus chips";

export type ScratchCardFields = {
  "Scratch Card"?: string;
  "Bet Participant"?: string[];
  "Trigger Threshold"?: number;
  Outcome?: ScratchOutcome;
  "Outcome Tier"?: string;
  "Discount Code"?: string;
  "Free Resource"?: string;
  Revealed?: boolean;
  "Revealed At"?: string;
};

export async function createScratchCard(input: {
  betParticipantId: string;
  participantDisplayName: string;
  triggerThreshold: number;
  outcome: ScratchOutcome;
  outcomeTier: string;
  discountCode?: string;
  freeResource?: string;
}): Promise<AirtableRecord<ScratchCardFields>> {
  const fields: ScratchCardFields = {
    "Scratch Card": `${input.participantDisplayName} - ${input.triggerThreshold} min`,
    "Bet Participant": [input.betParticipantId],
    "Trigger Threshold": input.triggerThreshold,
    Outcome: input.outcome,
    "Outcome Tier": input.outcomeTier,
    Revealed: false,
  };
  if (input.discountCode) fields["Discount Code"] = input.discountCode;
  if (input.freeResource) fields["Free Resource"] = input.freeResource;

  const data = await airtableFetch<AirtableRecord<ScratchCardFields>>(
    `/${env.airtableBaseId}/${env.airtableScratchCardsTableId}`,
    {
      method: "POST",
      body: JSON.stringify({ fields, typecast: true }),
    }
  );
  return data;
}

// List all scratch cards for a participant.
export async function listScratchCards(
  betParticipantId: string
): Promise<AirtableRecord<ScratchCardFields>[]> {
  let offset: string | undefined;
  const out: AirtableRecord<ScratchCardFields>[] = [];
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (offset) params.set("offset", offset);
    const data = await airtableFetch<AirtableListResponse<ScratchCardFields>>(
      `/${env.airtableBaseId}/${env.airtableScratchCardsTableId}?${params.toString()}`
    );
    for (const rec of data.records) {
      const linked = (rec.fields["Bet Participant"] as string[] | undefined) ?? [];
      if (linked.includes(betParticipantId)) out.push(rec);
    }
    offset = data.offset;
  } while (offset);
  return out;
}

export async function getScratchCardById(
  id: string
): Promise<AirtableRecord<ScratchCardFields> | null> {
  try {
    return await airtableFetch<AirtableRecord<ScratchCardFields>>(
      `/${env.airtableBaseId}/${env.airtableScratchCardsTableId}/${id}`
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes(" 404 ")) return null;
    throw err;
  }
}

export async function updateScratchCard(
  id: string,
  fields: Record<string, unknown>
): Promise<void> {
  await airtableFetch(
    `/${env.airtableBaseId}/${env.airtableScratchCardsTableId}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ fields, typecast: true }),
    }
  );
}

// List every bet participant with the numbers the leaderboard needs.
// Chip balance comes from the Chip Balance formula field (correct).
// Minutes are summed from the reps table per participant, because the
// Total Bet Minutes rollup can be misconfigured / lag.
export type LeaderboardRow = {
  id: string;
  name: string;
  chipBalance: number;
  minutes: number;
};

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  // 1. Pull all bet participants.
  const participants: AirtableRecord<BetParticipantFields>[] = [];
  let offset: string | undefined;
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (offset) params.set("offset", offset);
    const data = await airtableFetch<AirtableListResponse<BetParticipantFields>>(
      `/${env.airtableBaseId}/${env.airtableBetParticipantsTableId}?${params.toString()}`
    );
    participants.push(...data.records);
    offset = data.offset;
  } while (offset);

  // 2. Pull every bet rep once, bucket minutes by participant id.
  const minutesById = new Map<string, number>();
  let repOffset: string | undefined;
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (repOffset) params.set("offset", repOffset);
    const data = await airtableFetch<AirtableListResponse<RepFields>>(
      `/${env.airtableBaseId}/${env.airtableRepsTableId}?${params.toString()}`
    );
    for (const rec of data.records) {
      const linked = (rec.fields["Bet Participant"] as string[] | undefined) ?? [];
      const mins = rec.fields["Minutes Spent"] ?? 0;
      for (const pid of linked) {
        minutesById.set(pid, (minutesById.get(pid) ?? 0) + mins);
      }
    }
    repOffset = data.offset;
  } while (repOffset);

  // 3. Build rows.
  const rows: LeaderboardRow[] = participants.map((rec) => {
    const f = rec.fields as Record<string, unknown>;
    const name =
      (f["Bet Participant"] as string) ||
      `${f["First Name"] ?? ""} ${f["Last Name"] ?? ""}`.trim() ||
      "Anonymous";
    return {
      id: rec.id,
      name,
      chipBalance: typeof f["Chip Balance"] === "number" ? (f["Chip Balance"] as number) : 0,
      minutes: minutesById.get(rec.id) ?? 0,
    };
  });

  // 4. Sort: chips desc, then minutes desc.
  rows.sort((a, b) => {
    if (b.chipBalance !== a.chipBalance) return b.chipBalance - a.chipBalance;
    return b.minutes - a.minutes;
  });

  return rows;
}

// Update a Bet Participant record (status, hit-100 timestamp, etc.)
export async function updateBetParticipant(
  id: string,
  fields: Record<string, unknown>
): Promise<void> {
  await airtableFetch(
    `/${env.airtableBaseId}/${env.airtableBetParticipantsTableId}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ fields, typecast: true }),
    }
  );
}
