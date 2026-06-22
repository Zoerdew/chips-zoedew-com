import { NextResponse } from "next/server";
import { getBetTotals } from "@/lib/betTotals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, unauthenticated cumulative totals for the landing-page tracker.
// Sums minutes and money across every bet rep. Cheap enough to compute per
// request; the client polls it on a light interval.
export async function GET() {
  try {
    const totals = await getBetTotals();
    return NextResponse.json(
      { ok: true, ...totals },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
