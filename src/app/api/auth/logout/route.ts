import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { env } from "@/lib/env";

export const runtime = "nodejs";

function clearedSession(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

export async function POST() {
  // The logout button is a plain HTML form POST, so the browser follows
  // the response as a navigation. Redirect to the login page rather than
  // returning JSON (which would render as a blank/raw page).
  return clearedSession(
    NextResponse.redirect(`${env.siteUrl}/portal/login`, { status: 303 })
  );
}

export async function GET() {
  return clearedSession(
    NextResponse.redirect(`${env.siteUrl}/portal/login`, { status: 303 })
  );
}
