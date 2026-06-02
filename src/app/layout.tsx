import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { isLandingPublic } from "@/lib/betTiming";
import { LEAD_SOURCE_SCRIPT } from "@/lib/leadSourceScript";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const SITE_URL = "https://chips.zoedew.com";

// Dynamic metadata: before 8 June, the link preview teases the launch.
// After, it shows the real landing copy. Both reference /api/og as the
// share image, which is itself date-aware.
export function generateMetadata(): Metadata {
  const teaser = !isLandingPublic();

  const title = teaser
    ? "The 100 Minute Bet — coming 8 June"
    : "The 100 Minute Bet — chips.zoedew.com";

  const description = teaser
    ? "The house opens 8 June. A week-long bet for online business owners. Zoe Dew."
    : "A week-long bet for online business owners. 100 minutes of sales activity. 22 - 29 June 2026. Casino party on the 29th. The 100 Reps Club cart opens at the end of it.";

  const ogTitle = teaser
    ? "The 100 Minute Bet"
    : "The 100 Minute Bet";

  const ogDescription = teaser
    ? "The house opens 8 June."
    : "Spend 100 minutes on sales activity this week. Get a positive conversation out of it that leads somewhere, or I'll work out why with you on a call.";

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: SITE_URL,
      type: "website",
      images: [
        {
          url: "/api/og",
          width: 1200,
          height: 630,
          alt: "The 100 Minute Bet",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ["/api/og"],
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={bricolage.variable}>
      <head>
        {/* Lead-source tracker. Runs before any other client code, sets
            cb_* cookies under .zoedew.com so attribution is shared with
            the main WordPress site. Reads referrer + UTM + click IDs. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: LEAD_SOURCE_SCRIPT }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
