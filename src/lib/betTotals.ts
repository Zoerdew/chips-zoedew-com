import { env } from "./env";

// Standalone aggregate for the public landing-page scoreboard. Self-contained
// (its own Airtable fetch) so it doesn't depend on the larger airtable.ts.

const API_BASE = "https://api.airtable.com/v0";

type RepFields = {
  "Minutes Spent"?: number;
  "Money Made"?: number;
  "Bet Participant"?: string[];
};
type AirtableRecord<T> = { id: string; createdTime: string; fields: T };
type AirtableListResponse<T> = {
  records: AirtableRecord<T>[];
  offset?: string;
};

export type BetTotals = {
  minutes: number;
  money: number;
  players: number;
  hit100: number;
};

export async function getBetTotals(): Promise<BetTotals> {
  let minutes = 0;
  let money = 0;
  const minutesByParticipant = new Map<string, number>();

  let offset: string | undefined;
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (offset) params.set("offset", offset);
    const res = await fetch(
      `${API_BASE}/${env.airtableBaseId}/${env.airtableRepsTableId}?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${env.airtableApiKey}` },
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`Airtable ${res.status}`);
    const data = (await res.json()) as AirtableListResponse<RepFields>;
    for (const rec of data.records) {
      const linked = rec.fields["Bet Participant"] ?? [];
      if (linked.length === 0) continue;
      const mins = rec.fields["Minutes Spent"] ?? 0;
      const made = rec.fields["Money Made"] ?? 0;
      minutes += mins;
      money += made;
      for (const pid of linked) {
        minutesByParticipant.set(
          pid,
          (minutesByParticipant.get(pid) ?? 0) + mins
        );
      }
    }
    offset = data.offset;
  } while (offset);

  let hit100 = 0;
  for (const m of minutesByParticipant.values()) if (m >= 100) hit100 += 1;

  return { minutes, money, players: minutesByParticipant.size, hit100 };
}
