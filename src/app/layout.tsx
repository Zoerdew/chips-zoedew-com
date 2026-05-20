import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The 100 Minute Bet — chips.zoedew.com",
  description:
    "A week-long bet for online business owners. 100 minutes of sales activity. 22 - 29 June 2026. Casino party on the 29th. The 100 Reps Club cart opens at the end of it.",
  openGraph: {
    title: "The 100 Minute Bet",
    description:
      "Spend 100 minutes on sales activity this week. Get a positive conversation out of it that leads somewhere, or I'll work out why with you on a call.",
    url: "https://chips.zoedew.com",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={bricolage.variable}>
      <body>{children}</body>
    </html>
  );
}
