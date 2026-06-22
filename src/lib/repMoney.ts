import { env } from "./env";

// Writes the "Money Made" amount onto a rep after it's created. Kept separate
// from airtable.ts so the sale-amount feature is self-contained.

const API_BASE = "https://api.airtable.com/v0";

export async function setRepMoney(
  repId: string,
  moneyMade: number
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/${env.airtableBaseId}/${env.airtableRepsTableId}/${repId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${env.airtableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: { "Money Made": moneyMade },
        typecast: true,
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status} setting Money Made: ${text}`);
  }
}
