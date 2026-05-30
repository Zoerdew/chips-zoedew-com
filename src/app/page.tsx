import { HoldingPage } from "@/components/HoldingPage";
import { LandingPage } from "@/components/LandingPage";
import { betTimingISO, isLandingPublic } from "@/lib/betTiming";

// Don't statically cache: the gate flips on the date the page is served,
// not the date the page was built.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  if (!isLandingPublic()) {
    return <HoldingPage opensAtISO={betTimingISO.landingOpensAt} />;
  }
  return <LandingPage />;
}
