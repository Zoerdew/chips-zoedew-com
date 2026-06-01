import { EarlyAccessClient } from "@/components/EarlyAccessClient";

// Early-access page for 100 Reps Club members. Lives at /early.
// Password gated client-side. The /api/register route ALSO checks the
// password header server-side before the public launch date.
//
// Set NEXT_PUBLIC_EARLY_ACCESS_PASSWORD on Vercel. It's NEXT_PUBLIC so
// the client can compare typed input against it (it's a shared, low-stakes
// password; if you need real auth, swap this for a token).

export const dynamic = "force-dynamic";

export default function EarlyAccessPage() {
  const password = process.env.NEXT_PUBLIC_EARLY_ACCESS_PASSWORD ?? "";
  return <EarlyAccessClient password={password} />;
}
